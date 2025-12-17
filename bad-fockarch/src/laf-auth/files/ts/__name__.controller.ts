import type { Request, Response } from "express";

import {
  Controller as NestController,
  Injectable,
  Get,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { ROUTE, ROUTES } from "./<%= name %>.routes";

import env from "services/env.service";
import Hash from "services/hash.service";
import AuthApi from "services/auth.service";

const toStr = (str: unknown) => JSON.stringify(str, undefined, 4);

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
  @ApiOperation({
    summary: "Getting all auth methods",
  })
  @Get()
  public printMethods() {
    const { abbreviations, methods } = AuthApi.methods;

    return {
      message: `Sorry, but you can't auth without method, try next methods:\n${toStr(methods)}\nAnd this abbreviations:\n${toStr(abbreviations)}`,
      abbreviations,
      methods,
    };
  }

  @ApiOperation({
    summary: "Authenticating by redirecting to authenticate service",
  })
  @Get(ROUTES.GET)
  public async auth(@Req() req: Request, @Res() res: Response) {
    const { method } = req.params;

    if (method !== "@me") {
      const redirect = req.query.callback?.toString() || req.hostname;

      res.cookie("redirect", redirect);

      return res.redirect(
        env.AUTH_URL +
          "/api/auth/" +
          method +
          "?callback=" +
          env.THIS_URL +
          "/api/auth/" +
          method +
          "/callback",
      );
    }

    if (req.query.code) {
      try {
        const data = await (
          await fetch(
            env.AUTH_URL + "/api/auth/" + method + "?code=" + req.query.code,
          )
        ).json();

        return res.send(data);
      } catch (error) {
        console.log(error);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    if (!req.headers.authorization)
      throw new HttpException("Access denied", HttpStatus.FORBIDDEN);
    const { successed, id, profile_id, token } = Hash.resolveToken(
      req.headers.authorization,
    );

    if (!successed)
      throw new HttpException("Access denied", HttpStatus.FORBIDDEN);

    try {
      const response = await fetch(env.AUTH_URL + "/api/auth/@me", {
        headers: {
          authorization:
            "Bearer " +
            JSON.stringify({
              id,
              profile_id,
              token,
            }),
        },
      });

      const data = await response.json();
      return res.send(data);
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiOperation({
    summary: "Authenticate redirect callback",
  })
  @Get(ROUTES.GET_CALLBACK)
  public callback(@Req() req: Request, @Res() res: Response) {
    const redirect = req.cookies["redirect"] || req.hostname;
    const code = req.query.code;

    if (!code) {
      return res.sendStatus(400);
    }

    return res.redirect(redirect + "?code=" + code);
  }
}
