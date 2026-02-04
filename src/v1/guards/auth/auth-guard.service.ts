import type { Request } from "express";
import type { Auth } from "@1/types";

import Hash from "@1/services/hash.service";
import AUTH from "@1/errors/guards/auth.errors";

export class Service {
  public static async validateRequest(req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { successed, id, token, profile_id } = Hash.parse(req);

    if (!successed) {
      throw AUTH.HASH_PARSE.exeption;
    }

    const findedUser = {} as Auth;
    // const findedUser = await auth.findOne({ id: id });

    if (!findedUser) {
      throw AUTH.USER_NOT_FOUND.exeption;
    }

    if (findedUser.profile_id !== profile_id) {
      throw AUTH.PROFILE_ID.exeption;
    }

    if (token !== new Hash().execute(findedUser.access_token)) {
      throw AUTH.TOKEN_ERROR.exeption;
    }

    const profileUser = {};
    // const profileUser = await users.findOne({ id: findedUser.profile_id });

    if (!profileUser) {
      throw AUTH.PROFILE_NOT_FOUND.exeption;
    }

    console.log("User access granted");
    return true;
  }
}

export default Service;
