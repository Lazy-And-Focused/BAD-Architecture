import { readdirSync } from "fs";
import { join } from "path";

import { Command } from "./command.type";

export class Loader {
  private static readonly FILE_REGEXP = /.+\.command\.(?:ts|js)$/;

  public async execute() {
    const files = this.filterFiles(this.readFolder());
    const commands = files.map((file) => this.loadCommand(file));
    return commands;
  }

  private loadCommand(
    file: string,
  ) {
    const modulePath = join(__dirname, file);
    const imported = require(modulePath);
    const CommandClass = imported.default;

    const command = new CommandClass();
    if (!(command instanceof Command)) {
      throw new Error(`Command ${file} is not a valid command`);
    }

    return command as Command<{ [key: string]: unknown }>;
  }

  private filterFiles(files: string[]): string[] {
    return files.filter((file) => Loader.FILE_REGEXP.test(file));
  }

  private readFolder(): string[] {
    return readdirSync(__dirname);
  }
}

export default Loader;
