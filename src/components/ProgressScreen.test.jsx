import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProgressScreen from "./ProgressScreen.jsx";

describe("ProgressScreen (static render)", () => {
  it("shows a mastered count per category and lists every topic", () => {
    const progress = { seriesCompletion: { attempts: 4, correct: 4 } };
    const html = renderToStaticMarkup(<ProgressScreen progress={progress} avatar="🦁" onBack={() => {}} />);
    expect(html).toContain("Analytical Thinking");
    expect(html).toContain("Series Completion");
    expect(html).toMatch(/1\s*\/\s*3/); // 1 of 3 analytical topics mastered
  });
});
