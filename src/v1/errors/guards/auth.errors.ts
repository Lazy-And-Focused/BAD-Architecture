import { HttpStatus } from "@nestjs/common";
import { ErrorConstructor } from "@/errors";

export const AUTH_ERRORS = new ErrorConstructor("AUTH EXСEPTION", <const>{
  HASH_PARSE: {
    message: "Parse exception",
    description:
      "Ошибка, связанная с парсингом запроса, возможно запрос содержит неправильные данные",
    status: HttpStatus.FORBIDDEN,
    placeholders: [],
  },
  USER_NOT_FOUND: {
    message: "User not found",
    description:
      "(auth) Пользователь не был найден по данным из запроса, возможно токен устарел",
    status: HttpStatus.FORBIDDEN,
    placeholders: [],
  },
  PROFILE_ID: {
    message: "Profile id is not equals",
    description:
      "Пользователь по данным токена был найден, но id пользователя в БД не соотвествует id пользователя в токене",
    status: HttpStatus.FORBIDDEN,
    placeholders: [],
  },
  PROFILE_NOT_FOUND: {
    message: "Profile not found",
    description:
      "Пользователь не был найден по данным из запроса, возможно токен устарел",
    status: HttpStatus.FORBIDDEN,
    placeholders: [],
  },
  TOKEN_ERROR: {
    message: "Token is not equals",
    description: "Токен невалиден с токеном из БД, возможно но устарел",
    status: HttpStatus.FORBIDDEN,
    placeholders: [],
  },
}).execute();

export default AUTH_ERRORS;
