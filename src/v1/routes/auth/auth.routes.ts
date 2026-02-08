export const ROUTE = "auth" as const;

export const ROUTES = {
  GET: "/",
  POST: "/",
  GET_ME: "/@me",
  GET_OAUTH2: "/oauth2",
  OAUTH2_GET: "/oauth2/:method",
  OAUTH2_GET_CALLBACK: "/oauth2/:method/callback",
} as const;
