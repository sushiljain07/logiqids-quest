import { describe, it, expect } from "vitest";
import { generateWhosFastestQuestion, whosFastestTopic } from "./whosFastest.js";

describe("generateWhosFastestQuestion", () => {
  it("the clue statements are logically consistent with the stated answer", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateWhosFastestQuestion("medium", i);
      const answerLabel = q.options.find(o => o.id === q.answerId).label;
      const namesInClues = [...q.prompt.matchAll(/([A-Z][a-z]+) runs faster than ([A-Z][a-z]+)/g)]
        .flatMap(m => [m[1], m[2]]);
      if (namesInClues.length === 0) {
        // elimination-variant prompt (boxes/colours) — no speed clues to check against
      } else if (q.prompt.includes("NOT mentioned")) {
        expect(namesInClues).not.toContain(answerLabel);
      } else {
        expect(namesInClues).toContain(answerLabel);
      }
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
    }
  });
});

describe("whosFastestTopic", () => {
  it("has the right shape", () => {
    expect(whosFastestTopic.categoryId).toBe("memory");
    expect(whosFastestTopic.getTryTogether().length).toBe(2);
    expect(whosFastestTopic.getYourTurn().length).toBe(4);
  });
});
