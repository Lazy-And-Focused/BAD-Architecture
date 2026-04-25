// src/bad-fockarch/bad-fockarch.factory.test.ts
import { runSchematic } from "../utils/test-helper";

describe("bad-fockarch schematic", () => {
  it("should generate required files for a simple route", async () => {
    const tree = await runSchematic("bad-fockarch", { name: "test" });
    const files = tree.files;

    // Проверяем наличие основных файлов
    expect(files).toContain("/test/test.controller.ts");
    expect(files).toContain("/test/test.service.ts");
    expect(files).toContain("/test/test.module.ts");
    expect(files).toContain("/test/test.routes.ts");
    expect(files).toContain("/test/index.ts");
    expect(files).toContain("/test/dto/test-create.dto.ts");
    expect(files).toContain("/test/dto/test-update.dto.ts");
    // spec файлы по умолчанию генерируются, т.к. spec=true
    expect(files).toContain("/test/test.controller.spec.ts");
    expect(files).toContain("/test/test.service.spec.ts");
  });

  it("should not generate spec files when spec option is false", async () => {
    const tree = await runSchematic("bad-fockarch", {
      name: "test",
      spec: false,
    });
    const files = tree.files;
    expect(files.some(f => f.endsWith(".spec.ts"))).toBe(false);
  });
});