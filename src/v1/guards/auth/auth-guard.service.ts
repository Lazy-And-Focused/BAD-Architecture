import type { Request } from "express";
import type { Auth } from "types";

import Hash from "services/hash.service";
import authErrors from "errors/guards/auth.errors";

export class Service {
  public static async validateRequest(req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { successed, id, token, profile_id } = Hash.parse(req);

    if (!successed) {
      throw new Error(authErrors.hashParseError);
    }

    const findedUser = {} as Auth;
    // const findedUser = await auth.findOne({ id: id });

    if (!findedUser) {
      throw new Error(authErrors.userNotFound);
    }

    if (findedUser.profile_id !== profile_id) {
      throw new Error(authErrors.profileIdError);
    }

    if (token !== new Hash().execute(findedUser.access_token)) {
      throw new Error(authErrors.tokenError);
    }

    const profileUser = {};
    // const profileUser = await users.findOne({ id: findedUser.profile_id });

    if (!profileUser) {
      throw new Error(authErrors.profileNotFound);
    }

    console.log("User access granted");
    return true;
  }
}

export default Service;
