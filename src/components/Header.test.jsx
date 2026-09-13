import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Header from "./Header.jsx";

describe("Header", () => {
  it("shows the title and the avatar chip when given one", () => {
    const html = renderToStaticMarkup(<Header onBack={() => {}} avatar="🦁" title="LogiQids Quest" />);
    expect(html).toContain("LogiQids Quest");
    expect(html).toContain("🦁");
  });
});
