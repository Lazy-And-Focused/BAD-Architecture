import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { ROOT, SETTINGS_FILE_NAME } from "./constants";

const rawSettings = (() => {
  const path = join(ROOT, SETTINGS_FILE_NAME);
  if (!existsSync(path)) {
    return {
      initialized: true,
      dryrunEnabled: false,
    };
  }

  return JSON.parse(readFileSync(path, "utf-8"));
})();

export const SETTINGS = (() => {
  const initialized = Boolean(rawSettings.initialized);
  const dryrunEnabled = Boolean(rawSettings.dryrunEnabled);

  console.log("INITIALIZED:", initialized);
  console.log("DRY RUN:", dryrunEnabled);

  return {
    initialized,
    dryrunEnabled,
  } as const;
})();
