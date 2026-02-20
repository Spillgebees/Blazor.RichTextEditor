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

import { bootstrap } from "./rich-text-editor";

describe("bootstrap", () => {
  beforeEach(() => {
    // Reset window.Spillgebees before each test
    delete (window as Record<string, unknown>).Spillgebees;
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
