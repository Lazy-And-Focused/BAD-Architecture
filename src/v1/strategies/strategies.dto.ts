import type { AuthTypes } from "@1/types";
import type { Profile } from "passport";

export class SingUpByPasswordData {
  username: string;
  nickname?: string;
  password: string;
  email?: string;
}

export class SingInByServiceData {
  profile: Profile;
  accessToken: string;
  refreshToken?: string;
  name: AuthTypes;
}

export class SingUpData {
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
