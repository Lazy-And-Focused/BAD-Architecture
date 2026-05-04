// src/utils/test-helper.ts
import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";
import { join } from "path";

const collectionPath = join(__dirname, "../collection.json");

export async function runSchematic(
  schematicName: string,
  options: Record<string, any> = {},
): Promise<UnitTestTree> {
  const runner = new SchematicTestRunner("schematics", collectionPath);
  return runner.runSchematic(schematicName, options);
}
