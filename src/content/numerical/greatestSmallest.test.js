import { describe, it, expect } from "vitest";
import { generateGreatestSmallestQuestion, greatestSmallestTopic } from "./greatestSmallest.js";

describe("generateGreatestSmallestQuestion", () => {
  it("the answer really is the greatest/smallest arrangement of the given digits", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateGreatestSmallestQuestion("medium", i);
      const digits = q.prompt.match(/\d/g);
      const sortedDesc = [...digits].sort((a,b) => b - a).join("");
      const sortedAsc = [...digits].sort((a,b) => a - b).join("");
      const answerLabel = q.options.find(o => o.id === q.answerId).label;
      const expected = q.prompt.includes("greatest") ? sortedDesc : sortedAsc;
      expect(answerLabel).toBe(expected);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
    }
  });
});

describe("greatestSmallestTopic", () => {
  it("has the right shape", () => {
    expect(greatestSmallestTopic.categoryId).toBe("numerical");
    expect(greatestSmallestTopic.getTryTogether().length).toBe(2);
    expect(greatestSmallestTopic.getYourTurn().length).toBe(4);
  });
});
