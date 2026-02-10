import { copyFile, readdir, rm } from "fs/promises";
import { join } from "path";

import { PACKAGE_MANAGER, ROOT } from "./package-manager";
import { INITIALIZED } from "./initialized";

export const CHOOSE_FILE_REGEX = /(.+)--(.+)/;

export const isChooseFile = (file: string) => CHOOSE_FILE_REGEX.test(file);

export const parseChooseFileName = (option: string, name: string) => ({
  option,
  name,
  fullName: `${option}--${name}`,
});

export const filterFiles = (files: string[]) =>
  files.filter((file) => CHOOSE_FILE_REGEX.test(file));

export const chooseFile = (files: string[], option: string): string => {
  return Object.fromEntries(
    filterFiles(files).map((file) =>
      file.match(CHOOSE_FILE_REGEX)!.slice(1, 3),
    ),
  )[option];
};

export const resolveChooseFilesAndDelete = async (
  dir: string,
  option: string,
) => {
  const files = filterFiles(await readdir(dir));
  const chooseFileData = parseChooseFileName(option, chooseFile(files, option));

  const oldName = join(dir, chooseFileData.fullName)
  const newName = join(dir, chooseFileData.name)
  console.log("Creating:", newName, "with", oldName);
  if (INITIALIZED === false) {
    await copyFile(
      oldName,
      newName,
    );
  }
  
  for (const file of files) {
    if (file === chooseFileData.name) {
      continue;
    }
    
    const path = join(dir, file);
    console.log("Deleting:", path);
    if (INITIALIZED === false) {
      await rm(path);
    }
  }

  return chooseFileData;
};

(async () => {
  await resolveChooseFilesAndDelete(ROOT, PACKAGE_MANAGER);
})();
