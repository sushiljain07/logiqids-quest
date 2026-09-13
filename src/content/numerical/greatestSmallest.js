import { shuffle, randomInt, pick } from "../../lib/utils.js";

function randomDistinctDigits(count) {
  const digits = new Set();
  while (digits.size < count) digits.add(String(randomInt(1, 9)));
  return [...digits];
}

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) result.push([arr[i], ...p]);
  }
  return result;
}

export function generateGreatestSmallestQuestion(difficulty = "medium", index = 0) {
  const count = difficulty === "hard" ? 4 : 3;
  const digits = randomDistinctDigits(count);
  const askGreatest = Math.random() < 0.5;
  const correct = [...digits].sort((a, b) => (askGreatest ? b - a : a - b)).join("");
  const opposite = [...digits].sort((a, b) => (askGreatest ? a - b : b - a)).join("");

  const swapped = correct.split("");
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  const nearMiss = swapped.join("");

  // Generate all permutations and pick one that's not already used
  const allPerms = permutations(digits).map(p => p.join(""));
  const excluded = new Set([correct, opposite, nearMiss]);
  const validRandomOptions = allPerms.filter(p => !excluded.has(p));
  const randomShuffleStr = pick(validRandomOptions);

  const howTo = `To make the ${askGreatest ? "greatest" : "smallest"} number, arrange the digits from ${askGreatest ? "biggest to smallest" : "smallest to biggest"}: ${digits.join(", ")} → ${correct}.`;
  const candidates = shuffle([
    { label: correct, isAnswer: true },
    { label: opposite, reason: `arranges the digits ${askGreatest ? "smallest to biggest" : "biggest to smallest"} instead — the opposite order` },
    { label: nearMiss, reason: "swaps two digits out of order" },
    { label: randomShuffleStr, reason: "isn't arranged in order at all" },
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} ${c.reason}. ${howTo}`;
  });

  return {
    id: `greatest-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "numerical",
    topicId: "greatestSmallest",
    difficulty,
    prompt: `What is the ${askGreatest ? "greatest" : "smallest"} number you can make using all these digits? ${digits.join(" ")}`,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const greatestSmallestTopic = {
  id: "greatestSmallest",
  categoryId: "numerical",
  title: "Greatest / Smallest Number",
  teach: {
    steps: [
      { caption: "You can rearrange a set of digits to make different numbers." },
      { caption: "For the GREATEST number, put the biggest digit first, then next biggest, and so on." },
      { caption: "For the SMALLEST number, do the opposite — smallest digit first." },
      { caption: "Digits 8, 3, 6 → greatest is 863, smallest is 368." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateGreatestSmallestQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateGreatestSmallestQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
