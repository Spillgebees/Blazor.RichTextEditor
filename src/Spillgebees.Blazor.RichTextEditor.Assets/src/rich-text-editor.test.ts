import type { DotNet } from "@microsoft/dotnet-js-interop";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("quill", () => {
  const MockQuill = vi.fn() as unknown as {
    new (): Record<string, unknown>;
    events: Record<string, string>;
    register: ReturnType<typeof vi.fn>;
    import: ReturnType<typeof vi.fn>;
  };
  MockQuill.events = {
    TEXT_CHANGE: "text-change",
    SELECTION_CHANGE: "selection-change",
  };
  MockQuill.register = vi.fn();
  MockQuill.import = vi.fn();
  return { default: MockQuill, Range: class {} };
});

vi.mock("parchment", () => ({
  StyleAttributor: class {},
}));

vi.mock("@enzedonline/quill-blot-formatter2", () => ({
  default: class MockBlotFormatter {},
}));

vi.mock("quill-delta", () => ({
  default: class MockDelta {},
}));

vi.mock("@microsoft/dotnet-js-interop", () => ({
  DotNet: {},
}));

import Quill from "quill";
import { bootstrap } from "./rich-text-editor";

describe("bootstrap", () => {
  beforeEach(() => {
    // Reset window.Spillgebees before each test
    window.Spillgebees = undefined as unknown as typeof window.Spillgebees;
  });

  it("should initialize window.Spillgebees with all expected properties", () => {
    // arrange & act
    bootstrap();

    // assert
    expect(window.Spillgebees).toBeDefined();
    expect(window.Spillgebees.fonts).toBeDefined();
    expect(window.Spillgebees.editorFunctions).toBeDefined();
    expect(window.Spillgebees.eventMap).toBeDefined();
    expect(window.Spillgebees.editors).toBeDefined();
  });

  it("should set up editorFunctions with all expected methods", () => {
    // arrange & act
    bootstrap();

    // assert
    const fns = window.Spillgebees.editorFunctions;
    expect(fns.createEditor).toBeTypeOf("function");
    expect(fns.setEditorEnabledState).toBeTypeOf("function");
    expect(fns.getContent).toBeTypeOf("function");
    expect(fns.setContent).toBeTypeOf("function");
    expect(fns.getSelection).toBeTypeOf("function");
    expect(fns.setSelection).toBeTypeOf("function");
    expect(fns.getText).toBeTypeOf("function");
    expect(fns.insertImage).toBeTypeOf("function");
    expect(fns.disposeEditor).toBeTypeOf("function");
    expect(fns.registerQuillEventCallback).toBeTypeOf("function");
  });

  it("should set up empty maps for editors and eventMap", () => {
    // arrange & act
    bootstrap();

    // assert
    expect(window.Spillgebees.editors).toBeInstanceOf(Map);
    expect(window.Spillgebees.editors.size).toBe(0);
    expect(window.Spillgebees.eventMap).toBeInstanceOf(Map);
    expect(window.Spillgebees.eventMap.size).toBe(0);
  });

  it("should initialize empty fonts set", () => {
    // arrange & act
    bootstrap();

    // assert
    expect(window.Spillgebees.fonts).toBeInstanceOf(Set);
    expect(window.Spillgebees.fonts.size).toBe(0);
  });

  it("should not overwrite existing Spillgebees if already set up", () => {
    // arrange
    bootstrap();
    const originalEditorFunctions = window.Spillgebees.editorFunctions;
    const originalEditors = window.Spillgebees.editors;
    const originalEventMap = window.Spillgebees.eventMap;
    const originalFonts = window.Spillgebees.fonts;

    // act
    bootstrap();

    // assert
    expect(window.Spillgebees.editorFunctions).toBe(originalEditorFunctions);
    expect(window.Spillgebees.editors).toBe(originalEditors);
    expect(window.Spillgebees.eventMap).toBe(originalEventMap);
    expect(window.Spillgebees.fonts).toBe(originalFonts);
  });
});

describe("createEditor", () => {
  const mockFontAttributor: { whitelist: string[] } = { whitelist: [] };

  function createMockDotNetHelper(): DotNet.DotNetObject {
    return {
      invokeMethodAsync: vi.fn().mockResolvedValue(undefined),
    } as unknown as DotNet.DotNetObject;
  }

  beforeEach(() => {
    window.Spillgebees = undefined as unknown as typeof window.Spillgebees;
    bootstrap();
    mockFontAttributor.whitelist = [];

    // Quill.import is vi.fn() from the mock factory — configure its return value
    const mockImport = Quill.import as unknown as { mockReturnValue: (val: unknown) => void };
    mockImport.mockReturnValue(mockFontAttributor);
  });

  it("should keep custom fonts", async () => {
    // arrange
    const dotNetHelper = createMockDotNetHelper();
    const container = document.createElement("div");

    // act
    await window.Spillgebees.editorFunctions.createEditor(
      dotNetHelper,
      "OnEditorInitialized",
      container,
      null,
      true,
      false,
      undefined,
      undefined,
      undefined,
      ["Arial", "Verdana"],
    );

    // assert
    expect(window.Spillgebees.fonts).toBeInstanceOf(Set);
    expect(window.Spillgebees.fonts.size).toBe(2);
    expect(window.Spillgebees.fonts.has("Arial")).toBe(true);
    expect(window.Spillgebees.fonts.has("Verdana")).toBe(true);
  });

  it("should deduplicate fonts across multiple createEditor calls", async () => {
    // arrange
    const dotNetHelper = createMockDotNetHelper();
    const container1 = document.createElement("div");
    const container2 = document.createElement("div");

    // act
    await window.Spillgebees.editorFunctions.createEditor(
      dotNetHelper,
      "OnEditorInitialized",
      container1,
      null,
      true,
      false,
      undefined,
      undefined,
      undefined,
      ["Arial", "Verdana"],
    );
    await window.Spillgebees.editorFunctions.createEditor(
      dotNetHelper,
      "OnEditorInitialized",
      container2,
      null,
      true,
      false,
      undefined,
      undefined,
      undefined,
      ["Arial", "Courier"],
    );

    // assert
    expect(window.Spillgebees.fonts).toBeInstanceOf(Set);
    expect(window.Spillgebees.fonts.size).toBe(3);
    expect(window.Spillgebees.fonts.has("Arial")).toBe(true);
    expect(window.Spillgebees.fonts.has("Verdana")).toBe(true);
    expect(window.Spillgebees.fonts.has("Courier")).toBe(true);
  });

  it("should set fontAttributor.whitelist to an Array derived from the Set", async () => {
    // arrange
    const dotNetHelper = createMockDotNetHelper();
    const container = document.createElement("div");

    // act
    await window.Spillgebees.editorFunctions.createEditor(
      dotNetHelper,
      "OnEditorInitialized",
      container,
      null,
      true,
      false,
      undefined,
      undefined,
      undefined,
      ["Arial", "Verdana"],
    );

    // assert
    expect(Array.isArray(mockFontAttributor.whitelist)).toBe(true);
    expect(mockFontAttributor.whitelist).toEqual(["Arial", "Verdana"]);
  });
});
