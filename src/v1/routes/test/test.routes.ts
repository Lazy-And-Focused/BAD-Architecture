import { createOperations } from "@/utils/create-operations.utils";
import { HttpStatus } from "@nestjs/common";

const ROUTE = "test";

const ROUTES = {
  GET: "/",
  GET_PUBLIC: "/public",
  GET_TOO_MANY_REQUESTS_NON_PROTECTED: "/too-many-requests",
} as const;

const API = {
  API_RESPONSE_FIRST: {
    description: "Ok",
    message: "",
    status: HttpStatus.OK,
  },
  API_RESPONSE_SECOND: {
    description: "Not accesss to route",
    message: "",
    status: HttpStatus.FORBIDDEN,
  },
  API_RESPONSE_THIRD: {
    description: `A large number of requests`,
    message: "",
    status: HttpStatus.TOO_MANY_REQUESTS,
  },
  API_RESPONSE_FOURTH: {
    description:
      "Does not have an authentication token in headers (`headers.authorization`)",
    message: "",
    status: HttpStatus.UNAUTHORIZED,
  },
  API_RESPONSE_FIFTH: {
    description: "Too many requests, try later",
    message: "",
    status: HttpStatus.TOO_MANY_REQUESTS,
  },
};

const OPERATIONS = createOperations(ROUTES, {
  GET: {
    summary: "Protected route",
  },

  GET_PUBLIC: {
    summary: "Public protected route",
  },

  GET_TOO_MANY_REQUESTS_NON_PROTECTED: {
    summary: "Public non protected route",
  },
});

export { ROUTE, ROUTES, OPERATIONS, API };
