import type { Path } from "@angular-devkit/core";
import type {
  SchematicContext,
  Source,
} from "@angular-devkit/schematics";
import type { Location } from "./name.parser";
import { join, strings } from "@angular-devkit/core";
import {
  apply,
  filter,
  move,
  noop,
  template,
  url,
} from "@angular-devkit/schematics";
import { convertToKebabCase, convertToConstantCase, pluralize } from "./formatting";
import { NameParser } from "./name.parser";

export interface BaseSchema {
  name: string;
  path?: string | Path;
  language?: string;
  sourceRoot?: string;
  spec?: boolean;
  specFileSuffix?: string;
  flat?: boolean;
  plural?: string;
  constant?: string;
}

export interface TransformOptions {
  pluralizeName?: boolean;
}

const DEFAULT_LANGUAGE = "ts";
const DEFAULT_SPEC_SUFFIX = "test";

export function createTransform<T extends BaseSchema>(
  options: T,
  opts?: TransformOptions
): T {
  const target: T = Object.assign({}, options);

  if (!target.name) {
    throw new Error("Option (name) is required.");
  }

  const location: Location = new NameParser().parse(target);

  target.name = convertToKebabCase(location.name);
  target.path = convertToKebabCase(location.path);
  target.language = target.language ?? DEFAULT_LANGUAGE;
  target.specFileSuffix = convertToKebabCase(
    options.specFileSuffix || DEFAULT_SPEC_SUFFIX
  );

  if (opts?.pluralizeName) {
    target.plural = convertToKebabCase(pluralize(location.name));
    target.constant = convertToConstantCase(pluralize(location.name));
  } else {
    target.constant = convertToConstantCase(location.name);
  }

  target.path = target.flat
    ? target.path
    : join(target.path as Path, (target as any).plural ?? target.name);

  return target;
}

export function createGenerate(options: BaseSchema): Source {
  return (context: SchematicContext) =>
    apply(url(join("./files" as Path, options.language || DEFAULT_LANGUAGE)), [
      options.spec ? noop() : filter((path) => !path.endsWith(".spec.ts")),
      options.spec
        ? noop()
        : filter((path) => {
            const langExt = options.language || DEFAULT_LANGUAGE;
            const suffix = `.__specFileSuffix__.${langExt}`;
            return !path.endsWith(suffix);
          }),
      template({
        ...strings,
        ...options,
      }),
      move(options.path || ""),
    ])(context);
}