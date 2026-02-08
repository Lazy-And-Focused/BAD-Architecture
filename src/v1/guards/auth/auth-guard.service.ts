import type { Request } from "express";
import type { Auth } from "@1/types";

import HashService from "@1/services/hash.service";
import AUTH from "@1/errors/guards/auth.errors";

export class Service {
  public static async validateRequest(req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authId, token, userId } =
      HashService.resolveHeaderAuthorizationOrThrow(req.headers.authorization);

    const findedUser = {} as Auth;
    // const findedUser = await auth.findOne({ id: id });

    if (!findedUser) {
      throw AUTH.USER_NOT_FOUND.exeption;
    }

    if (findedUser.userId !== userId) {
      throw AUTH.PROFILE_ID.exeption;
    }

    if (token !== HashService.execute(findedUser.token)) {
      throw AUTH.TOKEN_ERROR.exeption;
    }

    const profileUser = {};
    // const profileUser = await users.findOne({ id: findedUser.profile_id });

    if (!profileUser) {
      throw AUTH.PROFILE_NOT_FOUND.exeption;
    }

    return true;
  }
}

export default Service;
