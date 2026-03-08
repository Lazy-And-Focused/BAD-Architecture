import { readdir, rm } from "fs/promises";
import { join } from "path";

import { INITIALIZE_DIR, ROOT, SETTINGS_FILE_NAME } from "./constants";
import { SETTINGS } from "./settings";

(async () => {
  const settingsPath = join(ROOT, SETTINGS_FILE_NAME);
  console.log("Deleting:", settingsPath);
  if (!SETTINGS.dryrunEnabled) {
    await rm(settingsPath, { recursive: true, force: true });
  }

  const initializeDirPath = join(ROOT, INITIALIZE_DIR);
  console.log(
    "Deleting:",
    initializeDirPath,
    "and",
    await readdir(initializeDirPath, { recursive: true }),
  );

  if (!SETTINGS.dryrunEnabled) {
    await rm(initializeDirPath, { recursive: true, force: true });
  }
})();
