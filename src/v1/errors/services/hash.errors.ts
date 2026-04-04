import { HttpStatus } from "@nestjs/common";
import { ErrorConstructor } from "@/errors";

export const HASH_ERRORS = new ErrorConstructor("HASH EXСEPTION", {
  TOKEN_METHOD_NOT_ACCEPTABLE: {
    message: "Token method not acceptable",
    description: "Метод токена не доступен к использованию",
    status: HttpStatus.NOT_ACCEPTABLE,
    placeholders: [],
  },

  AUTHORIZATION_UNDEFINED: {
    message: "authroization not defined",
    description: "Заголовок `authorization` не был определен",
    status: HttpStatus.UNAUTHORIZED,
    placeholders: [],
  },

  INVALID_TOKEN: {
    message: "token not valided",
    description: "Токен не прошёл проверку по некоторым свойствам",
    status: HttpStatus.UNAUTHORIZED,
    placeholders: [],
  },
}).execute();

export default HASH_ERRORS;
