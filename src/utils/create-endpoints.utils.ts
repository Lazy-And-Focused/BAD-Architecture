import type { RoutesObject } from "@/types";
import { resolvePathname } from "./resolve-pathname.utils";

type UrlizeParameters = Parameters<typeof resolvePathname>[0];

export const createEndpoints = <T extends RoutesObject>({
  routes,
  ...data
}: UrlizeParameters & { routes: T }) => {
  const toUrl = resolvePathname(data);

  const endpoints = Object.fromEntries(
    Object.keys(routes).map((key) => {
      return [key, toUrl(routes[key])];
    }),
  ) as Record<keyof T, string>;

  return endpoints;
};
