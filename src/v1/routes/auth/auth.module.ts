import { Module } from "@nestjs/common";

import { Controller } from "./auth.controller";
import { Service } from "./auth.service";

import { AuthStrategy, PassportStrategy } from "@1/strategies";
import { HashService } from "@/v1/services";
import { PrismaService } from "@/database/prisma.service";
import { LoggerService } from "@/services";

@Module({
  controllers: [Controller],
  providers: [
    PassportStrategy,
    HashService,
    LoggerService,
    AuthStrategy,
    PrismaService,
    Service,
  ],
})
export default class AuthModule {}
