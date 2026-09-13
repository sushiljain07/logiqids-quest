import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionCard from "./QuestionCard.jsx";

const QUESTION = {
  id: "q1", categoryId: "analytical", topicId: "seriesCompletion", difficulty: "easy",
  prompt: "Find the next number: 2, 4, 6, ?",
  figure: null,
  options: [{ id: "A", label: "8" }, { id: "B", label: "10" }, { id: "C", label: "12" }, { id: "D", label: "14" }],
  answerId: "A",
  explanation: {
    correct: "Yes! Adding 2 each time gets you to 8.",
    howTo: "The pattern adds 2 each time.",
    mistakes: { B: "That adds one extra step." },
  },
};

describe("QuestionCard (static render)", () => {
  it("renders the prompt and all 4 lettered options before answering", () => {
    const html = renderToStaticMarkup(<QuestionCard question={QUESTION} onAnswered={() => {}} soundOn={false} />);
    expect(html).toContain("Find the next number");
    ["A", "B", "C", "D"].forEach(letter => expect(html).toContain(`>${letter}<`));
    expect(html).toContain("8");
    expect(html).toContain("10");
  });
});
