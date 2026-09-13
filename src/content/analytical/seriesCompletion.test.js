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
  it("produces a valid, self-consistent arithmetic-series question", () => {
    for (let i = 0; i < 30; i++) {
      const q = generateSeriesQuestion("medium", i);
      assertValidQuestion(q);
      const answerLabel = q.options.find(o => o.id === q.answerId).label;
      const nums = q.prompt.match(/-?\d+/g).map(Number);
      const step = nums[1] - nums[0];
      expect(Number(answerLabel)).toBe(nums[nums.length - 1] + step);
    }
  });

  it("does not always place the answer at the same sorted rank (not guessable by position)", () => {
    const rankCounts = [0, 0, 0, 0];
    const SAMPLES = 300;
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateSeriesQuestion(["easy", "medium", "hard"][i % 3], i);
      const values = q.options.map(o => Number(o.label));
      values.forEach(v => expect(v).toBeGreaterThan(0));
      const answerValue = Number(q.options.find(o => o.id === q.answerId).label);
      const rank = [...values].sort((a, b) => a - b).indexOf(answerValue);
      rankCounts[rank] += 1;
    }
    // eslint-disable-next-line no-console
    console.log("series answer sorted-rank distribution (n=%d): %o", SAMPLES, rankCounts);
    const ranksObserved = rankCounts.filter(c => c > 0).length;
    expect(ranksObserved).toBeGreaterThanOrEqual(2);
    // The old bug put the answer at rank 2 every single time.
    expect(rankCounts[2]).toBeLessThan(SAMPLES);
  });

  it("harder difficulty uses a bigger step on average", () => {
    const steps = (difficulty) => {
      let total = 0;
      for (let i = 0; i < 20; i++) {
        const q = generateSeriesQuestion(difficulty, i);
        const nums = q.prompt.match(/-?\d+/g).map(Number);
        total += nums[1] - nums[0];
      }
      return total / 20;
    };
    expect(steps("hard")).toBeGreaterThan(steps("easy"));
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
