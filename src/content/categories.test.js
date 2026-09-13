import { describe, it, expect } from "vitest";
import { CATEGORIES } from "./categories.js";

describe("CATEGORIES", () => {
  it("has exactly the 5 official categories with required fields", () => {
    expect(CATEGORIES.length).toBe(5);
    const ids = CATEGORIES.map(c => c.id).sort();
    expect(ids).toEqual(["analytical", "memory", "numerical", "verbal", "visual"].sort());
    CATEGORIES.forEach(c => {
      expect(typeof c.name).toBe("string");
      expect(typeof c.icon).toBe("string");
      expect(typeof c.color).toBe("string");
    });
  });
});
