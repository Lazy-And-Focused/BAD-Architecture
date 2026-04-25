import { readdirSync } from "fs";
import { join } from "path";

import { Command } from "./command.type";

export class Loader {
  private static readonly FILE_REGEXP = /.+\.command\.(?:ts|js)$/;

  public async execute(): Promise<Command<{ [key: string]: unknown }>[]> {
    const files = this.filterFiles(this.readFolder());
    const commands = await Promise.all(
      files.map(async (file) => this.loadCommand(file))
    );
    return commands;
  }

  private async loadCommand(
    file: string
  ): Promise<Command<{ [key: string]: unknown }>> {
    const modulePath = join(__dirname, file);
    const imported = await import(modulePath);
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