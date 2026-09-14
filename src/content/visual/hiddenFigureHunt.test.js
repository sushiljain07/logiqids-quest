import { describe, it, expect } from "vitest";
import { generateHiddenFigureQuestion, hiddenFigureHuntTopic } from "./hiddenFigureHunt.js";

// Master-figure shapes are jittered a few px from the pool's reference shape, so identity is
// compared by shape family (type + size/relative-point-pattern), not by exact coordinates.
function shapeFingerprint(s) {
  if (s.type === "circle") return `circle:${s.r}`;
  if (s.type === "rect") return `rect:${s.w}:${s.h}`;
  if (s.type === "polygon") {
    const pts = s.points.split(" ").map(p => p.split(",").map(Number));
    const [x0, y0] = pts[0];
    return `polygon:${pts.map(([x, y]) => `${x - x0},${y - y0}`).join(" ")}`;
  }
  return JSON.stringify(s);
}

describe("generateHiddenFigureQuestion", () => {
  it("the answer option's shape is never part of the master figure, and the 3 wrong options always are", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateHiddenFigureQuestion("medium", i);
      const masterShapeKeys = new Set(q.figure.shapes.map(shapeFingerprint));
      const answerOption = q.options.find(o => o.id === q.answerId);
      const answerShapeKey = shapeFingerprint(answerOption.figure.shapes[0]);
      expect(masterShapeKeys.has(answerShapeKey)).toBe(false);
      q.options.filter(o => o.id !== q.answerId).forEach(o => {
        const key = shapeFingerprint(o.figure.shapes[0]);
        expect(masterShapeKeys.has(key)).toBe(true);
      });
    }
  });

  it("across many generations, the master figure's composition and the answer both vary (not fixed)", () => {
    const masterCompositions = new Set();
    const answerShapes = new Set();
    for (let i = 0; i < 60; i++) {
      const q = generateHiddenFigureQuestion("medium", i);
      masterCompositions.add(JSON.stringify(q.figure.shapes.map(s => s.type + s.points)));
      const answerOption = q.options.find(o => o.id === q.answerId);
      answerShapes.add(JSON.stringify(answerOption.figure.shapes[0]));
    }
    expect(masterCompositions.size).toBeGreaterThan(1);
    expect(answerShapes.size).toBeGreaterThan(1);
  });
});

describe("hiddenFigureHuntTopic", () => {
  it("has the right shape", () => {
    expect(hiddenFigureHuntTopic.categoryId).toBe("visual");
    expect(hiddenFigureHuntTopic.getTryTogether().length).toBe(2);
    expect(hiddenFigureHuntTopic.getYourTurn().length).toBe(4);
  });
});
