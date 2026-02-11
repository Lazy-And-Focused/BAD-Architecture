import { HttpStatus } from "@nestjs/common";
import { ErrorConstructor } from "../constructor";

import { env } from "@/services";

export const USERNAME_ERRORS = new ErrorConstructor("USERNAME EXEPTION", {
  USERNAME_NOT_STRING: {
    message: "username must be string",
    description: "Имя пользователя не является строкой",
    status: HttpStatus.BAD_REQUEST,
  },

  INVALID_USERNAME: {
    message: `username not valided and must includes only \`${env.AVAILABLE_USERNAME_SYMBOLS}\``,
    description: `Имя пользователя должно содержать только определенный набор символов: \`${env.AVAILABLE_USERNAME_SYMBOLS}\``,
    status: HttpStatus.BAD_REQUEST
  }
}).execute();

export default USERNAME_ERRORS;
