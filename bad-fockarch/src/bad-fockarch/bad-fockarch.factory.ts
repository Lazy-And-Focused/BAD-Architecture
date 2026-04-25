import type { Rule } from "@angular-devkit/schematics";
import type { Schema as BadFockarchOptions } from "./bad-fockarch.schema";

import { chain, mergeWith } from "@angular-devkit/schematics";

import { mergeSourceRoot } from "../utils";
import { createTransform, createGenerate } from "../utils/factory-helpers";

export const main = (options: BadFockarchOptions): Rule => {
  const transformedOptions = createTransform(options);
  return chain([
    mergeSourceRoot(transformedOptions),
    mergeWith(createGenerate(transformedOptions)),
  ]);
};
