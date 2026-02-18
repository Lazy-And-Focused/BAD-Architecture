export type { User } from "@/database/generated/client";

export interface SignInByPasswordUser {
  username: string;
  password: string;
}

export interface CreateUserByPassword extends SignInByPasswordUser {
  nickname?: string;
  email?: string;
}
