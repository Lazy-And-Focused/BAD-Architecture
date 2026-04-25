import { runSchematic } from "../utils/test-helper";

describe("bad-fockarch schematic", () => {
  it("should generate required files for a simple route", async () => {
    const tree = await runSchematic("bad-fockarch", { name: "test" });
    const files = tree.files;

    expect(files).toContain("/test/test.controller.ts");
    expect(files).toContain("/test/test.service.ts");
    expect(files).toContain("/test/test.module.ts");
    expect(files).toContain("/test/test.routes.ts");
    expect(files).toContain("/test/index.ts");
    expect(files).toContain("/test/dto/test-create.dto.ts");
    expect(files).toContain("/test/dto/test-update.dto.ts");
    expect(files).toContain("/test/test.controller.spec.ts");
    expect(files).toContain("/test/test.service.spec.ts");
  });

  it("should not generate spec files when spec option is false", async () => {
    const tree = await runSchematic("bad-fockarch", {
      name: "test",
      spec: false,
    });
    const files = tree.files;
    const specFiles = files.filter((f) => f.endsWith(".spec.ts"));
    expect(specFiles.length).toBe(0);
  });
});
