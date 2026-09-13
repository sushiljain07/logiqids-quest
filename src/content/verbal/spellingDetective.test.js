import { describe, it, expect } from "vitest";
import { generateSpellingQuestion, spellingDetectiveTopic } from "./spellingDetective.js";

describe("generateSpellingQuestion", () => {
  it("exactly one option is the misspelled word", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateSpellingQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
    }
  });
});

describe("spellingDetectiveTopic", () => {
  it("has the right shape", () => {
    expect(spellingDetectiveTopic.categoryId).toBe("verbal");
    expect(spellingDetectiveTopic.getTryTogether().length).toBe(2);
    expect(spellingDetectiveTopic.getYourTurn().length).toBe(4);
  });
});
