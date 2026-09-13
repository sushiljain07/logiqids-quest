import { shuffle } from "../../lib/utils.js";
import { buildDiffPair } from "../../lib/figures.js";

const BASE_SCENE = [
  { type: "rect", x: 40, y: 90, w: 100, h: 70, fill: "#ffd6ad", stroke: "#25233a" },
  { type: "polygon", points: "40,90 90,40 140,90", fill: "#e46b30", stroke: "#25233a" },
  { type: "rect", x: 75, y: 120, w: 30, h: 40, fill: "#6b5bd6", stroke: "#25233a" },
  { type: "circle", cx: 160, cy: 40, r: 18, fill: "#f5b73c", stroke: "#25233a" },
  { type: "rect", x: 55, y: 105, w: 18, h: 18, fill: "#a7d9ff", stroke: "#25233a" },
];

const CHANGE_POOL = [
  { index: 0, patch: { fill: "#a7d9ff" } },
  { index: 1, patch: { fill: "#20a66a" } },
  { index: 2, patch: { x: 90 } },
  { index: 3, patch: { r: 26 } },
  { index: 4, patch: { fill: "#e45b5b" } },
];

export function generateSpotDifferenceQuestion(difficulty = "medium", index = 0) {
  const k = difficulty === "hard" ? 4 : difficulty === "medium" ? 3 : 2;
  const changes = shuffle(CHANGE_POOL).slice(0, k);
  const { before, after } = buildDiffPair(BASE_SCENE, changes);
  const answer = changes.length;
  const howTo = `Compare each shape one at a time: its color, size, and position. There ${answer === 1 ? "is 1 difference" : `are ${answer} differences`} between the two pictures.`;

  const nearby = [...new Set([answer - 1, answer + 1, answer + 2].filter(v => v > 0 && v !== answer))];
  const distractors = shuffle(nearby).slice(0, 3);
  while (distractors.length < 3) distractors.push(answer + distractors.length + 3);

  const candidates = shuffle([
    { label: String(answer), isAnswer: true },
    ...distractors.map(d => ({ label: String(d), isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `That count doesn't match — go shape by shape and compare color, size, and position carefully. ${howTo}`;
  });

  return {
    id: `diff-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "visual",
    topicId: "spotTheDifference",
    difficulty,
    prompt: "Count the total number of differences between image 1 and image 2.",
    figure: { width: 220, height: 220, shapes: before },
    secondFigure: { width: 220, height: 220, shapes: after },
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const spotTheDifferenceTopic = {
  id: "spotTheDifference",
  categoryId: "visual",
  title: "Spot the Difference",
  teach: {
    steps: [
      { caption: "Two pictures look almost the same — but a few small things have changed." },
      { caption: "Go shape by shape: check its color, its size, and where it sits." },
      { caption: "Keep a running count every time you spot something different." },
      { caption: "Your total count is the answer!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateSpotDifferenceQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateSpotDifferenceQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
