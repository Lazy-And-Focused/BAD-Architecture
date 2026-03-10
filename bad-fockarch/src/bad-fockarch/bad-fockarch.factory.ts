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

const transform = (badOptions: BadFockarchOptions): BadFockarchOptions => {
  const options: BadFockarchOptions = Object.assign({}, badOptions);
  if (!options.name) {
    throw new SchematicsException("Option (name) is required.");
  }

  const location: Location = new NameParser().parse(options);

  options.name = normalizeToKebabOrSnakeCase(location.name);
  options.constant = toConstantCase(location.name);
  options.path = normalizeToKebabOrSnakeCase(location.path);
  options.language = options.language !== undefined ? options.language : "ts";
  options.specFileSuffix = normalizeToKebabOrSnakeCase(
    badOptions.specFileSuffix || "test",
  );

  options.path = options.flat
    ? options.path
    : join(options.path as Path, options.name);

  return options;
};

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

export const main = (badOptions: BadFockarchOptions): Rule => {
  const options = transform(badOptions);
  return chain([
    mergeSourceRoot(options),
    mergeWith(generate(options)),
    (tree, context) => {
      console.log({ tree, context });
    },
  ]);
};
