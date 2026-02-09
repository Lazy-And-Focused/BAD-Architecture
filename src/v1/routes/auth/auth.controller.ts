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

import { ROUTE, ROUTES } from "./auth.routes";
import { Service } from "./auth.service";

import { CreateUserBodyDto, CreateUserHeadersDto } from "./dto/create-user.dto";

import { HashService } from "@/v1/services";
import { HeadersEnum } from "@/v1/enums/headers.enum";
import { PassportStrategy } from "@1/strategies";

import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Injectable()
@NestController(ROUTE)
@ApiResponse({
  status: HttpStatus.OK,
  description: "Ok",
})
@ApiResponse({
  status: HttpStatus.FOUND,
  description: "Redirecting",
})
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: "Redirecting",
})
export class Controller {
  public constructor(
    private readonly service: Service,
    private readonly hash: HashService,
    private readonly passport: PassportStrategy
  ) {}

  @Get([ROUTES.GET, ROUTES.GET_OAUTH2])
  @ApiOperation({ summary: "getting all authentication methods" })
  public printMethods() {
    const methods = this.service.getAllMethods();

    return {
      message: `Sorry, but you can't auth without method, try methods below by path: ${ROUTE}${ROUTES.OAUTH2_GET}`,
      abbreviations: methods.abbreviations,
      methods: methods.methods,
    };
  }

  @Post(ROUTES.POST)
  @ApiOperation({ summary: "creating a user by password" })
  public post(
    @Body() body: CreateUserBodyDto,
    @Headers() headers: CreateUserHeadersDto
  ) {
    return this.service.createUser({
      ...headers,
      ...body,
    });
  }

  @Get(ROUTES.GET_ME)
  @ApiOperation({ summary: "getting a self user" })
  public getMe(
    @Headers(HeadersEnum.authorization) authorization?: string
  ) {
    const { authId, userId } = this.hash.resolveHeaderAuthorizationOrThrow(authorization);
    return this.service.getMe(authId, userId);
  }

  @Get(ROUTES.OAUTH2_GET)
  @ApiOperation({ summary: "redirecting to authentication system" })
  public auth(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
    @Param("method") method: string
  ) {
    return this.passport.auth(method, req, res, next);
  }

  @Get(ROUTES.OAUTH2_GET_CALLBACK)
  @ApiOperation({ summary: "callback from authentication system" })
  public callback(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
    @Param("method") method: string
  ) {
    return this.passport.callback(
      method,
      req,
      res,
      next,
      (error, data) => {
        if (error || !data) {
          return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const redirectUrl = this.service.getRedirectUrl(data.auth);
        res.redirect(redirectUrl);
      },
    );
  }
}

export default Controller;
