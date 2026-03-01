import type { Unique } from "./env.validators";
import { VALIDATORS } from "./env.validators";

import { AuthTypes } from "@1/types";
import { Env } from "fenviee";

export type AuthData = (typeof AUTH_DATA)[number];
export type AuthProperty = `${Uppercase<AuthTypes>}_${AuthData}`;

export const AUTH_TYPES = Object.keys(AuthTypes).map(key => key.toUpperCase() as Uppercase<AuthTypes>);

export const AUTH_DATA = [
  "CLIENT_ID",
  "CLIENT_SECRET",
  "CALLBACK_URL",
] as const;

export const AUTH_PROPERTIES = AUTH_TYPES.flatMap(type => {
  return AUTH_DATA.map(data => `${type}_${data}` as AuthProperty);
});

export const env = Env.create<Unique>(process.env)({
  required: [
    ...AUTH_PROPERTIES,
    "CLIENT_URL",

    "SESSION_SECRET",
    "HASH_KEY",
    "DATABASE_URL",
    "SENTRY_URL",
  ] as const,

  partial: [
    "ENCODING_TYPE",
    "PORT",
    "CACHE_TIME_TO_LIVE_IN_MILLISECONDS",
    "THROLLER_TIME_TO_LIVE_IN_MILLISECONDS",
    "THROLLER_LIMIT",
    "AVAILABLE_USERNAME_SYMBOLS",
  ] as const,

  default: {
    ENCODING_TYPE: "hex",
    PORT: "3001",
    CACHE_TIME_TO_LIVE_IN_MILLISECONDS: "300000",
    THROLLER_TIME_TO_LIVE_IN_MILLISECONDS: "20000",
    THROLLER_LIMIT: "20",
    AVAILABLE_USERNAME_SYMBOLS: "abcdefghijklmnopqrstuvwxyz",
  },

  unique: VALIDATORS
});

export const { PROGRAM_MODE } = env;