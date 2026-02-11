import { Operations } from "@/v1/types/operations.type";
import { RoutesObject } from "@/v1/types/route-object.type";

type GroupedRoutes<T extends RoutesObject> = {
  [P in keyof T]: T[P] extends readonly string[] ? string[] : T[P];
};

type ConstructorData<T extends RoutesObject> = {
  route: string | string[];
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
