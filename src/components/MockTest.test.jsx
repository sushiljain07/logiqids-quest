import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MockTest, { buildMockTestQuestions } from "./MockTest.jsx";

describe("buildMockTestQuestions", () => {
  it("assembles exactly 35 questions with exactly 7 marked as LQ Champ", () => {
    const qs = buildMockTestQuestions();
    expect(qs.length).toBe(35);
    expect(qs.filter(q => q.isLQChamp).length).toBe(7);
    qs.forEach(q => expect(q.options.length).toBe(4));
  });

  it("draws all 5 categories evenly from the pool", () => {
    // The pool holds 10 questions per topic in category order. A biased comparator shuffle
    // left the trailing categories short by about a third; a uniform shuffle averages 7/35 each.
    const RUNS = 40;
    const totals = {};
    for (let r = 0; r < RUNS; r++) {
      buildMockTestQuestions().forEach(q => { totals[q.categoryId] = (totals[q.categoryId] || 0) + 1; });
    }
    const means = Object.fromEntries(Object.entries(totals).map(([c, n]) => [c, n / RUNS]));
    // eslint-disable-next-line no-console
    console.log("mock test questions per category (mean of %d runs, ideal 7.0): %o", RUNS, means);
    expect(Object.keys(means).length).toBe(5);
    Object.values(means).forEach(mean => {
      expect(mean).toBeGreaterThan(5.5);
      expect(mean).toBeLessThan(8.5);
    });
  });
});

describe("MockTest (static render)", () => {
  it("starts on the intro screen explaining the rules", () => {
    const html = renderToStaticMarkup(<MockTest avatar="🦁" playerName="Aanya" onExit={() => {}} />);
    expect(html).toMatch(/35 questions/i);
    expect(html).toMatch(/60/);
  });
});
