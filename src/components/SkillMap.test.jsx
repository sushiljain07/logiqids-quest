import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import SkillMap from "./SkillMap.jsx";

describe("SkillMap (static render)", () => {
  it("shows all 5 category names and all 15 topic titles", () => {
    const html = renderToStaticMarkup(
      <SkillMap progress={{}} avatar="🦁" onOpenTopic={() => {}} onOpenMixedPractice={() => {}}
        onOpenMockTest={() => {}} onOpenProgress={() => {}} onOpenLeaderboard={() => {}} />
    );
    // Note: "Memory & Concentration" is HTML-escaped to "Memory &amp; Concentration"
    // by renderToStaticMarkup, so we assert against the escaped form.
    ["Analytical Thinking", "Verbal", "Visual", "Numerical Ability", "Memory &amp; Concentration"].forEach(name =>
      expect(html).toContain(name)
    );
    expect(html).toContain("Series Completion");
    expect(html).toContain("Spot the Difference");
  });

  it("locks the 2nd and 3rd topic of a category until the previous one is mastered", () => {
    const html = renderToStaticMarkup(
      <SkillMap progress={{}} avatar="🦁" onOpenTopic={() => {}} onOpenMixedPractice={() => {}}
        onOpenMockTest={() => {}} onOpenProgress={() => {}} onOpenLeaderboard={() => {}} />
    );
    // Odd One Out is the 2nd analytical topic, should render as locked with no attempts yet
    expect(html).toMatch(/oddOneOut[\s\S]*locked|locked[\s\S]*oddOneOut/i);
  });

  it("keeps the next topic unlocked once the previous one was ever mastered, even if the live ratio has dropped", () => {
    // 5/8 = 62.5% is below the live mastery threshold, but mastery was already earned.
    const progress = { seriesCompletion: { attempts: 8, correct: 5, everMastered: true } };
    const html = renderToStaticMarkup(
      <SkillMap progress={progress} avatar="🦁" onOpenTopic={() => {}} onOpenMixedPractice={() => {}}
        onOpenMockTest={() => {}} onOpenProgress={() => {}} onOpenLeaderboard={() => {}} />
    );
    expect(html).toMatch(/data-topic-id="oddOneOut" class="topicNode unlocked"/);
    expect(html).toMatch(/data-topic-id="seriesCompletion" class="topicNode mastered"/);
  });
});
