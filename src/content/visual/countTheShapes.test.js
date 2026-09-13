import { describe, it, expect } from "vitest";
import { generateCountShapesQuestion, countTheShapesTopic } from "./countTheShapes.js";

describe("generateCountShapesQuestion", () => {
  it("always carries a figure and a numeric answer matching one option", () => {
    for (let i = 0; i < 30; i++) {
      const q = generateCountShapesQuestion("medium", i);
      expect(q.figure).not.toBe(null);
      expect(q.figure.shapes.length).toBeGreaterThan(0);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
      q.options.forEach(o => expect(Number.isInteger(Number(o.label))).toBe(true));
    }
  });
});

describe("countTheShapesTopic", () => {
  it("has the right shape", () => {
    expect(countTheShapesTopic.categoryId).toBe("visual");
    expect(countTheShapesTopic.getTryTogether().length).toBe(2);
    expect(countTheShapesTopic.getYourTurn().length).toBe(4);
  });
});
