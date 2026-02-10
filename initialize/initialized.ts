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
  } catch (error) {
    try {
      const inited = readFileSync(join(ROOT, "initialized"), "utf-8");
  
      if (inited === "false") {
        return false as const;
      }
  
      return 0 as const;
    } catch (error) {
      return process.exit();
    }
  }
})();