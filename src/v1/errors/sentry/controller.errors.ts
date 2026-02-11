import ErrorConstructor from "../constructor";
import { HttpStatus } from "@nestjs/common";

const SENTRY_CONTROLLER = new ErrorConstructor("SENTRY EXEPTION", <const>{
  GET_ERROR: {
    message: "Test error for sentry",
    description:
      "Ошибка, связанная с парсингом запроса, возможно запрос содержит неправильные данные",
    status: HttpStatus.FORBIDDEN,
  },
  GET_HTTP: {
    message: "Not found TEST",
    description: "",
    status: HttpStatus.FORBIDDEN,
  },
  GET_Http: {
    message: "Exeption TEST",
    description: "",
    status: HttpStatus.FORBIDDEN,
  },
}).execute();

export default SENTRY_CONTROLLER;
