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
});

describe("MockTest (static render)", () => {
  it("starts on the intro screen explaining the rules", () => {
    const html = renderToStaticMarkup(<MockTest avatar="🦁" playerName="Aanya" onExit={() => {}} />);
    expect(html).toMatch(/35 questions/i);
    expect(html).toMatch(/60/);
  });
});
