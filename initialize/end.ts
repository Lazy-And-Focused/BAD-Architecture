import { readdirSync, rmSync } from "fs";
import { join } from "path";

import { ROOT } from "./package-manager";
import { INITIALIZED } from "./initialized";

(() => {
  const initializedPath = join(ROOT, "initialized");
  console.log("Deleteing:", initializedPath);
  if (INITIALIZED === false) {
    rmSync(initializedPath, { recursive: true, force: true });
  }

  const initializeDirPath = join(ROOT, "initialize");
  console.log(
    "Deleting:",
    initializeDirPath,
    "and",
    readdirSync(initializeDirPath, { recursive: true }),
  );
  if (INITIALIZED === false) {
    rmSync(initializeDirPath, { recursive: true, force: true });
  }
})();
