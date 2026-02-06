import { config } from "dotenv";
import { logger } from "./logger.service";

if (process.env.NODE_ENV !== "production") {
  config({
    path: ".env." + process.env.NODE_ENV,
  });
} else {
  config();
}

import { AuthTypes } from "@1/types";
import {
  StringValue,
  validateString as validateExpirationString,
} from "./unit-time.service";

export const REQUIRED = [
  "CLIENT_URL",

  "SESSION_SECRET",
  "HASH_KEY",
  "DATABASE_URL",
  "SENTRY_URL",
] as const;

export const UNIQUE = ["TOKEN_EXPIRATION"] as const;

export type UniqueProperties = {
  TOKEN_EXPIRATION: StringValue;
};

export const ALL = [
  ...REQUIRED,
  ...UNIQUE,
  "ENCODING_TYPE",
  "PORT",
  "CACHE_TIME_TO_LIVE_IN_MILLISECONDS",
  "THROLLER_TIME_TO_LIVE_IN_MILLISECONDS",
  "THROLLER_LIMIT",
  "AVAILABLE_USERNAME_SYMBOLS",
] as const;

const AUTH_DATA = ["CLIENT_ID", "CLIENT_SECRET", "CALLBACK_URL"] as const;

type AuthData = (typeof AUTH_DATA)[number];
export type Required =
  | (typeof REQUIRED)[number]
  | `${Uppercase<AuthTypes>}_${AuthData}`;
export type All = (typeof ALL)[number];
export type Ussualy = Exclude<All, keyof UniqueProperties>;
export type Partial = Exclude<All, Required>;

type Env = Record<Ussualy, string> & UniqueProperties;

const DEFAULT: Record<Partial, string> = {
  ENCODING_TYPE: "hex",
  PORT: "3001",
  CACHE_TIME_TO_LIVE_IN_MILLISECONDS: "300000",
  THROLLER_TIME_TO_LIVE_IN_MILLISECONDS: "20000",
  THROLLER_LIMIT: "20",
  AVAILABLE_USERNAME_SYMBOLS: "abcdefghijklmnopqrstuvwxyz",
  TOKEN_EXPIRATION: "28d",
};

type Validators = {
  [P in keyof UniqueProperties]: (value?: string) => UniqueProperties[P];
};

const VALIDATORS: Validators = {
  TOKEN_EXPIRATION: validateExpirationString,
};

export const env: Env = ((): Env => {
  let errorAppeared: boolean = false;

  const arrayAuthData = AUTH_DATA.flatMap((data) => {
    return Object.keys(AuthTypes).map((type) => {
      const key = `${type.toUpperCase()}_${data}`;
      const value = process.env[key];
      if (value) {
        return [key, value] as [string, string];
      }

      errorAppeared = true;
      const error = logger
        .error(
          new Error(`Auth data ${data} for type ${type} is not defined in env`),
        )
        .base.join("\n");
      return [key, error] as [string, string];
    });
  });

  const arrayRequired = REQUIRED.map((key) => {
    const value = process.env[key];
    if (value) {
      return [key, value] as [typeof key, string];
    }

    errorAppeared = true;
    const error = logger
      .error(new Error(`Key ${key} is not defined in env`))
      .base.join("\n");
    return [key, error] as [typeof key, string];
  });

  const arrayUnique = UNIQUE.map((key) => {
    const value = process.env[key];
    try {
      return [key, VALIDATORS[key](value)] as const;
    } catch (err) {
      errorAppeared = true;
      const error = logger.error(err).base.join("\n");
      return [
        key,
        error as unknown as ReturnType<(typeof VALIDATORS)[typeof key]>,
      ] as const;
    }
  });

  const objectRequired = {
    ...Object.fromEntries(arrayAuthData),
    ...Object.fromEntries(arrayRequired),
  } as Record<Required, string>;

  const objectUnique = Object.fromEntries(arrayUnique) as UniqueProperties;

  if (errorAppeared) {
    return process.exit();
  }

  return {
    ...DEFAULT,
    ...process.env,
    ...objectRequired,
    ...objectUnique,
  };
})();

export const getPassportEnv = (type: Uppercase<AuthTypes>) => {
  return {
    id: env[type + "_CLIENT_ID"],
    secret: env[type + "_CLIENT_SECRET"],
    callback: env[type + "_CALLBACK_URL"],
  } as const;
};

export default env;
