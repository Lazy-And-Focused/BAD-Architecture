import { HttpStatus } from "@nestjs/common";
import ErrorConstructor from "../constructor";

export const STRATEGIES_SERVICE_ERROS = new ErrorConstructor(
  "STRATEGIES SERVICE EXEPTION",
  {
    STRATEGY_NOT_FOUND: {
      message: "Strategy can not be find",
      description: "Стратегия почему-то не была найдена",
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    },
  },
).execute();

export default STRATEGIES_SERVICE_ERROS;
