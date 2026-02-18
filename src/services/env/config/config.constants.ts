import type { PartialProperties } from "./config.types";

export const REQUIRED_VALUES = [
  "CLIENT_URL",

  "SESSION_SECRET",
  "HASH_KEY",
  "DATABASE_URL",
  "SENTRY_URL",
] as const;

export const UNIQUE_VALUES = ["TOKEN_EXPIRATION"] as const;

export const ALL_VALUES = [
  ...REQUIRED_VALUES,
  ...UNIQUE_VALUES,
  "ENCODING_TYPE",
  "PORT",
  "CACHE_TIME_TO_LIVE_IN_MILLISECONDS",
  "THROLLER_TIME_TO_LIVE_IN_MILLISECONDS",
  "THROLLER_LIMIT",
  "AVAILABLE_USERNAME_SYMBOLS",
] as const;

export const AUTH_DATA = ["CLIENT_ID", "CLIENT_SECRET", "CALLBACK_URL"] as const;

export const DEFAULT_VALUES: Record<PartialProperties, string> = {
  ENCODING_TYPE: "hex",
  PORT: "3001",
  CACHE_TIME_TO_LIVE_IN_MILLISECONDS: "300000",
  THROLLER_TIME_TO_LIVE_IN_MILLISECONDS: "20000",
  THROLLER_LIMIT: "20",
  AVAILABLE_USERNAME_SYMBOLS: "abcdefghijklmnopqrstuvwxyz",
  TOKEN_EXPIRATION: "28d",
};
