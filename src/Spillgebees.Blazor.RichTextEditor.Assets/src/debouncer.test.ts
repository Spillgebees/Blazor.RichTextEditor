import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "./debouncer";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should call the function after the debounce interval", async () => {
    // arrange
    const fn = vi.fn(async (value: string) => value);
    const debounced = debounce(fn, 200);

    // act
    const promise = debounced("hello");
    vi.advanceTimersByTime(200);
    const result = await promise;

    // assert
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("hello");
    expect(result).toBe("hello");
  });

  it("should only call the function once when called multiple times within the interval", async () => {
    // arrange
    const fn = vi.fn(async (value: number) => value);
    const debounced = debounce(fn, 300);

    // act
    debounced(1);
    debounced(2);
    const promise = debounced(3);
    vi.advanceTimersByTime(300);
    await promise;

    // assert
    expect(fn).toHaveBeenCalledOnce();
  });

  it("should use the latest arguments when debounced", async () => {
    // arrange
    const fn = vi.fn(async (value: string) => value);
    const debounced = debounce(fn, 100);

    // act
    debounced("first");
    debounced("second");
    const promise = debounced("third");
    vi.advanceTimersByTime(100);
    const result = await promise;

    // assert
    expect(fn).toHaveBeenCalledWith("third");
    expect(result).toBe("third");
  });

  it("should resolve with the function's return value", async () => {
    // arrange
    const fn = vi.fn(async () => 42);
    const debounced = debounce(fn, 50);

    // act
    const promise = debounced();
    vi.advanceTimersByTime(50);
    const result = await promise;

    // assert
    expect(result).toBe(42);
  });

  it("should reject when the function throws", async () => {
    // arrange
    const error = new Error("test error");
    const fn = vi.fn(async () => {
      throw error;
    });
    const debounced = debounce(fn, 50);

    // act
    const promise = debounced();
    vi.advanceTimersByTime(50);

    // assert
    await expect(promise).rejects.toThrow("test error");
  });
});
