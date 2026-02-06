import type { Request } from "express";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

import crypto from "crypto";

import { env } from "f@/env";

const PARSE_ERROR = {
  id: false,
  profile_id: false,
  token: false,
  successed: false,
} as const;

type ParsedToken = {
  id: string;
  profile_id: string;
  token: string;
  successed: true;
};

type ParseReturn = ParsedToken | typeof PARSE_ERROR;

@Injectable()
export class HashService {
  public static execute(data: string) {
    return new HashService().execute(data);
  }

  public static resolveTokenOrThrow(token: string): ParsedToken {
    const [id, profile_id, access_token] = token.split("-");
    const valided = id && profile_id && access_token;
    if (!valided) {
      throw new HttpException("Bad token", HttpStatus.UNAUTHORIZED);
    }

    return { id, profile_id, token: access_token, successed: true };
  }

  public static resolveHeaderAuthorizationOrThrow(
    request: Request,
  ): ParsedToken {
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    try {
      const [method, ...tokenData] = authorization.split(" ");
      const token = tokenData.join(" ");

      if (method === "Bearer") {
        return this.resolveTokenOrThrow(token);
      }

      throw new HttpException("Not acceptable", HttpStatus.NOT_ACCEPTABLE);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Server error",
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }

  public static resolveToken(token: string): ParseReturn {
    try {
      return this.resolveTokenOrThrow(token);
    } catch {
      return PARSE_ERROR;
    }
  }

  public static resolveHeaderAuthorization(request: Request): ParseReturn {
    try {
      return this.resolveHeaderAuthorizationOrThrow(request);
    } catch {
      return PARSE_ERROR;
    }
  }

  public constructor() {}

  public execute(data: string) {
    return crypto.createHmac("sha512", env.HASH_KEY).update(data).digest("hex");
  }

  public generateCode(data: string = (Math.random() * 1000).toString()) {
    return crypto
      .createHmac("sha512", env.HASH_KEY)
      .update(new Date().getTime().toString() + data)
      .digest("base64");
  }

  public resolveTokenOrThrow(token: string): ParsedToken {
    return HashService.resolveTokenOrThrow(token);
  }

  public resolveHeaderAuthorizationOrThrow(request: Request): ParsedToken {
    return HashService.resolveHeaderAuthorizationOrThrow(request);
  }

  public resolveToken(token: string): ParseReturn {
    return HashService.resolveToken(token);
  }

  public resolveHeaderAuthorization(request: Request) {
    return HashService.resolveHeaderAuthorization(request);
  }
}

export default HashService;
