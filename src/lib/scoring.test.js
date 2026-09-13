import { describe, it, expect } from "vitest";
import { isTopicMastered, scoreMockTest } from "./scoring.js";

describe("isTopicMastered", () => {
  it("requires at least 3 correct and 75% accuracy", () => {
    expect(isTopicMastered({ attempts: 4, correct: 3 })).toBe(true);
    expect(isTopicMastered({ attempts: 4, correct: 2 })).toBe(false);
    expect(isTopicMastered({ attempts: 2, correct: 2 })).toBe(false); // fewer than 3 correct
    expect(isTopicMastered(undefined)).toBe(false);
  });
});

describe("scoreMockTest", () => {
  it("applies +4/-1 for normal and +8/-2 for LQ Champ, 0 for unanswered", () => {
    const answers = [
      { isAnswered: true, isCorrect: true, isLQChamp: false },   // +4
      { isAnswered: true, isCorrect: false, isLQChamp: false },  // -1
      { isAnswered: true, isCorrect: true, isLQChamp: true },    // +8
      { isAnswered: true, isCorrect: false, isLQChamp: true },   // -2
      { isAnswered: false, isCorrect: false, isLQChamp: false }, // 0
    ];
    const result = scoreMockTest(answers);
    expect(result.raw).toBe(4 - 1 + 8 - 2 + 0);
    expect(result.maxRaw).toBe(4 + 4 + 8 + 8 + 4);
    expect(result.correctCount).toBe(2);
    expect(result.wrongCount).toBe(2);
    expect(result.unansweredCount).toBe(1);
    expect(result.pct).toBe(Math.round((9 / 28) * 100));
  });

  it("clamps pct at 0 when raw score is negative", () => {
    const answers = [{ isAnswered: true, isCorrect: false, isLQChamp: true }];
    const result = scoreMockTest(answers);
    expect(result.raw).toBe(-2);
    expect(result.pct).toBe(0);
  });
});
