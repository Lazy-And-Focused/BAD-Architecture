import type { Rule } from "@angular-devkit/schematics";
import { join, normalize } from "@angular-devkit/core";
import { Tree } from "@angular-devkit/schematics";

const DEFAULT_SOURCE_ROOT = "src";

export function isNestProject(host: Tree, extraFiles: string[] = []): boolean {
  const files = ["nest-cli.json", "nest.json", ...extraFiles];
  return files.some((file) => host.exists(file));
}

export function mergeSourceRoot<
  T extends { sourceRoot?: string; path?: string } = any
>(options: T): Rule {
  return (host: Tree) => {
    const isInRoot = isNestProject(host, ["tsconfig.json", "package.json"]);
    if (!isInRoot) {
      return host;
    }
    const sourceRoot = options.sourceRoot ?? DEFAULT_SOURCE_ROOT;

    options.path =
      options.path !== undefined
        ? join(normalize(sourceRoot), options.path)
        : normalize(sourceRoot);
    return host;
  };
}