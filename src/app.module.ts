import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { RouterModule } from "@nestjs/core";

import v1Module, { v1Modules } from "./v1/v1.module";

type RegisterModule = {
  module: new () => NestModule;
  children: (new () => unknown)[];
  path: string;
};

const modules: RegisterModule[] = [
  {
    module: v1Module,
    children: v1Modules,
    path: "v1",
  },
];

@Module({
  imports: [
    ...modules.flatMap(({ module, children, path }) => [
      module,
      RouterModule.register([
        {
          path: "api",
          module,
          children: children.flatMap((module) => [{ path, module }]),
        },
      ]),
    ]),
  ],
})
export default class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes("/");
  }
}
