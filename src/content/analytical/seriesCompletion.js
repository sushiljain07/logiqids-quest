import { shuffle, randomInt, pick } from "../../lib/utils.js";

function arithmeticInstance(difficulty) {
  const step = difficulty === "hard" ? randomInt(6, 9) : difficulty === "easy" ? randomInt(2, 3) : randomInt(3, 5);
  const start = randomInt(1, 10);
  const terms = [start, start + step, start + step * 2, start + step * 3];
  const answer = start + step * 4;
  // Distractors are drawn from a symmetric pool on BOTH sides of the answer so that the
  // answer's rank among the sorted options varies, rather than always landing 2nd-largest.
  const distractorPool = [
    answer - 3 * step, answer - 2 * step, answer - step,
    answer + step, answer + 2 * step, answer + 3 * step,
  ].filter(v => v > 0 && v !== answer);
  return {
    prompt: `Find the next number in the series: ${terms.join(", ")}, ?`,
    answer, distractorPool,
    howTo: `The pattern adds ${step} each time. Starting at ${terms[0]} and adding ${step} four times gets you to ${answer}.`,
  };
}

function geometricInstance() {
  const ratio = Math.random() < 0.5 ? 2 : 0.5;
  const start = ratio === 2 ? randomInt(2, 9) : pick([64, 128, 256, 512, 729, 1024]);
  const terms = [0, 1, 2, 3, 4].map(i => Math.round(start * ratio ** i));
  const blankIndex = 3;
  const answer = terms[blankIndex];
  const shown = terms.map((t, i) => (i === blankIndex ? "?" : t));
  const distractorPool = [answer * 2, Math.round(answer / 2), terms[blankIndex - 1], terms[blankIndex + 1], answer + terms[0]]
    .filter(v => Number.isInteger(v) && v > 0 && v !== answer);
  return {
    prompt: `Complete the sequence: ${shown.join(", ")}`,
    answer, distractorPool,
    howTo: `Each term is ${ratio === 2 ? "double" : "half"} the one before it: ${terms.join(" → ")}.`,
  };
}

function alternatingInstance(difficulty) {
  const a = difficulty === "hard" ? randomInt(5, 9) : randomInt(2, 5);
  const b = difficulty === "hard" ? randomInt(2, 4) : randomInt(1, 3);
  const start = randomInt(5, 15);
  const terms = [start];
  for (const op of ["+", "-", "+", "-"]) terms.push(op === "+" ? terms[terms.length - 1] + a : terms[terms.length - 1] - b);
  const answer = terms[4];
  const shown = terms.slice(0, 4);
  const distractorPool = [answer + a, answer - a, answer + b, answer - b, terms[3] + a].filter(v => v !== answer);
  return {
    prompt: `Find the next number in the series: ${shown.join(", ")}, ?`,
    answer, distractorPool,
    howTo: `The pattern alternates: add ${a}, then subtract ${b}, over and over. ${shown.join(" → ")} → ${answer}.`,
  };
}

function alphanumericInstance(difficulty) {
  const digitStep = difficulty === "hard" ? randomInt(2, 3) : 2;
  const startDigit = randomInt(1, 3);
  const startCode = randomInt(20, 25); // a letter comfortably far from 'a' so subtracting 4 stays valid
  const terms = [0, 1, 2, 3].map(i => `${startDigit + digitStep * i}${String.fromCharCode(97 + startCode - i)}`);
  const answerDigit = startDigit + digitStep * 4;
  const answerLetter = String.fromCharCode(97 + startCode - 4);
  const answer = `${answerDigit}${answerLetter}`;
  const distractorPool = [
    `${answerDigit}${String.fromCharCode(97 + startCode - 3)}`,
    `${answerDigit - digitStep}${answerLetter}`,
    `${answerDigit + digitStep}${String.fromCharCode(97 + startCode - 5)}`,
  ];
  return {
    prompt: `Find the next term in the series: ${terms.join(", ")}, ?`,
    answer, distractorPool,
    howTo: `Two things change together: the number goes up by ${digitStep} each time, and the letter goes back by 1 each time. ${terms.join(" → ")} → ${answer}.`,
  };
}

export function generateSeriesQuestion(difficulty = "medium", index = 0) {
  const builders = [arithmeticInstance, geometricInstance, alternatingInstance, alphanumericInstance];
  const built = pick(builders)(difficulty);
  const { prompt, answer, distractorPool, howTo } = built;
  const distractorValues = shuffle([...new Set(distractorPool.map(String))].filter(v => v !== String(answer))).slice(0, 3);
  while (distractorValues.length < 3) distractorValues.push(`${answer}${distractorValues.length}x`);

  const candidates = shuffle([
    { value: String(answer), isAnswer: true },
    ...distractorValues.map(value => ({ value, isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.value }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `You picked ${c.value}, but ${howTo} So the answer is ${answer}, not ${c.value}.`;
  });

  return {
    id: `series-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "analytical",
    topicId: "seriesCompletion",
    difficulty,
    prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
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
      { caption: "Some series multiply or divide instead of adding — 720, 360, 180 keeps halving." },
      { caption: "Others alternate two rules, or change a letter alongside the number." },
      { caption: "Figure out the rule, then apply it one more time to find the missing term." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateSeriesQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateSeriesQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
