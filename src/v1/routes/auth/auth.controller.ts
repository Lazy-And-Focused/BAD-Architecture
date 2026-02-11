import type { NextFunction, Request, Response } from "express";

import {
  Controller as NestController,
  Get,
  HttpStatus,
  Injectable,
  Next,
  Req,
  Res,
  Post,
  Body,
  Headers,
  Param,
} from "@nestjs/common";

import { ROUTE, ROUTES, OPERATIONS, API } from "./auth.routes";
import { Service } from "./auth.service";

import { CreateUserBodyDto, CreateUserHeadersDto } from "./dto/create-user.dto";

import { HashService } from "@/v1/services";
import { HeadersEnum } from "@/v1/enums/headers.enum";
import { PassportStrategy } from "@1/strategies";

import { ApiOperation, ApiResponse } from "@nestjs/swagger";

import AUTH_CONTROLLER from "@/v1/errors/auth/controller.errors";

@Injectable()
@NestController(ROUTE)
@ApiResponse(API.API_RESPONSE_FIRST)
@ApiResponse(API.API_RESPONSE_SECOND)
@ApiResponse(API.API_RESPONSE_THIRD)
export class Controller {
  public constructor(
    private readonly service: Service,
    private readonly hash: HashService,
    private readonly passport: PassportStrategy,
  ) {}

  @Get([ROUTES.GET, ROUTES.GET_OAUTH2])
  @ApiOperation(OPERATIONS.GET)
  public printMethods() {
    const methods = this.service.getAllMethods();

    return {
      message: AUTH_CONTROLLER.errors.PRINT_METHODS.message,
      abbreviations: methods.abbreviations,
      methods: methods.methods,
    };
  }

  @Post(ROUTES.POST)
  @ApiOperation(OPERATIONS.POST)
  public post(
    @Body() body: CreateUserBodyDto,
    @Headers() headers: CreateUserHeadersDto,
  ) {
    return this.service.createUser({
      ...headers,
      ...body,
    });
  }

  @Get(ROUTES.GET_ME)
  @ApiOperation(OPERATIONS.GET_ME)
  public getMe(@Headers(HeadersEnum.authorization) authorization?: string) {
    const { authId, userId } =
      this.hash.resolveHeaderAuthorizationOrThrow(authorization);
    return this.service.getMe(authId, userId);
  }

  @Get(ROUTES.OAUTH2_GET)
  @ApiOperation(OPERATIONS.OAUTH2_GET)
  public auth(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
    @Param("method") method: string,
  ) {
    return this.passport.auth(method, req, res, next);
  }

  @Get(ROUTES.OAUTH2_GET_CALLBACK)
  @ApiOperation(OPERATIONS.OAUTH2_GET_CALLBACK)
  public callback(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
    @Param("method") method: string,
  ) {
    return this.passport.callback(method, req, res, next, (error, data) => {
      if (error || !data) {
        return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const redirectUrl = this.service.getRedirectUrl(data.auth);
      res.redirect(redirectUrl);
    });
  }
}

export default Controller;
