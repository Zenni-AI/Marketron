import { describe, expect, it } from "vitest";
import { ClaudePlanner } from "./claudePlanner";

describe("ClaudePlanner", () => {
  it("throws a clear error when ANTHROPIC_API_KEY is not set", () => {
    const previous = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      expect(() => new ClaudePlanner()).toThrow(/ANTHROPIC_API_KEY/);
    } finally {
      if (previous) process.env.ANTHROPIC_API_KEY = previous;
    }
  });

  it("accepts an explicit apiKey option instead of the env var", () => {
    expect(() => new ClaudePlanner({ apiKey: "test-key" })).not.toThrow();
  });
});
