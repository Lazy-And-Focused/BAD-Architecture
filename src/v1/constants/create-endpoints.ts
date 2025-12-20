import { urlize } from "./urlize"

type Routes = {
  [key: string]: string
}

type UrlizeParameters = Parameters<typeof urlize>[0];

export const createEndpoints = <T extends Routes>({
  routes, ...data
}: UrlizeParameters & { routes: T }) => {
  const toUrl = urlize(data);

  const endpoints = Object.fromEntries(
    Object.keys(routes).map(key => {
      return [key, toUrl(routes[key])]
  })) as Record<keyof T, string>;

  return endpoints;
}
