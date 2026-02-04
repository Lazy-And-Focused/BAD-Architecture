import { createWriteStream } from "fs";
import { join  } from "path";

import { logger } from "@/services";
import { HttpException, HttpStatus } from "@nestjs/common";

type ExtendedErrorType = {
  message: string,
  description: string,
  status?: HttpStatus
}

type LazyErrorType = string;
type ErrorType = ExtendedErrorType | LazyErrorType | ((puck: string) => (ExtendedErrorType | LazyErrorType));

type OutputError = {
  code: string,
  puck: string,
  message: string,
  description: string,
  original: ErrorType,
  exeption: HttpException
}

export class ErrorConstructor<Errors extends Record<string, ErrorType>> {
  private static readonly stream = createWriteStream(join(__dirname, "errors.md"), {
    encoding: "utf-8"
  });
  
  public static close() {
    this.stream.close();
  }

  public constructor(
    public readonly prefix: string,
    public readonly errors: Errors
  ) {}

  public execute(): Record<keyof Errors, OutputError> {
    ErrorConstructor.stream.write(`## ${this.prefix}\n\n`);

    const keys = Object.keys(this.errors);
    const errors = keys.map(key => {
      const chars = Buffer.from(this.prefix).toString("base64url");
      const bufferString = `${key}:${keys.indexOf(key)}`;
      const buffer = Buffer.from(bufferString);
      const code = `${chars}:${buffer.toString("hex")}`;
      const puck = `${this.prefix} ${key}`.toUpperCase();
      const error = this.errors[key];
      
      const message = this.formatError(error, puck, code);
      const cause = `${code} : ${message.message}`;

      logger.execute(`Регистрация ошибки ${code} (s:${message.status}): ${message}`);

      return [ key, {
        code,
        puck,
        original: error,
        message: cause,
        description: message.description,
        exeption: new HttpException(cause, message.status || HttpStatus.INTERNAL_SERVER_ERROR, {
          cause: message.message,
          description: message.description
        }),
      } ];
    });

    return Object.fromEntries(errors) as Record<keyof Errors, OutputError>;
  }

  private formatStringError(error: ExtendedErrorType | LazyErrorType, puck: string) {
    return {
      message: `${puck} — ${typeof error === "string" ? error : error.message}`,
      description: typeof error === "string"
        ? "NO DESCRIPTION"
        : error.description,
      status: typeof error === "string"
        ? HttpStatus.INTERNAL_SERVER_ERROR
        : error.status || HttpStatus.INTERNAL_SERVER_ERROR
    };
  }

  private formatError(error: ErrorType, puck: string, code: string) {
    if (typeof error === "string" || "message" in error) {
      const formatted = this.formatStringError(error, puck);
      return this.registry({
        ...formatted,
        code
      });
    }

    const output = error(puck);
    if (typeof output === "string") {
      return this.registry({
        message: output,
        description: "NO DESCRIPTION",
        code
      });
    }

    return this.registry({
      ...output,
      code
    });
  }

  private registry(error: ExtendedErrorType & { code: string }) {
    ErrorConstructor.stream.write([
      `### \`${error.code}\`\n`,
      "- " + error.message,
      "  - " + error.description,
      "  - Статус: " + error.status
    ].join("\n") + "\n\n");

    return error;
  }
}

export default ErrorConstructor;
