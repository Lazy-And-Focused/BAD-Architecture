import { <%= classify(plural) %>Module } from "./<%= plural %>.module.ts"

export * from "./dto"

export * from "./<%= plural %>.controller.ts";
export * from "./<%= plural %>.service.ts";
export * from "./<%= plural %>.module.ts";

export * as <%= constant %>_ROUTES from "./<%= plural %>.routes.ts";

export default <%= classify(plural) %>Module;
