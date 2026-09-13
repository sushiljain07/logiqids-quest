import { describe, it, expect } from "vitest";
import { generateSpotDifferenceQuestion, spotTheDifferenceTopic } from "./spotTheDifference.js";

describe("generateSpotDifferenceQuestion", () => {
  it("carries two figures and the numeric answer equals the actual number of changed shapes", () => {
    for (let i = 0; i < 30; i++) {
      const q = generateSpotDifferenceQuestion("medium", i);
      expect(q.figure).not.toBe(null);
      expect(q.secondFigure).not.toBe(null);
      const answerLabel = Number(q.options.find(o => o.id === q.answerId).label);
      let diffCount = 0;
      q.figure.shapes.forEach((s, idx) => {
        const other = q.secondFigure.shapes[idx];
        if (JSON.stringify(s) !== JSON.stringify(other)) diffCount++;
      });
      expect(answerLabel).toBe(diffCount);
    }
  });
});

describe("spotTheDifferenceTopic", () => {
  it("has the right shape", () => {
    expect(spotTheDifferenceTopic.categoryId).toBe("visual");
    expect(spotTheDifferenceTopic.getTryTogether().length).toBe(2);
    expect(spotTheDifferenceTopic.getYourTurn().length).toBe(4);
  });
});
