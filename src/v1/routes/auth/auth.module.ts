import { Module } from "@nestjs/common";
import { Controller } from "./auth.controller";
import { Service } from "./auth.service";

@Module({
  controllers: [Controller],
  providers: [Service]
})
export default class AuthModule {}
