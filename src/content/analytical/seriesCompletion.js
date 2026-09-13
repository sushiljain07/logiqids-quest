import { shuffle, randomInt } from "../../lib/utils.js";

function stepFor(difficulty) {
  if (difficulty === "hard") return randomInt(6, 9);
  if (difficulty === "easy") return randomInt(2, 3);
  return randomInt(3, 5);
}

export function generateSeriesQuestion(difficulty = "medium", index = 0) {
  const step = stepFor(difficulty);
  const start = randomInt(1, 10);
  const terms = [start, start + step, start + step * 2, start + step * 3];
  const answer = start + step * 4;

  const candidates = shuffle([
    { value: answer, isAnswer: true },
    { value: answer + step, reason: "adds one extra step instead of stopping at the pattern" },
    { value: answer - step, reason: "stops one step too early — that's the term before the answer" },
    { value: terms[0], reason: "repeats the very first number instead of continuing the pattern" },
  ]);

  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: String(c.value) }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const howTo = `The pattern adds ${step} each time. Starting at ${terms[0]} and adding ${step} four times gets you to ${answer}.`;

  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) {
      mistakes[letters[i]] = `You picked ${c.value}, which ${c.reason}. ${howTo}`;
    }
  });

  return {
    id: `series-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "analytical",
    topicId: "seriesCompletion",
    difficulty,
    prompt: `Find the next number in the series: ${terms.join(", ")}, ?`,
    figure: null,
    options,
    answerId,
    explanation: {
      correct: `Yes! ${howTo}`,
      howTo,
      mistakes,
    },
  };
}

export const seriesCompletionTopic = {
  id: "seriesCompletion",
  categoryId: "analytical",
  title: "Series Completion",
  teach: {
    steps: [
      { caption: "A number series is a list of numbers that follows a hidden rule." },
      { caption: "Look at 2, 4, 6, 8 — each number is 2 more than the one before it." },
      { caption: "To find the next number, figure out the rule, then apply it one more time." },
      { caption: "So after 2, 4, 6, 8 comes 10 — because we keep adding 2!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateSeriesQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateSeriesQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
