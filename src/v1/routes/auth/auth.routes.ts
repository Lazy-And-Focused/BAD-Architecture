import { HttpStatus } from "@nestjs/common";
import { createOperations } from "@/utils/create-operations.utils";

const ROUTE = "auth" as const;

const ROUTES = {
  GET: "/",
  POST: "/",
  GET_ME: "/@me",
  GET_OAUTH2: "/oauth2",
  OAUTH2_GET: "/oauth2/:method",
  OAUTH2_GET_CALLBACK: "/oauth2/:method/callback",
} as const;

const API = {
  API_RESPONSE_FIRST: {
    description: "Ok",
    message: "",
    status: HttpStatus.OK,
  },
  API_RESPONSE_SECOND: {
    description: "Redirecting",
    message: "",
    status: HttpStatus.FOUND,
  },
  API_RESPONSE_THIRD: {
    description: "Redirecting",
    message: "",
    status: HttpStatus.BAD_REQUEST,
  },
};

const OPERATIONS = createOperations(ROUTES, {
  POST: {
    summary: "creating a user by password",
  },
  GET_ME: {
    summary: "getting a self user",
  },
  OAUTH2_GET: {
    summary: "redirecting to authentication system",
  },
  OAUTH2_GET_CALLBACK: {
    summary: "callback from authentication system",
  },
  GET: {
    summary: "getting all authentication methods",
  },
  GET_OAUTH2: {},
});

export { ROUTE, ROUTES, OPERATIONS, API };
