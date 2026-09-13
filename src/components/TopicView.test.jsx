import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TopicView from "./TopicView.jsx";

function makeQuestion(id, answerId = "A") {
  return {
    id, categoryId: "analytical", topicId: "t1", difficulty: "easy",
    prompt: `Prompt ${id}`, figure: null,
    options: [{ id: "A", label: "1" }, { id: "B", label: "2" }, { id: "C", label: "3" }, { id: "D", label: "4" }],
    answerId,
    explanation: { correct: "Yes!", howTo: "Here's how.", mistakes: { B: "no", C: "no", D: "no" } },
  };
}

const TOPIC = {
  id: "t1", categoryId: "analytical", title: "Test Topic",
  teach: { steps: [{ caption: "Learn this." }] },
  getTryTogether: () => [makeQuestion("tt1"), makeQuestion("tt2")],
  getYourTurn: () => [makeQuestion("yt1"), makeQuestion("yt2"), makeQuestion("yt3"), makeQuestion("yt4")],
};

describe("TopicView (static render)", () => {
  it("starts on the Teach phase, showing the topic's first caption", () => {
    const html = renderToStaticMarkup(<TopicView topic={TOPIC} soundOn={false} onExit={() => {}} />);
    expect(html).toContain("Learn this.");
    expect(html).toContain("Test Topic");
  });
});
