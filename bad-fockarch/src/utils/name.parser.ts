import type { Path } from "@angular-devkit/core";
import { basename, dirname, join, normalize } from "@angular-devkit/core";

export interface ParseOptions {
  name: string;
  path?: string;
}

export interface Location {
  name: string;
  path: Path;
}

export class NameParser {
  public parse(options: ParseOptions): Location {
    const nameWithoutPath: string = basename(options.name as Path);
    const namePath: string = dirname(
      join((options.path ?? "") as Path, options.name)
    );
    
    return {
      name: nameWithoutPath,
      path: normalize(join("/" as Path, namePath)),
    };
  }
}