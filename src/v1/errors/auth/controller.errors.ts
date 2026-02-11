import ErrorConstructor from "../constructor";
import { HttpStatus } from "@nestjs/common";
import { ROUTE, ROUTES } from "@/v1/routes/auth/auth.routes";

const AUTH_CONTROLLER = new ErrorConstructor("AUTH EXEPTION", <const>{
  PRINT_METHODS: {
    description: "",
    message: `Sorry, but you can't auth without method, try methods below by path: ${ROUTE}${ROUTES.OAUTH2_GET}`,
    status: HttpStatus.ACCEPTED,
  },
});

export default AUTH_CONTROLLER;
