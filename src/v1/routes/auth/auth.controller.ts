import type { NextFunction, Request, Response } from "express";

import {
  Controller as NestController,
  Get,
  HttpStatus,
  Injectable,
  Next,
  Req,
  Res,
} from "@nestjs/common";

import { ROUTE, ROUTES } from "./auth.routes";

import env from "f@/env";
import AuthService from "@1/services/auth.service";

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
  @Get()
  @ApiOperation({ summary: "getting all authentication methods" })
  public printMethods() {
    const { abbreviations, methods } = AuthService.methods;
    const toStr = (str: unknown) => JSON.stringify(str, undefined, 4);

    return {
      message: `Sorry, but you can't auth without method, try next methods:\n${toStr(methods)}\nAnd this abbreviations:\n${toStr(abbreviations)}`,
      abbreviations,
      methods,
    };
  }

  @Get(ROUTES.GET)
  @ApiOperation({ summary: "redirecting to authentication system" })
  public auth(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return new AuthService(req.params.method).auth(req, res, next);
  }

  @Get(ROUTES.GET_CALLBACK)
  @ApiOperation({ summary: "callback from authentication system" })
  public callback(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    return new AuthService(req.params.method).callback(
      req,
      res,
      next,
      (...args) => {
        if (args[0]) {
          return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const auth = args[1];
        if (!auth) {
          return;
        }

        res.cookie(
          "id-token",
          auth.token
        );

        res.redirect(env.CLIENT_URL);
      },
    );
  }
}

export default Controller;
