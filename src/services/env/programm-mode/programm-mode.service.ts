import { Alias, NotAliasMode } from "./programm-mode.types";
import { ALIASES, DEFAULT_MODE } from "./programm-mode.constants";
import { isAlias, isMode } from "./programm-mode.validators";

export const PROGRAMM_MODE: NotAliasMode = (() => {
  const mode = process.env.PROGRAMM_MODE || process.env.NODE_ENV;
  if (!mode) {
    return DEFAULT_MODE;
  }

  if (!isMode(mode)) {
    throw new Error(`unknown programm mode in .env: ${mode}`);
  }

  const outputMode = (() => {
    if (isAlias(mode)) {
      return ALIASES[mode as Alias];
    }

    return mode;
  })();

  return outputMode as NotAliasMode;
})();

const DEFAULT_ENV_FILE_NAME = ".env" as const;

export const ENV_FILE_NAME = (() => {
  if (PROGRAMM_MODE === "production") {
    return DEFAULT_ENV_FILE_NAME;
  }

  return `${DEFAULT_ENV_FILE_NAME}.${PROGRAMM_MODE}` as const;
})();
