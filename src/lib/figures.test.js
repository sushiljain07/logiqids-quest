import { describe, it, expect } from "vitest";
import { countGridRectangles, countFanTriangles, buildGridFigure, buildFanFigure, buildDiffPair } from "./figures.js";

describe("countGridRectangles", () => {
  it("matches the known combinatorial formula C(rows+1,2)*C(cols+1,2)", () => {
    expect(countGridRectangles(1, 1)).toBe(1);
    expect(countGridRectangles(2, 2)).toBe(9);
    expect(countGridRectangles(1, 2)).toBe(3);
    expect(countGridRectangles(1, 3)).toBe(6);
  });
});

describe("countFanTriangles", () => {
  it("matches n*(n+1)/2 for a fan of n base segments", () => {
    expect(countFanTriangles(2)).toBe(3);
    expect(countFanTriangles(3)).toBe(6);
  });
});

describe("buildGridFigure", () => {
  it("draws (rows+1) horizontal and (cols+1) vertical lines", () => {
    const fig = buildGridFigure(2, 2, { width: 200, height: 200 });
    const lines = fig.shapes.filter(s => s.type === "line");
    const horizontals = lines.filter(l => l.y1 === l.y2);
    const verticals = lines.filter(l => l.x1 === l.x2);
    expect(horizontals.length).toBe(3);
    expect(verticals.length).toBe(3);
  });
});

describe("buildFanFigure", () => {
  it("draws 2 outer sides + (n-1) internal cevians + 1 base line = n+2 lines total", () => {
    const fig = buildFanFigure(3, { width: 200, height: 200 });
    const lines = fig.shapes.filter(s => s.type === "line");
    expect(lines.length).toBe(5); // 2 outer sides + 2 internal cevians + 1 base line, for n=3
  });
});

describe("buildDiffPair", () => {
  it("applies exactly the given changes and reports that count", () => {
    const base = [
      { type: "circle", cx: 10, cy: 10, r: 5, fill: "red" },
      { type: "rect", x: 20, y: 20, w: 10, h: 10, fill: "blue" },
    ];
    const { before, after } = buildDiffPair(base, [
      { index: 0, patch: { fill: "green" } },
      { index: 1, patch: { x: 30 } },
    ]);
    expect(before).toEqual(base);
    expect(after[0].fill).toBe("green");
    expect(after[1].x).toBe(30);
    expect(after[0].cx).toBe(10); // untouched fields preserved
  });
});
