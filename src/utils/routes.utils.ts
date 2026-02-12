import type { ArrayPath, Operations, RoutesObject, StringPath } from "@/types";

type GroupedRoutes<T extends RoutesObject> = {
  [P in keyof T]: T[P] extends Readonly<ArrayPath> ? ArrayPath : T[P];
};

type ConstructorData<T extends RoutesObject> = {
  route: StringPath | ArrayPath;
  routes: T;
  operations: Operations<T>;
};

export class Routes<T extends RoutesObject> {
  public constructor(private readonly data: ConstructorData<T>) {}

  public execute() {
    return {
      ROUTE: this.data.route,
      ROUTES: this.data.routes as GroupedRoutes<T>,
      OPERATIONS: this.data.operations,
    } as const;
  }
}

export default Routes;
