import { describe, it, expect } from "vitest";
import { generateWordProblemQuestion, wordProblemsTopic } from "./wordProblems.js";

describe("generateWordProblemQuestion", () => {
  it("always has 4 distinct positive-looking options with a valid answer", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateWordProblemQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
    }
  });
});

describe("wordProblemsTopic", () => {
  it("has the right shape", () => {
    expect(wordProblemsTopic.categoryId).toBe("numerical");
    expect(wordProblemsTopic.getTryTogether().length).toBe(2);
    expect(wordProblemsTopic.getYourTurn().length).toBe(4);
  });
});
