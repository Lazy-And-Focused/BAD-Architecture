import { config } from "dotenv";
import { ENV_FILE_NAME } from "../programm-mode";

config({
  path: ENV_FILE_NAME
});

import type { Env } from "./config.types";
import type { UnionToIntersection } from "@/types/utility.types";

import { AuthTypes } from "@1/types";

import { DEFAULT_VALUES } from "./config.constants";
import { transformAuthData, transformRequired, transformUnique } from "./config.transformers";

export const env: Env = ((): Env => {
  const data = [
    transformAuthData(),
    transformRequired(),
    transformUnique()
  ] as const;

  if (data.some(v => v.errorAppeared)) {
    process.exit();
  }

  type Config = UnionToIntersection<(typeof data)[number]["data"]>;
  const config = data.map(v => v.data).reduce((p, c) => Object.assign(p, c)) as Config;

  return {
    ...DEFAULT_VALUES,
    ...process.env,
    ...config
  }
})();

export const getPassportEnv = (type: Uppercase<AuthTypes>) => {
  return {
    id: env[type + "_CLIENT_ID"],
    secret: env[type + "_CLIENT_SECRET"],
    callback: env[type + "_CALLBACK_URL"],
  } as const;
};

export default env;
