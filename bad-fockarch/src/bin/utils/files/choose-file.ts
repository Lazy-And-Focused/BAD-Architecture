import { copyFile, readdir, rm } from "fs/promises";
import { join } from "path";
import { CHOOSE_FILE_REGEX } from "../constants";

const isChooseFile = (file: string) => CHOOSE_FILE_REGEX.test(file);

const createChooseFileName = (option: string, name: string) => ({
  option,
  name,
  fullName: `${option}--${name}`,
});

const filterFiles = (files: string[]) => files.filter(isChooseFile);

const chooseFile = (files: string[], option: string): string => {
  const entries = filterFiles(files).map((file) => {
    const match = file.match(CHOOSE_FILE_REGEX);
    return match ? [match[1], match[2]] : null;
  });
  const map = Object.fromEntries(entries.filter(Boolean) as [string, string][]);
  return map[option];
};

export const resolveChooseFilesAndDelete = async (
  dir: string,
  option: string,
) => {
  const files = await readdir(dir);
  const selectedName = chooseFile(files, option);
  if (!selectedName) {
    throw new Error(`No file found for option: ${option}`);
  }
  const { fullName, name } = createChooseFileName(option, selectedName);

  await copyFile(join(dir, fullName), join(dir, name));

  for (const file of filterFiles(files)) {
    if (file === name) continue;
    await rm(join(dir, file));
  }

  return { fullName, name, option };
};
