import { Public } from "@/decorators";
import { AuthGuard } from "@1/guards/auth/auth.guard";

import {
  Controller as NestController,
  Injectable,
  Get,
  UseGuards,
} from "@nestjs/common";

import { ApiOperation, ApiResponse } from "@nestjs/swagger";

import { SkipThrottle } from "@nestjs/throttler";
import { CacheTTL } from "@nestjs/cache-manager";

import { OPERATIONS, ROUTE, ROUTES, API } from "./test.routes";
import TEST_CONTROLLER from "@/v1/errors/test/controller.errors";

@Injectable()
@NestController(ROUTE)
@UseGuards(AuthGuard)
@ApiResponse(API.API_RESPONSE_FIRST)
@ApiResponse(API.API_RESPONSE_SECOND)
@ApiResponse(API.API_RESPONSE_THIRD)
@ApiResponse(API.API_RESPONSE_FOURTH)
@ApiResponse(API.API_RESPONSE_FIFTH)
export class Controller {
  public constructor() {}

  @ApiOperation(OPERATIONS.GET)
  @Get(ROUTES.GET)
  public get() {
    return TEST_CONTROLLER.GET.message;
  }

  @ApiOperation(OPERATIONS.GET_PUBLIC)
  @Get(ROUTES.GET_PUBLIC)
  @Public()
  public getPublic() {
    return TEST_CONTROLLER.GET_PUBLIC.message;
  }

  @ApiOperation(OPERATIONS.GET_TOO_MANY_REQUESTS_NON_PROTECTED)
  @Get(ROUTES.GET_TOO_MANY_REQUESTS_NON_PROTECTED)
  @SkipThrottle()
  @CacheTTL(1)
  @Public()
  public getTooManyRequestsNonProtected() {
    return TEST_CONTROLLER.GET_TOO_MANY_REQUESTS_NON_PROTECTED.message;
  }
}
