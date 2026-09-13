import { describe, it, expect } from "vitest";
import { generateAnalogyQuestion, analogiesTopic } from "./analogies.js";

describe("generateAnalogyQuestion", () => {
  it("produces a valid analogy question every time", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateAnalogyQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
      expect(q.prompt).toMatch(/is to/);
    }
  });
});

describe("analogiesTopic", () => {
  it("has the right shape", () => {
    expect(analogiesTopic.categoryId).toBe("analytical");
    expect(analogiesTopic.getTryTogether().length).toBe(2);
    expect(analogiesTopic.getYourTurn().length).toBe(4);
  });
});
