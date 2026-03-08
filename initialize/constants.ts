import { readdirSync } from "fs";
import { join } from "path";

export const ROOT = join(__dirname, "..");
export const SETTINGS_FILE_NAME = "bad.json" as const;

export const INITIALIZE_DIR = "initialize";

export const enum LOCK_FILES {
  pnpm = "pnpm-lock.yaml",
  npm = "package-lock.json",
}

export const PACKAGE_MANAGER = (() => {
  const files = readdirSync(ROOT);
  const isNpm = files.includes(LOCK_FILES.npm);

  if (isNpm) {
    return "npm" as const;
  }

  return "pnpm" as const;
})();
