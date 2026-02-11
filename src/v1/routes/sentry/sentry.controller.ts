import {
  Controller as NestController,
  Get,
  Injectable,
  HttpException,
  Query,
  HttpStatus,
} from "@nestjs/common";

import { ROUTE, ROUTES, OPERATIONS } from "./sentry.routes";

import { logger } from "@sentry/nestjs";
import { ApiOperation } from "@nestjs/swagger";
import SENTRY_CONTROLLER from "@/v1/errors/sentry/controller.errors";

@Injectable()
@NestController(ROUTE)
export class Controller {
  @Get(ROUTES.GET)
  @ApiOperation(OPERATIONS.GET)
  public get() {
    logger.info("Hello", { string: "World" });

    return "Hello, World!";
  }

  @Get(ROUTES.GET_ERROR)
  @ApiOperation(OPERATIONS.GET_ERROR)
  public getError() {
    throw new Error(SENTRY_CONTROLLER.GET_ERROR.message);
  }

  @Get(ROUTES.GET_HTTP)
  @ApiOperation(OPERATIONS.GET_HTTP)
  public getHttp(@Query("status") status?: string) {
    if (!status) {
      throw new HttpException(
        SENTRY_CONTROLLER.GET_HTTP.message,
        HttpStatus.NOT_FOUND,
      );
    }

    throw new HttpException(SENTRY_CONTROLLER.GET_Http.message, +status);
  }
}

export default Controller;
