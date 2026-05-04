import type { ArgumentsCamelCase, PositionalOptions } from "yargs";

import { exec } from "child_process";
import { join } from "path";

import Command from "./command.type";

import { RELEASE_URL, RELEASE_FILE_NAME } from "../utils";
import { downloadFile, extractFile } from "../utils/files";
import { resolveChooseFilesAndDelete } from "../utils/files/choose-file";

type Props = {
  name: string;
  path: string;
  "package-manager": "npm" | "pnpm";
};

export class CreateCommand extends Command<Props> {
  public readonly command = "create [name] [path] [package-manager]";
  public readonly description = "create your backend app with BAD";
  public readonly argv: Record<keyof Props, PositionalOptions> = {
    name: {
      type: "string",
      default: "bad-app",
      describe: "name of your app folder",
      demandOption: true,
      coerce: (arg: string) => {
        if (!arg || !/^[\w-]+$/.test(arg)) {
          throw new Error(
            "Invalid project name. Use letters, digits, hyphens and underscores.",
          );
        }
        return arg;
      },
    },
    path: {
      type: "string",
      default: "./",
      describe: "path to your folder",
      normalize: true,
    },
    "package-manager": {
      type: "string",
      default: "npm",
      describe: "Your package manager (npm/pnpm)",
      alias: "pm",
      choices: ["npm", "pnpm"],
    },
  };

  public async execute(argv: ArgumentsCamelCase<Props>): Promise<void> {
    const { name, path, packageManager } = argv;

    const folderPath = join(path, name);
    const archivePath = join(folderPath, RELEASE_FILE_NAME);

    const assetUrl = await this.fetchReleaseAssetUrl();
    await downloadFile(assetUrl, archivePath);
    await extractFile(archivePath);
    await resolveChooseFilesAndDelete(folderPath, packageManager);
    await this.installDependencies(folderPath, packageManager);
  }

  private async installDependencies(
    targetDir: string,
    packageManager: "npm" | "pnpm",
  ): Promise<void> {
    try {
      const { stdout, stderr } = await exec(`${packageManager} install`, {
        cwd: targetDir,
      });
      if (stderr) {
        console.warn(stderr);
      }
      console.log(stdout);
    } catch (error) {
      throw new Error(`Failed to install dependencies`, { cause: error });
    }
  }

  private async fetchReleaseAssetUrl(): Promise<string> {
    const response = await fetch(RELEASE_URL, { method: "GET" });
    if (!response.ok) {
      throw new Error(`Failed to fetch latest release: ${response.statusText}`);
    }

    const release: any = await response.json();
    const assets: any[] = release.assets;
    const asset = assets.find((a) => a.name === RELEASE_FILE_NAME);
    if (!asset) {
      throw new Error(`Asset ${RELEASE_FILE_NAME} not found in latest release`);
    }

    return asset.browser_download_url;
  }
}

export default CreateCommand;
