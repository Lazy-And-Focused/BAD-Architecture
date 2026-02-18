import { <%= classify(name) %>Module } from "./<%= name %>.module.ts"

export * from "./dto"

export * from "./<%= name %>.controller.ts";
export * from "./<%= name %>.service.ts";
export * from "./<%= name %>.module.ts";

export * as <%= constant %>_ROUTES from "./<%= name %>.routes.ts";

export default <%= classify(name) %>Module;
