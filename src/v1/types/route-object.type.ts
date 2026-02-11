export type RoutesObject = Readonly<{
  [key: string]: Readonly<string | string[]>
}>;

export type GroupedRoutesObject<T extends RoutesObject, P> = Record<keyof T, P>;
