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

function transform(options: BadFockarchOptions): BadFockarchOptions {
  const target: BadFockarchOptions = Object.assign({}, options);

  if (!target.name) {
    throw new SchematicsException("Option (name) is required.");
  }

  const location: Location = new NameParser().parse(target);

  target.name = normalizeToKebabOrSnakeCase(location.name);
  target.constant = toConstantCase(location.name);
  target.path = normalizeToKebabOrSnakeCase(location.path);
  target.language = target.language !== undefined ? target.language : "ts";
  target.specFileSuffix = normalizeToKebabOrSnakeCase(
    options.specFileSuffix || "test",
  );

  target.path = target.flat
    ? target.path
    : join(target.path as Path, target.name);

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
  return chain([
    mergeSourceRoot(options),
    mergeWith(generate(options)),
    (tree, context) => {
      console.log({ tree, context });
    },
  ]);
};
