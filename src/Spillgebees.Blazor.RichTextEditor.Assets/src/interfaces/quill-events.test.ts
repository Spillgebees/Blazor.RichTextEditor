import { describe, it, expect, vi } from "vitest";

vi.mock("quill", () => {
  return {
    default: class MockQuill {
      static events = {
        TEXT_CHANGE: "text-change",
        SELECTION_CHANGE: "selection-change",
      };
    },
    Range: class MockRange {},
  };
});

import { TextChangedEvent, SelectionChangedEvent } from "./quill-events";
import type { Range, EmitterSource } from "quill";

describe("TextChangedEvent", () => {
  it("should store source correctly", () => {
    // arrange
    const source = "user" as EmitterSource;

    // act
    const event = new TextChangedEvent(source);

    // assert
    expect(event.source).toBe("user");
  });

  it("should store api source correctly", () => {
    // arrange
    const source = "api" as EmitterSource;

    // act
    const event = new TextChangedEvent(source);

    // assert
    expect(event.source).toBe("api");
  });
});

describe("SelectionChangedEvent", () => {
  it("should store oldRange, newRange, and source correctly", () => {
    // arrange
    const oldRange = { index: 0, length: 5 } as Range;
    const newRange = { index: 10, length: 3 } as Range;
    const source = "user" as EmitterSource;

    // act
    const event = new SelectionChangedEvent(oldRange, newRange, source);

    // assert
    expect(event.oldRange).toEqual({ index: 0, length: 5 });
    expect(event.newRange).toEqual({ index: 10, length: 3 });
    expect(event.source).toBe("user");
  });

  it("should handle silent source", () => {
    // arrange
    const oldRange = { index: 0, length: 0 } as Range;
    const newRange = { index: 5, length: 0 } as Range;
    const source = "silent" as EmitterSource;

    // act
    const event = new SelectionChangedEvent(oldRange, newRange, source);

    // assert
    expect(event.oldRange).toEqual({ index: 0, length: 0 });
    expect(event.newRange).toEqual({ index: 5, length: 0 });
    expect(event.source).toBe("silent");
  });
});
