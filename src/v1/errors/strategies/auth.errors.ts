import { HttpStatus } from "@nestjs/common";
import { ErrorConstructor } from "@/errors";

export const AUTH_STRATEGIES_ERRORS = new ErrorConstructor(
  "AUTH STRATEGY EXСEPTION",
  {
    AUTH_NOT_FOUND: {
      message: "Authorization not found. (where:{key} with {value})",
      description:
        "Авторизация пользователя (с типом {key} и значением {value}) не была найдена в БД.",
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      placeholders: ["key", "value"] as const,
    },

    PASSWORD_ERROR: {
      message: "Password not equals.",
      description: "Пароль не совпадает с паролем из БД.",
      status: HttpStatus.FORBIDDEN,
      placeholders: [],
    },

    USER_NOT_FOUND: {
      message: "User not found. (where:{key} with {value})",
      description:
        "Пользователь (с типом {key} и значением {value}) не был найден в БД.",
      placeholders: ["key", "value"] as const,
    },
  },
).execute();

export default AUTH_STRATEGIES_ERRORS;
