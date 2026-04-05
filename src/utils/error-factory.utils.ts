import type { LoggerService } from "@/services";
import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * Регулярное выражение для поиска плейсхолдеров вида `${{ key }}`.
 * Используется для извлечения ключей из строковых шаблонов.
 */
const PLACEHOLDER_PATTERN = /\$\{\{\s{1}([^}\s]+)\s{1}\}\}/g;

/**
 * Объект, содержащий значения для подстановки вместо плейсхолдеров.
 * @template Placeholders - Массив строковых ключей (например, `['userId', 'role']`).
 * @example
 * // Для Placeholders = ['userId', 'role']
 * type Data = PlaceholderObject<['userId', 'role']>; // { userId: string; role: string }
 */
type PlaceholderObject<Placeholders extends string[]> = {
  [P in Placeholders[number]]: string;
};

/**
 * Рекурсивный тип, извлекающий все ключи плейсхолдеров из строки в кортеж.
 * Проходит по строке, находит каждое вхождение `${{ key }}` и добавляет `key` в аккумулятор.
 * Дубликаты сохраняются, порядок соответствует порядку появления в строке.
 * @template InputString - Исходная строка.
 * @template Acc - Аккумулятор кортежа (по умолчанию []).
 * @example
 * type Keys = ExtractPlaceholdersTuple<"Hello {name}, your id is {id}">; // ['name', 'id']
 */
type ExtractPlaceholdersTuple<InputString extends string, Acc extends string[] = []> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  InputString extends `${infer _}\${{ ${infer P} }}${infer Rest}`
    ? ExtractPlaceholdersTuple<Rest, [...Acc, P]>
    : Acc;

/**
 * Вычисляет кортеж плейсхолдеров, объединяя поля `message` и `description` шаблона.
 * @template T - Объект с обязательными полями `message` и `description`.
 * @example
 * type Template = { message: "User {userId}", description: "Action {action}" };
 * type Placeholders = InferPlaceholders<Template>; // ['userId', 'action']
 */
type InferPlaceholders<T extends { message: string; description: string }> =
  ExtractPlaceholdersTuple<`${T['message']} ${T['description']}`>;

/**
 * Входной формат описания ошибки без автоматически вычисляемого поля `placeholders`.
 * Используется при создании фабрики ошибок.
 */
type ErrorTemplateInput = {
  /** Текст сообщения об ошибке (может содержать плейсхолдеры `${{ key }}`). */
  message: string;
  /** Подробное описание ошибки (может содержать плейсхолдеры `${{ key }}`). */
  description: string;
  /** Дополнительная причина ошибки (если строка, в ней тоже могут быть плейсхолдеры). */
  cause?: Error;
  /** HTTP статус-код (по умолчанию 500). */
  status?: HttpStatus;
  /** Дополнительные опции для HttpException. */
  options?: Record<string, unknown>;
};

/**
 * Внутренний шаблон ошибки, где поле `placeholders` выводится автоматически из `message` и `description`.
 * @template Placeholders - Кортеж ключей плейсхолдеров.
 */
interface ErrorTemplate<Placeholders extends string[]> {
  message: string;
  description: string;
  cause?: Error;
  status?: HttpStatus;
  options?: Record<string, unknown>;
  placeholders: Placeholders;
}

/** Карта ключ → регулярное выражение для замены плейсхолдера в строке. */
type PlaceholderRegexMap<Placeholders extends string[]> = Map<
  keyof PlaceholderObject<Placeholders>,
  RegExp
>;

/** Шаблон после замены всех плейсхолдеров (плейсхолдеры отсутствуют). */
type FormattedErrorTemplate = ErrorTemplate<[]>;

/** Преобразует запись входных шаблонов в запись экземпляров `BadError`. */
type BadErrors<T extends Record<string, ErrorTemplateInput>> = {
  [K in keyof T]: BadError<InferPlaceholders<T[K]>>
};

/**
 * Класс, представляющий конкретную ошибку с возможностью динамической подстановки плейсхолдеров.
 * @template Placeholders - Кортеж ключей плейсхолдеров (например, `['userId', 'action']`).
 *
 * @example
 * const error = new BadError({
 *   message: 'User {userId} not found',
 *   description: 'No user with id {userId} exists',
 *   placeholders: ['userId']
 * }, logger);
 *
 * // Подстановка значений
 * throw error.throw({ userId: '123' });
 *
 * // Статическое исключение (без подстановки)
 * throw error.exception;
 */
export class BadError<const Placeholders extends string[]> {
  private readonly placeholderRegexes: PlaceholderRegexMap<Placeholders>;

  /**
   * Создаёт экземпляр BadError.
   * @param template - Шаблон ошибки (должен содержать корректный массив `placeholders`).
   * @param logger - Экземпляр логгера (должен соответствовать интерфейсу LoggerService).
   * @throws {Error} Если объявленные в `placeholders` ключи не соответствуют реально найденным в тексте.
   */
  public constructor(
    public readonly template: ErrorTemplate<Placeholders>,
    private readonly logger: LoggerService,
  ) {
    this.placeholderRegexes = this.extractPlaceholders(template);
  }

  public execute(placeholders: PlaceholderObject<Placeholders>, cause?: Error): HttpException;
  public execute(cause?: Error): HttpException;
  /**
   * Возвращает объект HTTP исключения с подстановкой данных.
   * Если передан пустой объект `placeholders`, возвращается статическое исключение (без замен).
   *
   * @param placeholdersOrCause - Объект с значениями для замены плейсхолдеров.
   * @param cause - Дополнительная причина ошибки (будет передана в HttpException).
   * @returns Экземпляр HttpException с подставленными значениями.
   *
   * @example
   * const error = new BadError({ message: 'Hello {name}', description: '' }, logger);
   * const exception = error.execute({ name: 'World' });
   * throw exception;
   */
  public execute(
    placeholdersOrCause?: PlaceholderObject<Placeholders> | Error,
    cause?: Error,
  ): HttpException {
    let placeholders: PlaceholderObject<Placeholders> | undefined = undefined;
    let actualCause: Error | undefined;

    if (placeholdersOrCause instanceof Error) {
      actualCause = placeholdersOrCause;
    } else {
      placeholders = placeholdersOrCause;
      actualCause = cause;
    }

    if (!placeholders || Object.keys(placeholders).length === 0) {
      return this.createStaticException(actualCause);
    }

    return this.createDynamicException(placeholders, actualCause);
  }

  public throw(placeholders: PlaceholderObject<Placeholders>, cause?: Error): never;
  public throw(cause?: Error): never;
  /**
   * Немедленно выбрасывает исключение с подстановкой данных.
   * @param placeholders - Объект с значениями для замены плейсхолдеров.
   * @param cause - Дополнительная причина ошибки.
   * @throws {HttpException} Всегда выбрасывает HttpException.
   */
  public throw(placeholdersOrCause?: PlaceholderObject<Placeholders> | Error, cause?: Error): never {
    if (placeholdersOrCause instanceof Error) {
      throw this.execute(placeholdersOrCause);
    }
    
    throw this.execute(placeholdersOrCause as PlaceholderObject<Placeholders>, cause);
  }

  private createStaticException(cause?: Error): HttpException {
    return this.createHttpException(
      { ...this.template, placeholders: [] },
      cause,
    );
  }

  private createDynamicException(
    placeholders: PlaceholderObject<Placeholders>,
    cause?: Error,
  ): HttpException {
    const error = this.formatTemplate(placeholders);
    return this.createHttpException(error, cause);
  }

  private formatTemplate(placeholders: PlaceholderObject<Placeholders>): FormattedErrorTemplate {
    let message = this.template.message;
    let description = this.template.description;

    for (const [key, regex] of this.placeholderRegexes.entries()) {
      const value = placeholders[key];
      if (value === undefined) {
        this.logger.error(new Error(`Placeholder {${key}} not provided in data`));
        continue;
      }
      
      message = message.replace(regex, value);
      description = description.replace(regex, value);
    }

    return {
      ...this.template,
      message,
      description,
      placeholders: [],
    };
  }

  private createHttpException(error: FormattedErrorTemplate, cause?: Error): HttpException {
    const status = error.status ?? this.template.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    return new HttpException(error.message, status, {
      description: error.description,
      cause: cause ?? error.cause,
      ...error.options,
    });
  }

  private collectPlaceholdersFromText(template: ErrorTemplate<Placeholders>): Set<Placeholders[number]> {
    const text = `${template.message} ${template.description}`;
    const set = new Set<Placeholders[number]>();
    for (const match of text.matchAll(PLACEHOLDER_PATTERN)) {
      set.add(match[1] as Placeholders[number]);
    }
    return set;
  }

  private validatePlaceholders(
    collectedPlaceholders: Set<string>,
    declaredPlaceholders?: readonly string[],
  ): void {
    if (!declaredPlaceholders) {
      return;
    };

    const errors: Error[] = [];
    for (const placeholder of declaredPlaceholders) {
      if (collectedPlaceholders.has(placeholder)) {
        continue;
      }

      errors.push(new Error(`Placeholder "${placeholder}" not found in text`));
    }

    for (const placeholder of collectedPlaceholders) {
      if (declaredPlaceholders.includes(placeholder)) {
        continue;
      }

      errors.push(new Error(`Placeholder from text "${placeholder}" not found in placeholders list`));
    }

    if (errors.length !== 0) {
      errors.forEach((e) => this.logger.error(e));
      throw new Error("Placeholder validation failed.");
    }
  }

  private buildRegexMap(keys: Set<Placeholders[number]>): PlaceholderRegexMap<Placeholders> {
    const placeholdersMap: PlaceholderRegexMap<Placeholders> = new Map();
    for (const key of keys) {
      placeholdersMap.set(key, this.createRegEx(key));
    }

    return placeholdersMap;
  }

  private extractPlaceholders(template: ErrorTemplate<Placeholders>): PlaceholderRegexMap<Placeholders> {
    const collected = this.collectPlaceholdersFromText(template);
    this.validatePlaceholders(collected, template.placeholders);
    return this.buildRegexMap(collected);
  }

  private createRegEx(key: string): RegExp {
    const clean = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\$\\{\\{\\s{1}${clean}\\s{1}\\}\\}`);
  }
}

/**
 * Фабричный класс, создающий набор предопределённых ошибок с автоматически сгенерированными кодами.
 * Каждой ошибке присваивается уникальный код формата `base64url(prefix):hex(key:index)`.
 * Плейсхолдеры извлекаются автоматически из полей `message` и `description`.
 *
 * @example
 * const factory = errorFactory.execute(logger);
 * const errors = factory.execute('AUTH', {
 *   INVALID_TOKEN: {
 *     message: 'Invalid token',
 *     description: 'The token is expired',
 *     status: HttpStatus.UNAUTHORIZED
 *   },
 *   USER_NOT_FOUND: {
 *     message: 'User {userId} not found',
 *     description: 'No user with id {userId} exists',
 *     status: HttpStatus.NOT_FOUND
 *   }
 * });
 *
 * // Статическое исключение (без плейсхолдеров)
 * throw errors.INVALID_TOKEN.exception;
 *
 * // Динамическое исключение с подстановкой
 * throw errors.USER_NOT_FOUND.execute({ userId: '123' });
 */
export class ErrorFactory {
  public constructor(private readonly logger: LoggerService) {}

  /**
   * Генерирует набор ошибок для указанного префикса и шаблонов.
   * Для каждого шаблона создаётся экземпляр `BadError` с автоматически вычисленными плейсхолдерами.
   *
   * @param prefix - Строка для генерации уникального кода (будет преобразована в base64url).
   * @param templates - Объект, где ключи — идентификаторы ошибок, значения — `ErrorTemplateInput`.
   * @returns Объект с экземплярами `BadError`, ключи соответствуют ключам входного объекта.
   *
   * @template T - Тип входных шаблонов.
   */
  public execute<const T extends Record<string, ErrorTemplateInput>>(
    prefix: string,
    templates: T,
  ): BadErrors<T> {
    const templateKeys = Object.keys(templates);
    const entries = templateKeys.map((key, index) => {
      const input = templates[key];
      const errorTemplate = this.defineError(input);
      const code = this.generateCode(prefix, key, index);
      this.logger.execute(`Загрузка ошибки ${prefix} ${code} : ${errorTemplate.message}`);
      
      const prefixed = { ...errorTemplate, message: `${code} : ${errorTemplate.message}` };
      return [key, new BadError(prefixed, this.logger)];
    });

    return Object.fromEntries(entries);
  }

  private generateCode(prefix: string, key: string, index: number): string {
    const prefixEncoded = Buffer.from(prefix).toString("base64url");
    const suffix = Buffer.from(`${key}:${index}`).toString("hex");
    return `${prefixEncoded}:${suffix}`;
  }

  private defineError<const Input extends ErrorTemplateInput>(error: Input): ErrorTemplate<InferPlaceholders<Input>> {
    const combined = `${error.message} ${error.description}`;
    
    const matches = combined.match(PLACEHOLDER_PATTERN);
    const allKeys = matches?.map((m) => m.slice(1, -1)) ?? [];
    const uniqueKeys = Array.from(new Set(allKeys)) as InferPlaceholders<Input>;

    return { ...error, placeholders: uniqueKeys };
  }
}

export default ErrorFactory;
