export type ArrayPath = [string, ...string[]];
export type StringPath = string;
export type Path = StringPath | ArrayPath | Readonly<StringPath | ArrayPath>;

export type RoutesObject = Readonly<{
  [key: string]: Path;
}>;

export type GroupedRoutesObject<T extends RoutesObject, P> = Record<keyof T, P>;
