import { AuthTypes } from "@1/types";
import type { Profile } from "passport";

export class PasswordSingUp {
  username: string;
  nickname?: string;
  password: string;
  email?: string;
}
export class ServiseSingUP {
  profile: Profile;
  accessToken: string;
  refreshToken?: string;
  name: AuthTypes;
}

export class singUp {
  username: string;
  nickname: string;
  email?: string;
  service?: {
    id: string;
    name: AuthTypes;
    accessToken: string;
    refreshToken?: string;
  };
  password?: string;
}
