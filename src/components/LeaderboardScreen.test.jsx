import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LeaderboardScreen from "./LeaderboardScreen.jsx";

describe("LeaderboardScreen (static render)", () => {
  it("lists entries with name and percentage, or an empty state with none", () => {
    const withEntries = renderToStaticMarkup(
      <LeaderboardScreen entries={[{ name: "Aanya", avatar: "🦁", pct: 90, raw: 100, difficulty: "mock" }]} avatar="🦁" onBack={() => {}} />
    );
    expect(withEntries).toContain("Aanya");
    expect(withEntries).toContain("90%");

    const empty = renderToStaticMarkup(<LeaderboardScreen entries={[]} avatar="🦁" onBack={() => {}} />);
    expect(empty).toMatch(/mock test/i);
  });
});
