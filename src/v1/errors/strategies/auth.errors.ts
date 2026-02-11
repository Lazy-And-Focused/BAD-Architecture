import { HttpStatus } from "@nestjs/common";
import { ErrorConstructor } from "../constructor";

export const AUTH_STRATEGIES_ERRORS = new ErrorConstructor("AUTH STRATEGY EXEPTION", {
  AUTH_NOT_FOUND: {
    message: "Authorization not found",
    description: "Авторизация пользователя не была найдена в БД",
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  PASSWORD_ERROR: {
    message: "Password not equals",
    description: "Пароль не совпадает с паролем из БД",
    status: HttpStatus.FORBIDDEN
  }
}).execute();

export default AUTH_STRATEGIES_ERRORS;
