import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockBootstrap } = vi.hoisted(() => ({
  mockBootstrap: vi.fn(),
}));

vi.mock("./rich-text-editor", () => ({
  bootstrap: mockBootstrap,
}));

vi.mock("./styles.css", () => ({}));

import {
  afterServerStarted,
  afterStarted,
  afterWebAssemblyStarted,
  afterWebStarted,
  beforeServerStart,
  beforeStart,
  beforeWebAssemblyStart,
  beforeWebStart,
} from "./index";

describe("Blazor lifecycle hooks", () => {
  beforeEach(() => {
    window.hasBeforeStartBeenCalledForSpillgebeesRichTextEditor = false;
    window.hasAfterStartedBeenCalledForSpillgebeesRichTextEditor = false;
    mockBootstrap.mockClear();
  });

  describe("beforeStart", () => {
    it("should call bootstrap and set the RichTextEditor before-start flag", () => {
      // arrange
      const options = {} as unknown;

      // act
      beforeStart(options);

      // assert
      expect(mockBootstrap).toHaveBeenCalledOnce();
      expect(window.hasBeforeStartBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });
  });

  describe("afterStarted", () => {
    it("should set the RichTextEditor after-started flag", () => {
      // arrange
      const options = {} as unknown;

      // act
      afterStarted(options);

      // assert
      expect(window.hasAfterStartedBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });
  });

  describe("beforeWebStart", () => {
    it("should call beforeStart and set the RichTextEditor before-start flag", () => {
      // arrange
      const options = {} as unknown;

      // act
      beforeWebStart(options);

      // assert
      expect(mockBootstrap).toHaveBeenCalledOnce();
      expect(window.hasBeforeStartBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });

    it("should be idempotent (not call beforeStart again)", () => {
      // arrange
      const options = {} as unknown;
      beforeWebStart(options);
      mockBootstrap.mockClear();

      // act
      beforeWebStart(options);

      // assert
      expect(mockBootstrap).not.toHaveBeenCalled();
      expect(window.hasBeforeStartBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });
  });

  describe("afterWebStarted", () => {
    it("should set the RichTextEditor after-started flag", () => {
      // arrange
      const options = {} as unknown;

      // act
      afterWebStarted(options);

      // assert
      expect(window.hasAfterStartedBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });

    it("should be idempotent", () => {
      // arrange
      const options = {} as unknown;
      afterWebStarted(options);

      // act
      afterWebStarted(options);

      // assert
      expect(window.hasAfterStartedBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });
  });

  describe("beforeWebAssemblyStart", () => {
    it("should call beforeStart and set the RichTextEditor before-start flag", () => {
      // arrange
      const options = {} as unknown;

      // act
      beforeWebAssemblyStart(options);

      // assert
      expect(mockBootstrap).toHaveBeenCalledOnce();
      expect(window.hasBeforeStartBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });

    it("should be idempotent (not call beforeStart again)", () => {
      // arrange
      const options = {} as unknown;
      beforeWebAssemblyStart(options);
      mockBootstrap.mockClear();

      // act
      beforeWebAssemblyStart(options);

      // assert
      expect(mockBootstrap).not.toHaveBeenCalled();
    });
  });

  describe("afterWebAssemblyStarted", () => {
    it("should set the RichTextEditor after-started flag", () => {
      // arrange
      const options = {} as unknown;

      // act
      afterWebAssemblyStarted(options);

      // assert
      expect(window.hasAfterStartedBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });

    it("should be idempotent", () => {
      // arrange
      const options = {} as unknown;
      afterWebAssemblyStarted(options);

      // act
      afterWebAssemblyStarted(options);

      // assert
      expect(window.hasAfterStartedBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });
  });

  describe("beforeServerStart", () => {
    it("should call beforeStart and set the RichTextEditor before-start flag", () => {
      // arrange
      const options = {} as unknown;

      // act
      beforeServerStart(options);

      // assert
      expect(mockBootstrap).toHaveBeenCalledOnce();
      expect(window.hasBeforeStartBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });

    it("should be idempotent (not call beforeStart again)", () => {
      // arrange
      const options = {} as unknown;
      beforeServerStart(options);
      mockBootstrap.mockClear();

      // act
      beforeServerStart(options);

      // assert
      expect(mockBootstrap).not.toHaveBeenCalled();
    });
  });

  describe("afterServerStarted", () => {
    it("should set the RichTextEditor after-started flag", () => {
      // arrange
      const options = {} as unknown;

      // act
      afterServerStarted(options);

      // assert
      expect(window.hasAfterStartedBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });

    it("should be idempotent", () => {
      // arrange
      const options = {} as unknown;
      afterServerStarted(options);

      // act
      afterServerStarted(options);

      // assert
      expect(window.hasAfterStartedBeenCalledForSpillgebeesRichTextEditor).toBe(true);
    });
  });
});
