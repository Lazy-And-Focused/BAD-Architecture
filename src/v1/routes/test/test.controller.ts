import { Public } from "decorators/public.decorator";
import { AuthGuard } from "v1/guards/auth/auth.guard";

import {
  Controller as NestController,
  Injectable,
  Get,
  UseGuards,
  HttpStatus,
} from "@nestjs/common";

import { ApiOperation, ApiResponse } from "@nestjs/swagger";

import { SkipThrottle } from "@nestjs/throttler";
import { CacheTTL } from "@nestjs/cache-manager";

import { ROUTE, ROUTES } from "./test.routes";

@Injectable()
@NestController(ROUTE)
@UseGuards(AuthGuard)
@ApiResponse({
  status: HttpStatus.OK,
  description: "Ok",
})
@ApiResponse({
  status: HttpStatus.FORBIDDEN,
  description: "Not accesss to route",
})
@ApiResponse({
  status: HttpStatus.TOO_MANY_REQUESTS,
  description: `A large number of requests`,
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description:
    "Does not have an authentication token in headers (`headers.authorization`)",
})
@ApiResponse({
  status: HttpStatus.TOO_MANY_REQUESTS,
  description: "Too many requests, try later",
})
export class Controller {
  public constructor() {}

  @ApiOperation({
    summary: "Protected route",
  })
  @Get(ROUTES.GET)
  @Public()
  public get() {
    return "Hi from guarded test";
  }

  @ApiOperation({
    summary: "Public protected route",
  })
  @Get(ROUTES.GET_PUBLIC)
  @Public()
  public getPublic() {
    return "Hi from public test";
  }

  @ApiOperation({
    summary: "Public non protected route",
  })
  @Get(ROUTES.GET_TOO_MANY_REQUESTS_NON_PROTECTED)
  @SkipThrottle()
  @CacheTTL(1)
  @Public()
  public getTooManyRequestsNonProtected() {
    return "Hi from too many requests non protected test";
  }
}
