import { join } from "path";
import { ROOT } from "./package-manager";
import { existsSync, readFileSync } from "fs";

export const INITIALIZED = (() => {
  try {
    const dryrun = existsSync(join(ROOT, "dryrun"));
    if (dryrun) {
      console.log("DRY RUN ENABLED");
      return 0 as const;
    }
    throw new Error("DRY RUN DISABLED");
  } catch {
    try {
      const initialized = readFileSync(join(ROOT, "initialized"), "utf-8");
  
      if (initialized === "false") {
        return false as const;
      }
  
      return 0 as const;
    } catch {
      return process.exit();
    }
  }
})();