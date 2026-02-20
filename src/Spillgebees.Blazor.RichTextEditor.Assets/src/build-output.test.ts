import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

describe("vite build output", () => {
  const outputDir = resolve(import.meta.dirname ?? __dirname, "../../Spillgebees.Blazor.RichTextEditor/wwwroot");
  const jsFile = resolve(outputDir, "Spillgebees.Blazor.RichTextEditor.lib.module.js");
  const cssFile = resolve(outputDir, "Spillgebees.Blazor.RichTextEditor.lib.module.css");

  beforeAll(() => {
    // Run the production build before checking output
    execSync("pnpm run build:prod", {
      cwd: resolve(import.meta.dirname ?? __dirname, ".."),
      stdio: "pipe",
    });
  });

  it("should produce the JS bundle file", () => {
    // arrange & act
    const exists = existsSync(jsFile);

    // assert
    expect(exists).toBe(true);
  });

  it("should produce the CSS bundle file", () => {
    // arrange & act
    const exists = existsSync(cssFile);

    // assert
    expect(exists).toBe(true);
  });

  it("should contain ESM syntax in the JS bundle", () => {
    // arrange & act
    const content = readFileSync(jsFile, "utf-8");

    // assert
    expect(content).toContain("export");
  });

  it("should contain Quill-related styles in the CSS bundle", () => {
    // arrange & act
    const content = readFileSync(cssFile, "utf-8");

    // assert
    expect(content).toContain(".ql-");
  });
});
