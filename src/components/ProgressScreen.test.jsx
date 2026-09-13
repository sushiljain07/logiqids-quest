import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProgressScreen from "./ProgressScreen.jsx";

describe("ProgressScreen (static render)", () => {
  it("shows a mastered count per category and lists every topic", () => {
    const progress = { seriesCompletion: { attempts: 4, correct: 4, everMastered: true } };
    const html = renderToStaticMarkup(<ProgressScreen progress={progress} avatar="🦁" onBack={() => {}} />);
    expect(html).toContain("Analytical Thinking");
    expect(html).toContain("Series Completion");
    expect(html).toMatch(/1\s*\/\s*3/); // 1 of 3 analytical topics mastered
  });

  it("keeps the mastered star once earned, even after the live ratio drops", () => {
    const progress = { seriesCompletion: { attempts: 8, correct: 5, everMastered: true } };
    const html = renderToStaticMarkup(<ProgressScreen progress={progress} avatar="🦁" onBack={() => {}} />);
    expect(html).toMatch(/1\s*\/\s*3/);
  });
});
