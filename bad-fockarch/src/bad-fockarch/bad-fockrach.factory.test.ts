import { SchematicTestRunner } from "@angular-devkit/schematics/testing";
import { Tree } from "@angular-devkit/schematics";
import { join } from "path";

const collectionPath = join(__dirname, "../collection.json");

describe("route-template", () => {
  it("works", async () => {
    const runner = new SchematicTestRunner("schematics", collectionPath);
    const tree = await runner.runSchematic("route-template", {}, Tree.empty());

    expect(tree.files).toEqual([]);
  });
});
