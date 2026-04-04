import { HttpStatus } from "@nestjs/common";
import { ErrorConstructor } from "../errors.constructor";

export const BASE_HEADERS_AUTHORIZATION = new ErrorConstructor(
  "BASE HEADERS AUTHORIZATION EXСEPTIONS",
  <const>{
    AUTHORIZATION_NOT_DEFINED: {
      message: "Authorization is required",
      description: "Значение Authorization не было объявлено",
      status: HttpStatus.BAD_REQUEST,
      placeholders: [],
    },

    BAD_TYPE: {
      message: "Authorization must be Basic type",
      description: "Тип авторизации должен быть Basic",
      status: HttpStatus.BAD_REQUEST,
      placeholders: [],
    },
  },
).execute();

export default BASE_HEADERS_AUTHORIZATION;
