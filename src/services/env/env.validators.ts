import type { ProgramMode, TokenExpiration } from "./validators";

import { normalizeProgramMode, validateTokenExpiration } from "./validators";

export type Unique = {
  TOKEN_EXPIRATION: TokenExpiration;
  PROGRAM_MODE: ProgramMode
}

export type Validators = {
  [P in keyof Unique]: (value?: string) => Unique[P];
}

export const VALIDATORS: Validators = {
  TOKEN_EXPIRATION: validateTokenExpiration,
  PROGRAM_MODE: normalizeProgramMode
}
