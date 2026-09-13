import { describe, it, expect } from "vitest";
import { generateOddOneOutQuestion, oddOneOutTopic } from "./oddOneOut.js";

describe("generateOddOneOutQuestion", () => {
  it("always produces 4 distinct options with a valid answer and howTo text", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateOddOneOutQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
      expect(typeof q.explanation.howTo).toBe("string");
    }
  });
});

describe("oddOneOutTopic", () => {
  it("has the right shape", () => {
    expect(oddOneOutTopic.categoryId).toBe("analytical");
    expect(oddOneOutTopic.getTryTogether().length).toBe(2);
    expect(oddOneOutTopic.getYourTurn().length).toBe(4);
  });
});
