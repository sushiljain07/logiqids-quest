import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MixedPractice from "./MixedPractice.jsx";

describe("MixedPractice (static render)", () => {
  it("starts on the category picker, offering Mixed and all 5 categories", () => {
    const html = renderToStaticMarkup(<MixedPractice soundOn={false} avatar="🦁" onExit={() => {}} />);
    expect(html).toContain("Mixed");
    expect(html).toContain("Analytical Thinking");
    expect(html).toContain("Visual");
  });
});
