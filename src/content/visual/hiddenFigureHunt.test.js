import { describe, it, expect } from "vitest";
import { generateHiddenFigureQuestion, hiddenFigureHuntTopic } from "./hiddenFigureHunt.js";

describe("generateHiddenFigureQuestion", () => {
  it("the 3 wrong options are always shape types present in the master figure, the answer never is", () => {
    for (let i = 0; i < 30; i++) {
      const q = generateHiddenFigureQuestion("medium", i);
      const masterTypes = new Set(q.figure.shapes.map(s => s.type));
      const answerOption = q.options.find(o => o.id === q.answerId);
      expect(masterTypes.has(answerOption.figure.shapes[0].type)).toBe(false);
      q.options.filter(o => o.id !== q.answerId).forEach(o => {
        expect(masterTypes.has(o.figure.shapes[0].type)).toBe(true);
      });
    }
  });
});

describe("hiddenFigureHuntTopic", () => {
  it("has the right shape", () => {
    expect(hiddenFigureHuntTopic.categoryId).toBe("visual");
    expect(hiddenFigureHuntTopic.getTryTogether().length).toBe(2);
    expect(hiddenFigureHuntTopic.getYourTurn().length).toBe(4);
  });
});
