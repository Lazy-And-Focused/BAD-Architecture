export interface CreateUserByPasswordEntity {
  username: string;
  nickname?: string;
  password: string;
  email?: string;
}

export type SignInByPasswordUserEntity = Pick<
  CreateUserByPasswordEntity,
  "username" | "password"
>;
