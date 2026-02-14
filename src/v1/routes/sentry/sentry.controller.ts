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
import { Queries } from "@/v1/enums/queries.enum";

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
    throw new Error("Test error for sentry");
  }

  @Get(ROUTES.GET_HTTP)
  @ApiOperation(OPERATIONS.GET_HTTP)
  public getHttp(@Query(Queries.status) status?: string) {
    if (!status) {
      throw new HttpException("Not found TEST", HttpStatus.NOT_FOUND);
    }

    throw new HttpException("Exeption TEST", +status);
  }
}

export default Controller;
