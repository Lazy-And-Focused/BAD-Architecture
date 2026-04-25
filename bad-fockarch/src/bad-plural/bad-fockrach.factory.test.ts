import { runSchematic } from "../utils/test-helper";

describe("bad-fockarch schematic", () => {
  it("should generate required files for a simple route", async () => {
    const tree = await runSchematic("bad-fockarch", { name: "test" });
    const files = tree.files;

    expect(files).to.include("/test/test.controller.ts");
    expect(files).to.include("/test/test.service.ts");
    expect(files).to.include("/test/test.module.ts");
    expect(files).to.include("/test/test.routes.ts");
    expect(files).to.include("/test/index.ts");
    expect(files).to.include("/test/dto/test-create.dto.ts");
    expect(files).to.include("/test/dto/test-update.dto.ts");
    expect(files).to.include("/test/test.controller.spec.ts");
    expect(files).to.include("/test/test.service.spec.ts");
  });

  it("should not generate spec files when spec option is false", async () => {
    const tree = await runSchematic("bad-fockarch", {
      name: "test",
      spec: false,
    });
    const files = tree.files;
    const specFiles = files.filter(f => f.endsWith(".spec.ts"));
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(specFiles).to.be.empty;
  });
});