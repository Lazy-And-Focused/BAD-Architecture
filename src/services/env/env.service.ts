import { config } from "dotenv";

import { getEnvFileName } from "./validators";

config({
  path: getEnvFileName(),
});

import type { Unique } from "./env.validators";
import { VALIDATORS } from "./env.validators";

import { AUTH_PROPERTIES, GROUPED_AUTH_PROPERTIES } from "./env.auth";

import { AuthTypes } from "@1/types";
import { Env } from "fenviee";

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

  unique: VALIDATORS,

  dangerousIgnoreErrors: process.env.IGNORE === "true",
});

export const getPassportEnv = (type: Uppercase<AuthTypes>) => {
  const { CLIENT_ID, CLIENT_SECRET, CALLBACK_URL } =
    GROUPED_AUTH_PROPERTIES[type];

  return {
    id: CLIENT_ID,
    secret: CLIENT_SECRET,
    callback: CALLBACK_URL,
  };
};

export const { PROGRAM_MODE } = env;
