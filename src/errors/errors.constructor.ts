import { logger } from "@/services";
import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * Регулярное выражение для поиска плейсхолдеров вида `{key}`.
 */
const PLACEHOLDER_PATTERN = /\{([^}]+)\}/g;

/**
 * Тип, описывающий объект с данными для подстановки вместо плейсхолдеров.
 * Все ключи должны присутствовать, значения — строки.
 * @template Placeholders - Массив строковых ключей.
 */
type PlaceholderObject<Placeholders extends string[]> = {
  [P in Placeholders[number]]: string;
}

type BadErrors<Errors extends Record<string, ErrorTemplate<string[]>>> = {
  [P in keyof Errors]: BadError<Errors[P]["placeholders"]>
}

interface ErrorTemplate<Placeholders extends string[]> {
  message: string;
  description: string;
  cause?: unknown;
  status?: HttpStatus;
  options?: Record<string, unknown>;
  placeholders: Placeholders;
}

/**
 * Класс, представляющий конкретную ошибку с возможностью динамической подстановки плейсхолдеров.
 * @template Placeholders - Массив строковых ключей, которые должны быть заменены.
 */
export class BadError<Placeholders extends string[]> {
  private readonly placeholderRegexes: Map<keyof PlaceholderObject<Placeholders>, RegExp>;

  /**
   * Создаёт экземпляр `BadError`.
   * @param {ErrorTemplate} template - Шаблон ошибки с сообщением, описанием и опциями.
   */
  public constructor(
    public readonly template: ErrorTemplate<Placeholders>,
  ) {
    this.placeholderRegexes = this.extractPlaceholders(template);
  }

  /**
   * Основной метод для выброса исключения с подстановкой данных.
   * Если передан пустой объект данных, выбрасывается статическое исключение (без замен).
   * Иначе выполняется динамическая подстановка.
   * 
   * @throws {HttpException} Всегда выбрасывает HTTP-исключение.
   */
  public execute(placeholders: PlaceholderObject<Placeholders>, cause?: unknown): HttpException {
    const keys = Object.keys(placeholders);
    if (keys.length === 0) {
      return this.createStaticException(cause);
    }

    return this.createDynamicException(placeholders, cause);
  }

  /**
   * Выбрасывает исключение без замены плейсхолдеров (использует исходный шаблон).
   * @throws {HttpException} Всегда выбрасывает HTTP-исключение.
   */
  public executeStatic(cause?: unknown): HttpException {
    return this.createStaticException(cause);
  }

  /**
   * Создаёт статическое исключение (без подстановки данных).
   * @returns {HttpException}
   */
  public get exception(): HttpException {
    return this.createStaticException();
  }

  /**
   * Создаёт статическое исключение (без подстановки данных).
   * @returns {HttpException}
   */
  private createStaticException(cause?: unknown): HttpException {
    return this.createHttpException(this.template, cause);
  }

  /**
   * Создаёт динамическое исключение, заменяя плейсхолдеры в шаблоне.
   */
  private createDynamicException(placeholders: PlaceholderObject<Placeholders>, cause?: unknown): HttpException {
    const error = this.formatTemplate(placeholders);
    return this.createHttpException(error, cause);
  }

  /**
   * Выполняет замену плейсхолдеров в сообщении, описании и причине (если причина — строка).
   * Если значение для плейсхолдера отсутствует, выводит предупреждение в консоль и пропускает замену.
   * 
   * @returns {ErrorTemplate} Новый шаблон ошибки с заменёнными значениями.
   */
  private formatTemplate(placeholders: PlaceholderObject<Placeholders>): ErrorTemplate<Placeholders> {
    let message = this.template.message;
    let description = this.template.description;
    let cause = typeof this.template.cause === 'string' ? this.template.cause : undefined;

    for (const [key, regex] of this.placeholderRegexes.entries()) {
      const value = placeholders[key];
      if (value === undefined) {
        console.error(`Placeholder {${key}} not provided in data`);
        continue;
      }
      
      message = message.replace(regex, value);
      description = description.replace(regex, value);
      if (cause) {
        cause = cause.replace(regex, value);
      }
    }

    return {
      message,
      description,
      cause: cause ?? this.template.cause,
      status: this.template.status,
      options: this.template.options,
      placeholders: this.template.placeholders
    };
  }

  /**
   * Создаёт экземпляр `HttpException` на основе шаблона ошибки и дополнительной причины.
   * HTTP-статус определяется из шаблона, затем из исходного шаблона, либо используется `500`.
   * @param {ErrorTemplate} error - Шаблон ошибки (возможно, после подстановки).
   * @returns {HttpException}
   */
  private createHttpException(error: ErrorTemplate<Placeholders>, cause?: unknown): HttpException {
    const status = error.status ?? this.template.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    return new HttpException(error.message, status, {
      description: error.description,
      cause: cause ?? error.cause,
      ...error.options,
    });
  }

  /**
   * Извлекает все плейсхолдеры из шаблона ошибки и создаёт для них регулярные выражения.
   * Если передан список `placeholders`, проверяет, что каждый из них присутствует в шаблоне.
   * @param {ErrorTemplate} template - Шаблон ошибки.
   * @returns {Map<keyof PlaceholderObject<Placeholders>, RegExp>} Карта ключ → регулярное выражение.
   * @throws {Error} Если какой-либо плейсхолдер из списка `placeholders` отсутствует в шаблоне.
   */
  private extractPlaceholders(template: ErrorTemplate<Placeholders>): Map<keyof PlaceholderObject<Placeholders>, RegExp> {
    const placeholderRegexes = new Map();
    const cause = typeof template.cause === 'string' ? template.cause : '';
    const text = `${template.message} ${template.description} ${cause}`;
    
    let match;
    while ((match = PLACEHOLDER_PATTERN.exec(text)) !== null) {
      const matchData = match[1];
      const dataExists = placeholderRegexes.has(matchData);
      if (dataExists) {
        continue;
      }

      placeholderRegexes.set(matchData, new RegExp(`\\{${matchData}\\}`));
    }

    if (!this.template.placeholders) {
      return placeholderRegexes;
    }
    
    this.template.placeholders.forEach(placeholder => {
      if (placeholderRegexes.has(placeholder)) {
        return;
      };

      throw new Error(`${placeholder} in placeholders`);
    });
    
    return placeholderRegexes;
  }
}

/**
 * Фабричный класс, создающий набор предопределённых ошибок (`BadError`) с автоматически
 * сгенерированными кодами на основе префикса.
 * @template Errors - Тип, сопоставляющий имена ошибок с их шаблонами.
 */
export class ErrorConstructor<
  Errors extends Record<string, ErrorTemplate<string[]>>,
> {
  /**
   * Объект, содержащий все созданные экземпляры `BadError`.
   * Ключи соответствуют ключам из `Errors`.
   */
  public readonly errors: BadErrors<Errors>;

  /**
   * Создаёт экземпляр `ErrorConstructor`.
   * @param {string} prefix - Строка, используемая для генерации уникального кода ошибки.
   * @param {Errors} templates - Объект, сопоставляющий имена ошибок с их шаблонами.
   */
  public constructor(
    public readonly prefix: string,
    private readonly templates: {
      [P in keyof Errors]: Errors[P]
    },
  ) {
    this.errors = this.execute();
  }

  /**
   * Генерирует все ошибки, добавляя к сообщению каждой уникальный код.
   * @returns {BadErrors<Errors>} Объект с ошибками.
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

      logger.execute(`Загрузка ошибки ${this.prefix} ${code} : ${template.message}`);

      return [key, badError];
    });

    return Object.fromEntries(entries);
  }

  /**
   * Генерирует уникальный код для ошибки на основе префикса, имени ключа и его индекса.
   * Формат: `base64url(prefix):hex(${key}:${index})`.
   * @param {keyof Errors} key - Имя ошибки.
   * @param {number} index - Индекс ключа в массиве `Object.keys(templates)`.
   * @returns {string} Уникальный строковый код.
   */
  private generateCode(key: keyof Errors, index: number): string {
    const prefixEncoded = Buffer.from(this.prefix).toString('base64url');
    const suffix = Buffer.from(`${String(key)}:${index}`).toString('hex');

    return `${prefixEncoded}:${suffix}`;
  }
}
