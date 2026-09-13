import { describe, it, expect } from "vitest";
import { generateSpotPatternQuestion, spotThePatternTopic } from "./spotThePattern.js";

describe("generateSpotPatternQuestion", () => {
  it("the answer really is the next symbol in the repeating cycle shown", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateSpotPatternQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
    }
  });
});

describe("spotThePatternTopic", () => {
  it("has the right shape", () => {
    expect(spotThePatternTopic.categoryId).toBe("memory");
    expect(spotThePatternTopic.getTryTogether().length).toBe(2);
    expect(spotThePatternTopic.getYourTurn().length).toBe(4);
  });
});
