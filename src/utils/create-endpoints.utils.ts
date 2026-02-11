import { RoutesObject } from "@/v1/types/route-object.type";
import { urlize } from "./urlize.utils";

type UrlizeParameters = Parameters<typeof urlize>[0];

export const createEndpoints = <T extends RoutesObject>({
  routes,
  ...data
}: UrlizeParameters & { routes: T }) => {
  const toUrl = urlize(data);

  const endpoints = Object.fromEntries(
    Object.keys(routes).map((key) => {
      return [key, toUrl(routes[key])];
    }),
  ) as Record<keyof T, string>;

  return endpoints;
};
