import { shuffle, randomInt } from "../../lib/utils.js";

const OPS = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "×": (a, b) => a * b,
  "÷": (a, b) => a / b,
};

function buildOperands(op) {
  if (op === "+") { const a = randomInt(1,9), b = randomInt(1,9); return [a,b]; }
  if (op === "-") { const a = randomInt(5,9), b = randomInt(1,a); return [a,b]; }
  if (op === "×") { const a = randomInt(2,9), b = randomInt(2,9); return [a,b]; }
  const b = randomInt(2,5), q = randomInt(2,9);
  return [b*q, b];
}

export function generateBalanceQuestion(difficulty = "medium", index = 0) {
  const opNames = Object.keys(OPS);
  const correctOp = opNames[randomInt(0, opNames.length - 1)];
  const [a, b] = buildOperands(correctOp);
  const result = OPS[correctOp](a, b);
  const howTo = `Try each sign: only ${a} ${correctOp} ${b} = ${result} is true, so ${correctOp} is the answer.`;

  const letters = ["A", "B", "C", "D"];
  const shuffledOps = shuffle(opNames);
  const options = shuffledOps.map((op, i) => ({ id: letters[i], label: op }));
  const answerId = letters[shuffledOps.indexOf(correctOp)];
  const mistakes = {};
  shuffledOps.forEach((op, i) => {
    if (op === correctOp) return;
    const wrongResult = OPS[op](a, b);
    mistakes[letters[i]] = `If you use ${op}, ${a} ${op} ${b} = ${wrongResult}, not ${result}. ${howTo}`;
  });

  return {
    id: `balance-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "numerical",
    topicId: "balanceEquation",
    difficulty,
    prompt: `Which sign replaces △ so that ${a} △ ${b} = ${result}?`,
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
      { caption: "Try each sign one at a time and check if both sides match." },
      { caption: "Example: 6 △ 2 = 8. Try +: 6+2=8. That works!" },
      { caption: "So △ stands for + in that equation." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateBalanceQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateBalanceQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
