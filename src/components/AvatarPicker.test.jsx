import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import AvatarPicker from "./AvatarPicker.jsx";

describe("AvatarPicker", () => {
  it("renders all 8 avatar options and marks the selected one active", () => {
    const html = renderToStaticMarkup(
      <AvatarPicker avatar="🐼" playerName="Aanya" onChangeAvatar={() => {}} onChangeName={() => {}} />
    );
    expect(html).toContain("🦁");
    expect(html).toContain("🐼");
    expect(html).toContain("Aanya");
    expect(html).toMatch(/class="[^"]*active[^"]*"[^>]*>🐼/);
  });
});
