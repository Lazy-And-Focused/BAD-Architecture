import type { NestModule, MiddlewareConsumer } from "@nestjs/common";

import { Module } from "@nestjs/common";

import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  RouterModule,
} from "@nestjs/core";
import { CacheModule, CacheInterceptor } from "@nestjs/cache-manager";
import {
  SentryGlobalFilter,
  SentryModule as Sentry,
} from "@sentry/nestjs/setup";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { LoggerMiddleware } from "./middleware/logger.middleware";

import AuthModule from "./routes/auth/auth.module";
import SentryModule from "./routes/sentry/sentry.module";
import TestModule from "./routes/test/test.module";

import env from "@env";

export const v1Modules = [AuthModule, SentryModule, TestModule];

@Module({
  imports: [
    ...v1Modules.flatMap((module) => [
      module,
      RouterModule.register([{ path: "v1", module }]),
    ]),
    ThrottlerModule.forRoot([
      {
        ttl: +env.THROLLER_TIME_TO_LIVE_IN_MILLISECONDS,
        limit: +env.THROLLER_LIMIT,
      },
    ]),
    CacheModule.register({
      ttl: +env.CACHE_TIME_TO_LIVE_IN_MILLISECONDS,
      isGlobal: true,
    }),
    Sentry.forRoot(),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export default class v1Module implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("/");
  }
}
