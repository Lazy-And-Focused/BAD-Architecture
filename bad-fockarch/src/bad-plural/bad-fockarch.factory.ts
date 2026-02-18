import type { Path } from "@angular-devkit/core";

import type {
  Rule,
  SchematicContext,
  Source,
} from "@angular-devkit/schematics";

import type { Schema as BadFockarchOptions } from "./bad-fockarch.schema";

import type { Location } from "../utils";

import {
  NameParser,
  normalizeToKebabOrSnakeCase,
  mergeSourceRoot,
  toConstantCase,
} from "../utils";

import { join, strings } from "@angular-devkit/core";
import {
  SchematicsException,
  apply,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  template,
  url,
} from "@angular-devkit/schematics";

function pluralize(name: string) {
  if (
    name.endsWith("y") &&
    !name.endsWith("ay") &&
    !name.endsWith("ey") &&
    !name.endsWith("iy") &&
    !name.endsWith("oy") &&
    !name.endsWith("uy")
  ) {
    return name.slice(0, -1) + "ies";
  } else if (
    name.endsWith("s") ||
    name.endsWith("x") ||
    name.endsWith("z") ||
    name.endsWith("ch") ||
    name.endsWith("sh")
  ) {
    return name + "es";
  } else {
    return name + "s";
  }
}

function transform(options: BadFockarchOptions): BadFockarchOptions {
  const target: BadFockarchOptions = Object.assign({}, options);

  if (!target.name) {
    throw new SchematicsException("Option (name) is required.");
  }

  const location: Location = new NameParser().parse(target);

  target.name = normalizeToKebabOrSnakeCase(location.name);
  target.plural = normalizeToKebabOrSnakeCase(pluralize(location.name));
  target.constant = toConstantCase(pluralize(location.name));
  target.path = normalizeToKebabOrSnakeCase(location.path);
  target.language = target.language !== undefined ? target.language : "ts";
  target.specFileSuffix = normalizeToKebabOrSnakeCase(
    options.specFileSuffix || "test",
  );

  target.path = target.flat
    ? target.path
    : join(target.path as Path, target.plural);

  return target;
}

const generate = (options: BadFockarchOptions): Source => {
  return (context: SchematicContext) =>
    apply(url(join("./files" as Path, options.language || "ts")), [
      options.spec ? noop() : filter((path) => !path.endsWith(".spec.ts")),
      options.spec
        ? noop()
        : filter((path) => {
            const languageExtension = options.language || "ts";
            const suffix = `.__specFileSuffix__.${languageExtension}`;
            return !path.endsWith(suffix);
          }),
      template({
        ...strings,
        ...options,
      }),
      move(options.path || ""),
    ])(context);
};

export const main = (options: BadFockarchOptions): Rule => {
  options = transform(options);
  return chain([mergeSourceRoot(options), mergeWith(generate(options))]);
};
