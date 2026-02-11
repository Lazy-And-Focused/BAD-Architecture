import type { ApiOperationOptions } from "@nestjs/swagger";
import type { GroupedRoutesObject, RoutesObject } from "./route-object.type";

export type Operations<T extends RoutesObject> = GroupedRoutesObject<
  T,
  ApiOperationOptions
>;
