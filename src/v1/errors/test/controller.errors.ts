import ErrorConstructor from "../constructor";
import { HttpStatus } from "@nestjs/common";

const TEST_CONTROLLER = new ErrorConstructor("TEST EXEPTION", <const>{
  GET: {
    message: "Hi from guarded test",
    description: "",
    // status: HttpStatus.FORBIDDEN,
  },
  GET_PUBLIC: {
    message: "Hi from public test",
    description: "",
    // status: HttpStatus.FORBIDDEN,
  },
  GET_TOO_MANY_REQUESTS_NON_PROTECTED: {
    message: "Hi from too many requests non protected test",
    description: "",
    // status: HttpStatus.FORBIDDEN,
  },
}).execute();

export default TEST_CONTROLLER;
