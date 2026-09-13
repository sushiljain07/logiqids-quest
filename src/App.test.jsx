import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

function makeMemoryStorage() {
  let store = {};
  return { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, clear: () => { store = {}; } };
}

describe("App (static render)", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", makeMemoryStorage());
    vi.resetModules();
  });

  it("shows onboarding (avatar picker) when no player name is stored", async () => {
    const { default: App } = await import("./App.jsx");
    const html = renderToStaticMarkup(<App />);
    expect(html).toMatch(/Who(?:&#x27;|')s playing\?/);
  });

  it("shows the skill map directly when a player name is already stored", async () => {
    localStorage.setItem("lq-player-name", JSON.stringify("Aanya"));
    const { default: App } = await import("./App.jsx");
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Analytical Thinking");
  });
});
