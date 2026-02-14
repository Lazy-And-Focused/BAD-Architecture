import { Routes } from "@/utils";

export const { ROUTE, ROUTES, OPERATIONS } = new Routes({
  route: "<%= name %>",

  routes: {
    GET: "/",
    GET_ONE: "/:id",

    POST: "/",

    PUT: "/:id",
    PATCH: "/:id",

    DELETE: "/:id",
  } as const,

  operations: {
    GET: {
      summary: "Getting an array of <%= name %>"
    },
    GET_ONE: {
      summary: "Getting a <%= name %> by id"
    },
    POST: {
      summary: "Creaing a <%= name %>"
    },
    PUT: {
      summary: "Updating a <%= name %>"
    },
    PATCH: {
      summary: "Updating a <%= name %>"
    },
    DELETE: {
      summary: "Deleting a <%= name %>"
    },
  } as const,
}).execute();
