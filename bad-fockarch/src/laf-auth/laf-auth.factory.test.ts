import { runSchematic } from "../utils/test-helper";

describe("laf-auth schematic", () => {
  it("should generate auth module files", async () => {
    const tree = await runSchematic("laf-auth", { name: "session" });
    const files = tree.files;

    expect(files).toContain("/session/session.controller.ts");
    expect(files).toContain("/session/session.module.ts");
    expect(files).toContain("/session/session.routes.ts");
  });
});