import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TeachSteps from "./TeachSteps.jsx";

describe("TeachSteps (static render)", () => {
  it("shows the first step's caption and a Next button when more steps remain", () => {
    const steps = [{ caption: "Step one" }, { caption: "Step two" }];
    const html = renderToStaticMarkup(<TeachSteps steps={steps} onDone={() => {}} />);
    expect(html).toContain("Step one");
    expect(html).not.toContain("Step two");
    expect(html).toContain("Next");
  });
});
