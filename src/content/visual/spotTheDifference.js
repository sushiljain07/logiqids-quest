import { shuffle, randomInt, pick } from "../../lib/utils.js";
import { buildDiffPair } from "../../lib/figures.js";

const SCENES = [
  {
    base: [
      { type: "rect", x: 40, y: 90, w: 100, h: 70, fill: "#ffd6ad", stroke: "#25233a" },
      { type: "polygon", points: "40,90 90,40 140,90", fill: "#e46b30", stroke: "#25233a" },
      { type: "rect", x: 75, y: 120, w: 30, h: 40, fill: "#6b5bd6", stroke: "#25233a" },
      { type: "circle", cx: 160, cy: 40, r: 18, fill: "#f5b73c", stroke: "#25233a" },
      { type: "rect", x: 55, y: 105, w: 18, h: 18, fill: "#a7d9ff", stroke: "#25233a" },
    ],
    changePool: [
      { index: 0, patch: { fill: "#a7d9ff" } },
      { index: 1, patch: { fill: "#20a66a" } },
      { index: 2, patch: { x: 90 } },
      { index: 3, patch: { r: 26 } },
      { index: 4, patch: { fill: "#e45b5b" } },
    ],
  },
  {
    base: [
      { type: "rect", x: 40, y: 110, w: 140, h: 60, fill: "#d9a066", stroke: "#25233a" },
      { type: "circle", cx: 75, cy: 90, r: 20, fill: "#e45b5b", stroke: "#25233a" },
      { type: "circle", cx: 115, cy: 85, r: 20, fill: "#f5942e", stroke: "#25233a" },
      { type: "circle", cx: 150, cy: 95, r: 14, fill: "#8a5bd6", stroke: "#25233a" },
      { type: "polygon", points: "90,60 105,50 100,70", fill: "#3fae5c", stroke: "#25233a" },
    ],
    changePool: [
      { index: 0, patch: { fill: "#c98a4a" } },
      { index: 1, patch: { fill: "#20a66a" } },
      { index: 2, patch: { cx: 130 } },
      { index: 3, patch: { r: 20 } },
      { index: 4, patch: { fill: "#256b3a" } },
    ],
  },
  {
    base: [
      { type: "rect", x: 0, y: 150, w: 220, h: 50, fill: "#8fd67a", stroke: "#25233a" },
      { type: "circle", cx: 180, cy: 40, r: 24, fill: "#f5d76e", stroke: "#25233a" },
      { type: "rect", x: 90, y: 110, w: 8, h: 50, fill: "#3fae5c", stroke: "#25233a" },
      { type: "circle", cx: 94, cy: 100, r: 18, fill: "#e45bb3", stroke: "#25233a" },
      { type: "polygon", points: "30,150 60,120 90,150", fill: "#2e8b4a", stroke: "#25233a" },
    ],
    changePool: [
      { index: 0, patch: { fill: "#6fc95a" } },
      { index: 1, patch: { r: 30 } },
      { index: 2, patch: { x: 130 } },
      { index: 3, patch: { fill: "#f5b73c" } },
      { index: 4, patch: { fill: "#1f6b34" } },
    ],
  },
  {
    base: [
      { type: "circle", cx: 110, cy: 110, r: 90, fill: "#cdeaff", stroke: "#25233a" },
      { type: "polygon", points: "70,110 110,90 110,130", fill: "#f5942e", stroke: "#25233a" },
      { type: "circle", cx: 100, cy: 105, r: 5, fill: "#25233a", stroke: "#25233a" },
      { type: "circle", cx: 150, cy: 60, r: 8, fill: "#ffffffaa", stroke: "#25233a" },
      { type: "polygon", points: "60,190 70,150 80,190", fill: "#3fae5c", stroke: "#25233a" },
    ],
    changePool: [
      { index: 0, patch: { fill: "#a7d9ff" } },
      { index: 1, patch: { fill: "#e45b5b" } },
      { index: 2, patch: { cx: 105 } },
      { index: 3, patch: { r: 14 } },
      { index: 4, patch: { fill: "#256b3a" } },
    ],
  },
];

export function generateSpotDifferenceQuestion(difficulty = "medium", index = 0) {
  const kRanges = { easy: [2, 3], medium: [3, 4], hard: [4, 5] };
  const [kMin, kMax] = kRanges[difficulty] || kRanges.medium;
  const k = randomInt(kMin, kMax);
  const scene = pick(SCENES);
  const changes = shuffle(scene.changePool).slice(0, k);
  const { before, after } = buildDiffPair(scene.base, changes);
  const answer = changes.length;
  const howTo = `Compare each shape one at a time: its color, size, and position. There ${answer === 1 ? "is 1 difference" : `are ${answer} differences`} between the two pictures.`;

  const nearby = [...new Set([answer - 3, answer - 2, answer - 1, answer + 1, answer + 2, answer + 3].filter(v => v >= 0))];
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
