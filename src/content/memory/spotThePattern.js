import { shuffle, pick, randomInt } from "../../lib/utils.js";

const SYMBOL_SETS = [["🔴", "🔵"], ["⭐", "🌙", "☀️"], ["🍎", "🍌"], ["🟩", "🟦", "🟨"]];
const EXTRA_SYMBOLS = ["⬛", "🟣", "🔺", "💠"];

export function generateSpotPatternQuestion(difficulty = "medium", index = 0) {
  const set = pick(SYMBOL_SETS);
  const cycleLen = set.length;
  const repeats = difficulty === "hard" ? 3 : 2;
  const offset = randomInt(0, cycleLen - 1);
  const totalShown = cycleLen * repeats + offset;
  const seq = Array.from({ length: totalShown }, (_, i) => set[i % cycleLen]);
  const answer = set[totalShown % cycleLen];

  let distractors = set.filter(s => s !== answer);
  let extraIdx = 0;
  while (distractors.length < 3) {
    distractors.push(EXTRA_SYMBOLS[extraIdx % EXTRA_SYMBOLS.length]);
    extraIdx++;
  }
  distractors = distractors.slice(0, 3);

  const howTo = `The pattern repeats ${set.join(" ")} over and over. After ${seq.slice(-cycleLen).join(" ")}, the cycle starts again with ${answer}.`;
  const candidates = shuffle([
    { label: answer, isAnswer: true },
    ...distractors.map(d => ({ label: d, isAnswer: false, inSet: set.includes(d) })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (c.isAnswer) return;
    mistakes[letters[i]] = c.inSet
      ? `${c.label} is part of the pattern, but it isn't next in the cycle. ${howTo}`
      : `${c.label} doesn't even appear in the pattern. ${howTo}`;
  });

  return {
    id: `pattern-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "memory",
    topicId: "spotThePattern",
    difficulty,
    prompt: `What comes next in this pattern? ${seq.join(" ")} ?`,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const spotThePatternTopic = {
  id: "spotThePattern",
  categoryId: "memory",
  title: "Spot the Pattern",
  teach: {
    steps: [
      { caption: "A repeating pattern uses the same small group of symbols over and over." },
      { caption: "🔴🔵🔴🔵 — that's the pair 🔴🔵 repeating." },
      { caption: "Find the smallest repeating group, then keep counting around it to find what's next." },
      { caption: "After 🔴🔵🔴🔵 comes 🔴 again — the cycle restarts!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateSpotPatternQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateSpotPatternQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
