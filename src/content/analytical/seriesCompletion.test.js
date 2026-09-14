import { describe, it, expect } from "vitest";
import { generateSeriesQuestion, seriesCompletionTopic } from "./seriesCompletion.js";

function assertValidQuestion(q) {
  expect(q.options.length).toBe(4);
  expect(new Set(q.options.map(o => o.id))).toEqual(new Set(["A","B","C","D"]));
  expect(q.options.map(o => o.id)).toContain(q.answerId);
  expect(typeof q.explanation.howTo).toBe("string");
  expect(typeof q.explanation.correct).toBe("string");
  const values = q.options.map(o => o.label);
  expect(new Set(values).size).toBe(4); // no duplicate option text
}

describe("generateSeriesQuestion", () => {
  it("produces a valid, self-consistent question across all series variants", () => {
    for (let i = 0; i < 60; i++) {
      const q = generateSeriesQuestion(["easy", "medium", "hard"][i % 3], i);
      assertValidQuestion(q);
    }
  });

});

describe("seriesCompletionTopic", () => {
  it("exposes teach steps and correctly-sized generators", () => {
    expect(seriesCompletionTopic.id).toBe("seriesCompletion");
    expect(seriesCompletionTopic.categoryId).toBe("analytical");
    expect(seriesCompletionTopic.teach.steps.length).toBeGreaterThan(0);
    expect(seriesCompletionTopic.getTryTogether().length).toBe(2);
    expect(seriesCompletionTopic.getYourTurn().length).toBe(4);
  });
});
