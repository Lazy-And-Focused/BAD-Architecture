import { env } from "f@/env";

import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestFactory } from "@nestjs/core";
import { init as initSentry, consoleLoggingIntegration } from "@sentry/nestjs";

import { json, urlencoded } from "express";

import cookieParser = require("cookie-parser");

import Session from "./app/session.app";
import AppModule from "./app.module";

initSentry({
  dsn: env.SENTRY_URL,
  tracesSampleRate: 1.0,
  integrations: [
    consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  enableLogs: true,
});

(async () => {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: [env.CLIENT_URL], credentials: true },
  });

  new Session(env.SESSION_SECRET, app).create();

  app.use(cookieParser());
  app.use(json());
  app.use(urlencoded());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("API documentation")
    .setDescription("API documentation")
    .setVersion("1.0")
    .addTag("api")
    .build();

  const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, documentFactory);

  await app.listen(env.PORT);
})();
