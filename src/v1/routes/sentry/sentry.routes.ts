import { createOperations } from "@/utils/create-operations.utils";

const ROUTE = "sentry";

const ROUTES = {
  GET: "/",
  GET_ERROR: "/error",
  GET_HTTP: "/http",
};

const OPERATIONS = createOperations(ROUTES, {
  GET: {
    summary: "Using a `logger.info` from `@sentry/nestjs`",
  },
  GET_ERROR: {
    summary: "Testing an error for sentry",
  },
  GET_HTTP: {
    summary: "Testing an `HttpExeption` from sentry",
  },
});

export { ROUTE, ROUTES, OPERATIONS };
