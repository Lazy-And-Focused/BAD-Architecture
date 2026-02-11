import { Injectable } from "@nestjs/common";

import { HASH_ERRORS } from "@1/errors/services/hash.errors";
import { trycatchThrow } from "@/utils/trycatch.utils";

import { env } from "f@/env";
import crypto from "crypto";

const PARSE_ERROR = {
  id: false,
  profile_id: false,
  token: false,
  successed: false,
} as const;

type ParsedToken = {
  authId: string;
  userId: string;
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
    const [authId, userId, access_token] = token.split("-");
    const valided = authId && userId && access_token;
    if (!valided) {
      throw HASH_ERRORS.INVALID_TOKEN.exeption;
    }

    return { authId, userId, token: access_token, successed: true };
  }

  public static resolveHeaderAuthorizationOrThrow(
    authorization?: string,
  ): ParsedToken {
    if (!authorization) {
      throw HASH_ERRORS.AUTHORIZATION_UNDEFINED.exeption;
    }

    return trycatchThrow(() => {
      const [method, ...tokenData] = authorization.split(" ");
      const token = tokenData.join(" ");

      if (method === "Bearer") {
        return this.resolveTokenOrThrow(token);
      }

      throw HASH_ERRORS.TOKEN_METHOD_NOT_ACCEPTABLE.exeption;
    });
  }

  public static resolveToken(token: string): ParseReturn {
    try {
      return this.resolveTokenOrThrow(token);
    } catch {
      return PARSE_ERROR;
    }
  }

  public static resolveHeaderAuthorization(
    authorization?: string,
  ): ParseReturn {
    try {
      return this.resolveHeaderAuthorizationOrThrow(authorization);
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

  public resolveHeaderAuthorizationOrThrow(
    authorization?: string,
  ): ParsedToken {
    return HashService.resolveHeaderAuthorizationOrThrow(authorization);
  }

  public resolveToken(token: string): ParseReturn {
    return HashService.resolveToken(token);
  }

  public resolveHeaderAuthorization(authorization?: string) {
    return HashService.resolveHeaderAuthorization(authorization);
  }
}

export default HashService;
