import { describe, it, expect } from "vitest";
import { generateCompoundWordQuestion, compoundWordsTopic } from "./compoundWords.js";

describe("generateCompoundWordQuestion", () => {
  it("produces 4 distinct head+tail pairs where only one is a real curated word", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateCompoundWordQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
    }
  });
});

describe("compoundWordsTopic", () => {
  it("has the right shape", () => {
    expect(compoundWordsTopic.categoryId).toBe("verbal");
    expect(compoundWordsTopic.getTryTogether().length).toBe(2);
    expect(compoundWordsTopic.getYourTurn().length).toBe(4);
  });
});
