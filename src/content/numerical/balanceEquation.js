import { shuffle, randomInt, pick } from "../../lib/utils.js";

const OPS = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "×": (a, b) => a * b,
  "÷": (a, b) => a / b,
};

function buildOperands(op) {
  if (op === "+") { const a = randomInt(1, 9), b = randomInt(1, 9); return [a, b]; }
  if (op === "-") { const a = randomInt(5, 9), b = randomInt(1, a); return [a, b]; }
  if (op === "×") { const a = randomInt(2, 9), b = randomInt(2, 9); return [a, b]; }
  const b = randomInt(2, 5), q = randomInt(2, 9);
  return [b * q, b];
}

function signRemapVariant() {
  const opNames = Object.keys(OPS);
  const correctOp = pick(opNames);
  const [a, b] = buildOperands(correctOp);
  const result = OPS[correctOp](a, b);
  const howTo = `Try each sign: only ${a} ${correctOp} ${b} = ${result} is true, so ${correctOp} is the answer.`;
  const candidates = shuffle(opNames.map(op => ({
    label: op,
    isAnswer: op === correctOp,
    reason: op === correctOp ? null : `if you use ${op}, ${a} ${op} ${b} = ${OPS[op](a, b)}, not ${result}`,
  })));
  return { prompt: `Which sign replaces △ so that ${a} △ ${b} = ${result}?`, candidates, howTo };
}

function columnAdditionVariant() {
  const t1 = randomInt(1, 8);
  const b = randomInt(1, 9 - t1);
  const a = randomInt(0, 8);
  const o2 = randomInt(0, 9 - a);
  const resultTens = t1 + b;
  const resultOnes = a + o2;
  const askA = Math.random() < 0.5;
  const answer = askA ? a : b;
  const label = askA ? "A" : "B";
  const howTo = askA
    ? `Looking at the ones column: A + ${o2} = ${resultOnes}, so A = ${answer}.`
    : `Looking at the tens column: ${t1} + B = ${resultTens}, so B = ${answer}.`;
  const distractorPool = shuffle([...new Set([answer + 1, answer - 1, answer + 2, 9 - answer].filter(v => v >= 0 && v <= 9 && v !== answer))]).slice(0, 3);
  let filler = 0;
  while (distractorPool.length < 3) {
    const candidate = (answer + filler + 3) % 10;
    if (candidate !== answer && !distractorPool.includes(candidate)) distractorPool.push(candidate);
    filler++;
  }
  const candidates = shuffle([
    { label: String(answer), isAnswer: true, reason: null },
    ...distractorPool.map(v => ({ label: String(v), isAnswer: false, reason: `doesn't make the column sum work out` })),
  ]);
  return { prompt: `Find the value of ${label} in this sum: ${t1}A + B${o2} = ${resultTens}${resultOnes}`, candidates, howTo };
}

function digitExtractionVariant() {
  const useMul = Math.random() < 0.5;
  let exprStr, result;
  if (useMul) {
    const a = randomInt(2, 9) * 10;
    const b = randomInt(2, 9);
    result = a * b;
    exprStr = `${a} × ${b}`;
  } else {
    const a = randomInt(100, 450);
    const b = randomInt(100, 450);
    result = a + b;
    exprStr = `${a} + ${b}`;
  }
  const digits = String(result).split("");
  const letterNames = digits.map((_, i) => String.fromCharCode(65 + i));
  const askIndex = randomInt(0, digits.length - 1);
  const askLetter = letterNames[askIndex];
  const answer = digits[askIndex];
  const maskedResult = letterNames.join("");
  const howTo = `${exprStr} = ${result}. Writing the result as ${maskedResult}, ${askLetter} is the digit in position ${askIndex + 1} from the left, which is ${answer}.`;
  const distractorPool = [...new Set(digits.filter((_, i) => i !== askIndex))].filter(v => v !== answer);
  let digitFiller = 0;
  while (distractorPool.length < 3) {
    const candidate = String((Number(answer) + digitFiller + 1) % 10);
    if (candidate !== answer && !distractorPool.includes(candidate)) distractorPool.push(candidate);
    digitFiller++;
  }
  const candidates = shuffle([
    { label: answer, isAnswer: true, reason: null },
    ...distractorPool.slice(0, 3).map(v => ({ label: v, isAnswer: false, reason: `isn't the digit at position ${askIndex + 1} in ${result}` })),
  ]);
  return { prompt: `${exprStr} = ${maskedResult}. Find the value of ${askLetter}.`, candidates, howTo };
}

export function generateBalanceQuestion(difficulty = "medium", index = 0) {
  const built = pick([signRemapVariant, columnAdditionVariant, digitExtractionVariant])();
  const { prompt, candidates, howTo } = built;
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.reason}. ${howTo}`;
  });

  return {
    id: `balance-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "numerical",
    topicId: "balanceEquation",
    difficulty,
    prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const balanceEquationTopic = {
  id: "balanceEquation",
  categoryId: "numerical",
  title: "Balance the Equation",
  teach: {
    steps: [
      { caption: "A missing sign puzzle asks: which of +, -, ×, ÷ makes the equation true?" },
      { caption: "Try each sign one at a time and check if both sides match. 6 △ 2 = 8 → + works!" },
      { caption: "A missing digit puzzle works the same way — try digits one at a time until the column adds up." },
      { caption: "Sometimes a math result is relabeled with letters, like 120 written as ABC — figure out the real number first, then read off the digit you need." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateBalanceQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateBalanceQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
