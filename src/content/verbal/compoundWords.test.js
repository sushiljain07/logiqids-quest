import { describe, it, expect } from "vitest";
import { generateCompoundWordQuestion, compoundWordsTopic } from "./compoundWords.js";

describe("generateCompoundWordQuestion", () => {
  it("produces 4 distinct head+tail pairs where only one is a real curated word", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateCompoundWordQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
    }
  });

  it("does not always make the correct option's head word the odd one out (join-pair variant only)", () => {
    const SAMPLES = 600;
    let joinPairSamples = 0;
    let headCollisions = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const q = generateCompoundWordQuestion("medium", i);
      if (!q.prompt.startsWith("Which pair of words")) continue; // skip the stem-prefix variant
      joinPairSamples++;
      const headOf = o => o.label.split(" + ")[0];
      const correctHead = headOf(q.options.find(o => o.id === q.answerId));
      const wrongHeads = q.options.filter(o => o.id !== q.answerId).map(headOf);
      if (wrongHeads.includes(correctHead)) headCollisions++;
    }
    // eslint-disable-next-line no-console
    console.log("compound answer-head shared with >=1 distractor: %d / %d join-pair samples (%s%)",
      headCollisions, joinPairSamples, ((headCollisions / joinPairSamples) * 100).toFixed(1));
    // The old bug gave every wrong option one shared head that was never the answer's head,
    // so this was 0/N. Random full-range sampling makes collisions common.
    expect(joinPairSamples).toBeGreaterThan(100);
    expect(headCollisions).toBeGreaterThanOrEqual(joinPairSamples * 0.1);
  });
});

describe("compoundWordsTopic", () => {
  it("has the right shape", () => {
    expect(compoundWordsTopic.categoryId).toBe("verbal");
    expect(compoundWordsTopic.getTryTogether().length).toBe(2);
    expect(compoundWordsTopic.getYourTurn().length).toBe(4);
  });
});
