import { execSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const distDir = resolve(import.meta.dirname!, "../../Spillgebees.Blazor.RichTextEditor/wwwroot");

type BuildName = "dev" | "prod";

const buildConfigs: {
  name: BuildName;
  script: string;
  expectJsSourcemap: boolean;
  expectCssSourcemap: boolean;
  expectMinifiedSmaller?: boolean;
}[] = [
  {
    name: "dev",
    script: "build:dev",
    expectJsSourcemap: true,
    // Vite library mode doesn't emit CSS sourcemaps without css.devSourcemap
    expectCssSourcemap: false,
  },
  {
    name: "prod",
    script: "build:prod",
    expectJsSourcemap: false,
    expectCssSourcemap: false,
    expectMinifiedSmaller: true,
  },
];

type BuildResult = {
  jsContent: string;
  cssContent: string;
  jsSize: number;
  hasJsFile: boolean;
  hasCssFile: boolean;
  hasJsMapFile: boolean;
  hasCssMapFile: boolean;
};

const results = new Map<BuildName, BuildResult>();

beforeAll(() => {
  const cwd = resolve(import.meta.dirname!, "..");
  for (const cfg of buildConfigs) {
    execSync(`pnpm run clean && pnpm run ${cfg.script}`, {
      cwd,
      stdio: "pipe",
    });

    const jsFile = resolve(distDir, "Spillgebees.Blazor.RichTextEditor.lib.module.js");
    const cssFile = resolve(distDir, "Spillgebees.Blazor.RichTextEditor.lib.module.css");
    const jsMapFile = `${jsFile}.map`;
    const cssMapFile = `${cssFile}.map`;

    const hasJsFile = existsSync(jsFile);
    const hasCssFile = existsSync(cssFile);
    const hasJsMapFile = existsSync(jsMapFile);
    const hasCssMapFile = existsSync(cssMapFile);
    const jsContent = hasJsFile ? readFileSync(jsFile, "utf-8") : "";
    const cssContent = hasCssFile ? readFileSync(cssFile, "utf-8") : "";
    const jsSize = hasJsFile ? statSync(jsFile).size : 0;

    results.set(cfg.name, {
      jsContent,
      cssContent,
      jsSize,
      hasJsFile,
      hasCssFile,
      hasJsMapFile,
      hasCssMapFile,
    });
  }
}, 120_000);

describe.each(buildConfigs)("$name build (parametrized)", (cfg) => {
  const name = cfg.name;
  let res!: BuildResult;

  beforeAll(() => {
    const maybe = results.get(name);
    if (!maybe) throw new Error(`No build results for ${name}`);
    res = maybe;
  });

  it("should produce JS output file", () => {
    expect(res.hasJsFile).toBe(true);
  });

  it("should produce CSS output file", () => {
    expect(res.hasCssFile).toBe(true);
  });

  it(`${cfg.expectJsSourcemap ? "should" : "should NOT"} produce JS sourcemap file`, () => {
    expect(res.hasJsMapFile).toBe(cfg.expectJsSourcemap);
  });

  it(`${cfg.expectCssSourcemap ? "should" : "should NOT"} produce CSS sourcemap file`, () => {
    expect(res.hasCssMapFile).toBe(cfg.expectCssSourcemap);
  });

  it(`${cfg.expectJsSourcemap ? "should" : "should NOT"} contain sourceMappingURL reference in JS`, () => {
    if (cfg.expectJsSourcemap) {
      // biome-ignore lint/security/noSecrets: false positive
      expect(res.jsContent).toContain("//# sourceMappingURL=");
    } else {
      // biome-ignore lint/security/noSecrets: false positive
      expect(res.jsContent).not.toContain("//# sourceMappingURL=");
    }
  });

  it("should be valid ESM (contains export statements)", () => {
    expect(res.jsContent).toMatch(/export\s*\{/);
  });

  it("should export the 8 lifecycle hooks", () => {
    // arrange
    const expectedExports = [
      "beforeWebStart",
      "afterWebStarted",
      "beforeWebAssemblyStart",
      "afterWebAssemblyStarted",
      "beforeServerStart",
      "afterServerStarted",
      "beforeStart",
      "afterStarted",
    ];

    // assert
    for (const n of expectedExports) {
      expect(res.jsContent, `expected export: ${n}`).toContain(n);
    }
  });

  it("should contain .ql-toolbar in CSS (Quill toolbar)", () => {
    expect(res.cssContent).toContain(".ql-toolbar");
  });

  it("should contain .ql-editor in CSS (Quill editor)", () => {
    expect(res.cssContent).toContain(".ql-editor");
  });

  it("should contain .ql-snow in CSS (Quill snow theme)", () => {
    expect(res.cssContent).toContain(".ql-snow");
  });

  it("should contain .ql-bubble in CSS (Quill bubble theme)", () => {
    expect(res.cssContent).toContain(".ql-bubble");
  });

  it("should contain .rich-text-editor-container in CSS (custom styles)", () => {
    expect(res.cssContent).toContain(".rich-text-editor-container");
  });

  it("should contain .rich-text-editor-toolbar-container-hidden in CSS (toolbar hidden state)", () => {
    expect(res.cssContent).toContain(".rich-text-editor-toolbar-container-hidden");
  });

  it("should contain .rich-text-editor-container-disabled in CSS (disabled state)", () => {
    expect(res.cssContent).toContain(".rich-text-editor-container-disabled");
  });

  it.skipIf(!cfg.expectMinifiedSmaller)("prod should produce minified JS smaller than dev JS", () => {
    // arrange
    const dev = results.get("dev");
    const prod = results.get("prod");

    // assert
    expect(prod && dev && prod.jsSize < dev.jsSize).toBe(true);
  });
});
