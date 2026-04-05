import { HttpException, HttpStatus } from "@nestjs/common";
import { logger } from "@/services";

/**
 * Регулярное выражение для поиска плейсхолдеров вида `{key}`.
 * @constant {RegExp}
 */
const PLACEHOLDER_PATTERN = /\{([^}]+)\}/g;

/**
 * Тип, описывающий объект с данными для подстановки вместо плейсхолдеров.
 * Все ключи должны присутствовать, значения — строки.
 *
 * @template Placeholders - Массив строковых ключей (например, `['name', 'id']`).
 * @example
 * type MyPlaceholders = ['user', 'action'];
 * const data: PlaceholderObject<MyPlaceholders> = { user: 'Alice', action: 'login' };
 */
type PlaceholderObject<Placeholders extends string[]> = {
  [P in Placeholders[number]]: string;
};

/**
 * Тип, преобразующий запись шаблонов ошибок в запись соответствующих `BadError` инстансов.
 * @template Errors - Запись, где ключи — имена ошибок, значения — `ErrorTemplate<string[]>`.
 * @internal
 */
type BadErrors<Errors extends Record<string, ErrorTemplate<string[]>>> = {
  [P in keyof Errors]: BadError<Errors[P]["placeholders"]>;
};

/**
 * Шаблон ошибки, содержащий сообщение, описание, список плейсхолдеров и опциональные поля.
 *
 * @template Placeholders - Массив строк, перечисляющих все используемые плейсхолдеры (например, `['id', 'name']`).
 * @interface ErrorTemplate
 * @property {string} message - Текст сообщения об ошибке. Может содержать плейсхолдеры вида `{key}`.
 * @property {string} description - Подробное описание ошибки. Тоже может содержать плейсхолдеры.
 * @property {unknown} [cause] - Первопричина ошибки. Если это строка, в ней также будут заменены плейсхолдеры.
 * @property {HttpStatus} [status] - HTTP статус ответа. По умолчанию `500 Internal Server Error`.
 * @property {Record<string, unknown>} [options] - Дополнительные опции, передаваемые в конструктор `HttpException`.
 * @property {Placeholders} placeholders - Массив всех возможных ключей плейсхолдеров, используемых в шаблоне.
 *
 * @example
 * const template: ErrorTemplate<['entity', 'id']> = {
 *   message: '{entity} with id {id} not found',
 *   description: 'The {entity} record identified by {id} does not exist',
 *   status: HttpStatus.NOT_FOUND,
 *   placeholders: ['entity', 'id']
 * };
 */
interface ErrorTemplate<Placeholders extends string[]> {
  message: string;
  description: string;
  cause?: unknown;
  status?: HttpStatus;
  options?: Record<string, unknown>;
  placeholders: Placeholders;
}

/** Карта ключ-плейсхолдер → регулярное выражение для замены. */
type PlaceholderRegexMap<Placeholders extends string[]> = Map<
  keyof PlaceholderObject<Placeholders>,
  RegExp
>;

/** Шаблон ошибки после замены всех плейсхолдеров (плейсхолдеры отсутствуют). */
type FormattedErrorTemplate = ErrorTemplate<[]>;

/**
 * Класс, представляющий конкретную ошибку с возможностью динамической подстановки плейсхолдеров.
 *
 * @template Placeholders - Массив строковых ключей, которые должны быть заменены (например, `['userId', 'role']`).
 *
 * @example
 * // Создание ошибки с плейсхолдерами
 * const error = new BadError({
 *   message: 'User {userId} has no permission for {action}',
 *   description: 'Access denied for user {userId} to perform {action}',
 *   status: HttpStatus.FORBIDDEN,
 *   placeholders: ['userId', 'action']
 * });
 *
 * // Получение объекта исключения
 * const exception = error.execute({ userId: '123', action: 'delete' });
 *
 * // Или сразу выбросить
 * error.throw({ userId: '123', action: 'delete' });
 *
 * // Статическое исключение (без замен)
 * throw error.exception; // или error.throwStatic()
 */
export class BadError<Placeholders extends string[]> {
  /**
   * Карта, сопоставляющая каждый ключ плейсхолдера с регулярным выражением для его замены.
   */
  private readonly placeholderRegexes: PlaceholderRegexMap<Placeholders>;

  /**
   * Создаёт экземпляр `BadError`.
   *
   * @param {ErrorTemplate<Placeholders>} template - Шаблон ошибки с сообщением, описанием и опциями.
   * @throws {Error} Если в шаблоне есть несоответствия между `placeholders` и фактическими плейсхолдерами в тексте.
   */
  public constructor(public readonly template: ErrorTemplate<Placeholders>) {
    this.placeholderRegexes = this.extractPlaceholders(template);
  }

  /**
   * Возвращает объект HTTP исключения с подстановкой данных.
   * Если передан пустой объект `placeholders`, возвращается статическое исключение (без замен).
   *
   * @param {PlaceholderObject<Placeholders>} placeholders - Объект с данными для замены плейсхолдеров.
   * @param {unknown} [cause] - Дополнительная причина ошибки (будет передана в `HttpException`).
   * @returns {HttpException} Готовый объект исключения (не выброшенный).
   *
   * @example
   * const exception = badError.execute({ userId: '123' });
   * throw exception;
   */
  public execute(
    placeholders: PlaceholderObject<Placeholders>,
    cause?: unknown,
  ): HttpException {
    const keys = Object.keys(placeholders);
    if (keys.length === 0) {
      return this.createStaticException(cause);
    }

    return this.createDynamicException(placeholders, cause);
  }

  /**
   * Немедленно выбрасывает HTTP исключение с подстановкой данных.
   * Является альтернативой `execute()`, но выбрасывает, а не возвращает.
   *
   * @param {PlaceholderObject<Placeholders>} placeholders - Данные для замены плейсхолдеров.
   * @param {unknown} [cause] - Дополнительная причина.
   * @throws {HttpException} Всегда выбрасывает исключение.
   * @returns {never}
   *
   * @example
   * badError.throw({ userId: '123' }, new Error('User not found'));
   */
  public throw(
    placeholders: PlaceholderObject<Placeholders>,
    cause?: unknown,
  ): never {
    throw this.execute(placeholders, cause);
  }

  /**
   * Возвращает статическое исключение (без замены плейсхолдеров).
   * Плейсхолдеры в сообщении остаются нетронутыми.
   *
   * @param {unknown} [cause] - Дополнительная причина.
   * @returns {HttpException} Статический объект исключения.
   *
   * @example
   * const exception = badError.executeStatic();
   * throw exception;
   */
  public executeStatic(cause?: unknown): HttpException {
    return this.createStaticException(cause);
  }

  /**
   * Немедленно выбрасывает статическое исключение (без замены плейсхолдеров).
   *
   * @param {unknown} [cause] - Дополнительная причина.
   * @throws {HttpException} Всегда выбрасывает исключение.
   * @returns {never}
   *
   * @example
   * badError.throwStatic();
   */
  public throwStatic(cause?: unknown): never {
    throw this.executeStatic(cause);
  }

  /**
   * Геттер, возвращающий статическое исключение (без замены).
   * Позволяет использовать синтаксис `throw badError.exception`.
   *
   * @returns {HttpException} Статический объект исключения.
   *
   * @example
   * throw badError.exception;
   */
  public get exception(): HttpException {
    return this.createStaticException();
  }

  /**
   * Создаёт статическое исключение (без подстановки данных).
   * @param {unknown} [cause] - Причина ошибки.
   * @returns {HttpException}
   */
  private createStaticException(cause?: unknown): HttpException {
    return this.createHttpException(
      {
        ...this.template,
        placeholders: [],
      },
      cause,
    );
  }

  /**
   * Создаёт динамическое исключение, заменяя плейсхолдеры в шаблоне.
   * @param {PlaceholderObject<Placeholders>} placeholders - Данные для замены.
   * @param {unknown} [cause] - Причина ошибки.
   * @returns {HttpException}
   */
  private createDynamicException(
    placeholders: PlaceholderObject<Placeholders>,
    cause?: unknown,
  ): HttpException {
    const error = this.formatTemplate(placeholders);
    return this.createHttpException(error, cause);
  }

  /**
   * Выполняет замену плейсхолдеров в сообщении, описании и причине (если причина — строка).
   * Если значение для плейсхолдера отсутствует (равно `undefined`), выводит ошибку в логгер
   * и пропускает замену для этого ключа.
   *
   * @param {PlaceholderObject<Placeholders>} placeholders - Объект с данными.
   * @returns {FormattedErrorTemplate} Новый шаблон ошибки с заменёнными значениями.
   */
  private formatTemplate(
    placeholders: PlaceholderObject<Placeholders>,
  ): FormattedErrorTemplate {
    let message = this.template.message;
    let description = this.template.description;
    let cause =
      typeof this.template.cause === "string" ? this.template.cause : undefined;

    for (const [key, regex] of this.placeholderRegexes.entries()) {
      const value = placeholders[key];
      if (value === undefined) {
        logger.error(new Error(`Placeholder {${key}} not provided in data`));
        continue;
      }

      message = message.replace(regex, value);
      description = description.replace(regex, value);
      if (cause) {
        cause = cause.replace(regex, value);
      }
    }

    return {
      ...this.template,
      message,
      description,
      cause: cause ?? this.template.cause ?? undefined,
      placeholders: [],
    };
  }

  /**
   * Создаёт экземпляр `HttpException` на основе шаблона ошибки и дополнительной причины.
   * HTTP-статус определяется из переданного шаблона, затем из исходного шаблона, либо используется `500`.
   *
   * @param {FormattedErrorTemplate} error - Шаблон ошибки после подстановки (плейсхолдеры отсутствуют).
   * @param {unknown} [cause] - Дополнительная причина (имеет приоритет над `error.cause`).
   * @returns {HttpException}
   */
  private createHttpException(
    error: FormattedErrorTemplate,
    cause?: unknown,
  ): HttpException {
    const status =
      error.status ?? this.template.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    return new HttpException(error.message, status, {
      description: error.description,
      cause: cause ?? error.cause,
      ...error.options,
    });
  }

  /**
   * Извлекает все плейсхолдеры из текста шаблона.
   * @param template - Шаблон ошибки.
   * @returns Множество уникальных ключей плейсхолдеров, найденных в тексте.
   */
  private collectPlaceholdersFromText(
    template: ErrorTemplate<Placeholders>,
  ): Set<string> {
    const cause = typeof template.cause === "string" ? template.cause : "";
    const text = `${template.message} ${template.description} ${cause}`;

    const placeholdersSet = new Set<string>();
    for (const match of text.matchAll(PLACEHOLDER_PATTERN)) {
      placeholdersSet.add(match[1]);
    }

    return placeholdersSet;
  }

  /**
   * Проверяет соответствие между найденными плейсхолдерами и заявленными в шаблоне.
   * @param collectedPlaceholders - Множество найденных в тексте ключей.
   * @param declaredPlaceholders - Массив заявленных ключей (может быть undefined).
   * @throws {Error} Если есть несоответствия.
   */
  private validatePlaceholders(
    collectedPlaceholders: Set<string>,
    declaredPlaceholders?: readonly string[],
  ): void {
    if (!declaredPlaceholders) {
      return;
    }

    const errors: Error[] = [];

    for (const placeholder of declaredPlaceholders) {
      if (collectedPlaceholders.has(placeholder)) {
        continue;
      }

      errors.push(new Error(`Placeholder "${placeholder}" not found in text`));
    }

    for (const key of collectedPlaceholders) {
      if (declaredPlaceholders.includes(key)) {
        continue;
      }

      errors.push(
        new Error(
          `Placeholder from text "${key}" not found in placeholders list`,
        ),
      );
    }

    if (errors.length !== 0) {
      errors.forEach((error) => logger.error(error));
      throw new Error("Placeholder validation failed.");
    }
  }

  /**
   * Создаёт карту регулярных выражений для замены плейсхолдеров.
   * @param keys - Массив ключей плейсхолдеров.
   * @returns Карта ключ → RegExp.
   */
  private buildRegexMap(keys: Set<string>): PlaceholderRegexMap<Placeholders> {
    const regexMap: PlaceholderRegexMap<Placeholders> = new Map();
    for (const key of keys) {
      regexMap.set(key, this.createRegEx(key));
    }

    return regexMap;
  }

  private extractPlaceholders(
    template: ErrorTemplate<Placeholders>,
  ): PlaceholderRegexMap<Placeholders> {
    const collectedPlaceholders = this.collectPlaceholdersFromText(template);
    this.validatePlaceholders(collectedPlaceholders, template.placeholders);
    return this.buildRegexMap(collectedPlaceholders);
  }

  /**
   * Создаёт регулярное выражение для поиска плейсхолдера вида `{key}`,
   * экранируя специальные символы в ключе.
   *
   * @param {string} key - Ключ плейсхолдера (например, `user.id`).
   * @returns {RegExp} Регулярное выражение вида `/\{user\.id\}/`.
   */
  private createRegEx(key: string): RegExp {
    const cleanKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\{${cleanKey}\\}`);
  }
}

/**
 * Фабричный класс, создающий набор предопределённых ошибок (`BadError`) с автоматически
 * сгенерированными кодами на основе префикса.
 *
 * Каждая ошибка получает уникальный код в формате: `base64url(prefix):hex(${key}:${index})`,
 * который добавляется в начало сообщения. Это позволяет легко идентифицировать тип ошибки по коду.
 *
 * @template Errors - Запись, сопоставляющая имена ошибок с их шаблонами (должна содержать поле `placeholders`).
 *
 * @example
 * const errors = new ErrorConstructor('AUTH', {
 *   INVALID_TOKEN: {
 *     message: 'Invalid token provided',
 *     description: 'The authentication token is malformed or expired',
 *     status: HttpStatus.UNAUTHORIZED,
 *     placeholders: []
 *   },
 *   USER_NOT_FOUND: {
 *     message: 'User {userId} not found',
 *     description: 'No user with id {userId} exists',
 *     status: HttpStatus.NOT_FOUND,
 *     placeholders: ['userId']
 *   }
 * } as const).execute(); // или .errors
 *
 * // Использование
 * throw errors.INVALID_TOKEN.exception;
 * throw errors.USER_NOT_FOUND.execute({ userId: '123' });
 * errors.USER_NOT_FOUND.throw({ userId: '123' });
 */
export class ErrorConstructor<
  Errors extends Record<string, ErrorTemplate<string[]>>,
> {
  /**
   * Объект, содержащий все созданные экземпляры `BadError`.
   * Ключи соответствуют ключам из `Errors`.
   *
   * @type {BadErrors<Errors>}
   */
  public readonly errors: BadErrors<Errors>;

  /**
   * Создаёт экземпляр `ErrorConstructor`.
   *
   * @param {string} prefix - Строка, используемая для генерации уникального кода ошибки (будет закодирована в base64url).
   * @param {Errors} templates - Объект, сопоставляющий имена ошибок с их шаблонами.
   *
   * @example
   * const errorFactory = new ErrorConstructor('MYAPP', {
   *   DB_ERROR: { message: 'Database error', description: '...', placeholders: [] }
   * });
   */
  public constructor(
    public readonly prefix: string,
    private readonly templates: Errors,
  ) {
    this.errors = this.execute();
  }

  /**
   * Генерирует все ошибки, добавляя к сообщению каждой уникальный код.
   * Вызывается автоматически в конструкторе.
   *
   * @returns {BadErrors<Errors>} Объект с ошибками, где каждое сообщение дополнено кодом.
   *
   * @example
   * const allErrors = errorConstructor.execute();
   * throw allErrors.SOME_ERROR.exception;
   */
  public execute(): BadErrors<Errors> {
    const keys = Object.keys(this.templates);
    const entries = keys.map((key) => {
      const code = this.generateCode(key, keys.indexOf(key as string));
      const template = this.templates[key];
      const prefixedTemplate: ErrorTemplate<string[]> = {
        ...template,
        message: `${code} : ${template.message}`,
      };

      const badError = new BadError(prefixedTemplate);

      logger.execute(
        `Загрузка ошибки ${this.prefix} ${code} : ${template.message}`,
      );

      return [key, badError];
    });

    return Object.fromEntries(entries);
  }

  /**
   * Генерирует уникальный код для ошибки на основе префикса, имени ключа и его индекса.
   * Формат: `base64url(prefix):hex(${key}:${index})`.
   *
   * @param {keyof Errors} key - Имя ошибки (например, 'USER_NOT_FOUND').
   * @param {number} index - Индекс ключа в массиве `Object.keys(templates)`.
   * @returns {string} Уникальный строковый код.
   */
  private generateCode(key: keyof Errors, index: number): string {
    const prefixEncoded = Buffer.from(this.prefix).toString("base64url");
    const suffix = Buffer.from(`${String(key)}:${index}`).toString("hex");

    return `${prefixEncoded}:${suffix}`;
  }
}

export default ErrorConstructor;
