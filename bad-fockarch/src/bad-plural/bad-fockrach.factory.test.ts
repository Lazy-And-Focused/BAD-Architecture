import { runSchematic } from "../utils/test-helper";

describe("bad-plural schematic", () => {
  it("should generate required files for a simple route", async () => {
    const tree = await runSchematic("bad-plural", { name: "test" });
    const files = tree.files;

    expect(files).toContain("/tests/tests.controller.ts");
    expect(files).toContain("/tests/tests.service.ts");
    expect(files).toContain("/tests/tests.module.ts");
    expect(files).toContain("/tests/tests.routes.ts");
    expect(files).toContain("/tests/index.ts");
    expect(files).toContain("/tests/dto/test-create.dto.ts");
    expect(files).toContain("/tests/dto/test-update.dto.ts");
    expect(files).toContain("/tests/tests.controller.test.ts");
    expect(files).toContain("/tests/tests.service.test.ts");
  });

  it("should not generate spec files when spec option is false", async () => {
    const tree = await runSchematic("bad-plural", {
      name: "test",
      spec: false,
    });
    const testFiles = tree.files.filter((f) => f.endsWith(".test.ts"));
    expect(testFiles).toHaveLength(0);
  });
});
