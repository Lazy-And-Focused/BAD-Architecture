import { createOperations } from "@/utils/create-operations.utils";

const ROUTE = "test";

const ROUTES = {
  GET: "/",
  GET_PUBLIC: "/public",
  GET_TOO_MANY_REQUESTS_NON_PROTECTED: "/too-many-requests",
} as const;

const OPERATIONS = createOperations(ROUTES, {
  GET: {
    summary: "Protected route",
  },
  
  GET_PUBLIC: {
    summary: "Public protected route",
  },

  GET_TOO_MANY_REQUESTS_NON_PROTECTED: {
    summary: "Public non protected route",
  }
});

export { ROUTE, ROUTES, OPERATIONS };
