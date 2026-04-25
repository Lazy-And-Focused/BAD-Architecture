import { runSchematic } from "../utils/test-helper";

describe("bad-plural schematic", () => {
  it("should generate files with pluralized name", async () => {
    const tree = await runSchematic("bad-plural", { name: "cat" });
    const files = tree.files;
    expect(files).toContain("/cats/cats.controller.ts");
    expect(files).toContain("/cats/cats.service.ts");
    expect(files).toContain("/cats/cats.module.ts");
    expect(files).toContain("/cats/cats.routes.ts");
    expect(files).toContain("/cats/dto/cat-create.dto.ts");
    expect(files).toContain("/cats/dto/cat-update.dto.ts");
  });
});