import { HttpStatus } from "@nestjs/common";
import ErrorConstructor from "../errors.constructor";

export const BASE_HEADERS_AUTHORIZATION = new ErrorConstructor(
  "BASE HEADERS AUTHORIZATION EXEPTIONS",
  <const>{
    AUTHORIZATION_NOT_DEFINED: {
      message: "Authorization is required",
      description: "Значение Authorization не было объявлено",
      status: HttpStatus.BAD_REQUEST,
    },

    BAD_TYPE: {
      message: "Authorization must be Basic type",
      description: "Тип авторизации должен быть Basic",
      status: HttpStatus.BAD_REQUEST,
    },
  },
).execute();

export default BASE_HEADERS_AUTHORIZATION;
