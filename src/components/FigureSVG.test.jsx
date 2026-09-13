import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FigureSVG from "./FigureSVG.jsx";

describe("FigureSVG", () => {
  it("renders each shape type to the matching SVG element", () => {
    const spec = {
      width: 100, height: 100,
      shapes: [
        { type: "rect", x: 1, y: 2, w: 3, h: 4 },
        { type: "line", x1: 0, y1: 0, x2: 10, y2: 10 },
        { type: "polygon", points: "0,0 10,0 5,10" },
        { type: "circle", cx: 5, cy: 5, r: 5 },
        { type: "text", x: 1, y: 1, text: "hi" },
      ],
    };
    const html = renderToStaticMarkup(<FigureSVG spec={spec} size={100} />);
    expect(html).toContain("<rect");
    expect(html).toContain("<line");
    expect(html).toContain("<polygon");
    expect(html).toContain("<circle");
    expect(html).toContain("hi");
  });

  it("renders nothing for a null spec", () => {
    expect(renderToStaticMarkup(<FigureSVG spec={null} />)).toBe("");
  });
});
