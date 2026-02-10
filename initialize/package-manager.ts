import { readdirSync } from "fs";
import { join } from "path";

export const enum LOCK_FILES {
  pnpm = "pnpm-lock.yaml",
  npm = "package-lock.json"
}

export const ROOT = join(__dirname, "..");

const FILES = readdirSync(ROOT);

export const PACKAGE_MANAGER = (() => {
  const isNpm = FILES.includes(LOCK_FILES.npm)
  
  if (isNpm) {
    return "npm" as const;
  }

  return "pnpm" as const;
})();