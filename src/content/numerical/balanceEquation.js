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

function exprEqualTo(target) {
  const kind = pick(["add", "sub", "mul"]);
  if (kind === "add") { const a = randomInt(1, target - 1 || 1); return { text: `${a} + ${target - a}` }; }
  if (kind === "sub") { const a = target + randomInt(1, 10); return { text: `${a} - ${a - target}` }; }
  const factors = [];
  for (let f = 2; f <= target; f++) if (target % f === 0) factors.push(f);
  if (factors.length) { const f = pick(factors); return { text: `${f} × ${target / f}` }; }
  return { text: `${target} + 0` };
}

function uniqueExprs(target, count, excludeTexts = new Set()) {
  const result = [];
  let guard = 0;
  while (result.length < count && guard < 50) {
    guard++;
    const e = exprEqualTo(target);
    if (!excludeTexts.has(e.text) && !result.some(r => r.text === e.text)) result.push(e);
  }
  return result;
}

function wrongComputationVariant() {
  const target = randomInt(12, 30);
  const correctExprs = uniqueExprs(target, 3);
  const wrongDelta = pick([-3, -2, -1, 1, 2, 3]);
  const wrongTarget = target + wrongDelta;
  const [wrongExpr] = uniqueExprs(wrongTarget, 1, new Set(correctExprs.map(e => e.text)));
  const howTo = `${correctExprs.map(e => `${e.text} = ${target}`).join(", ")}. But ${wrongExpr.text} = ${wrongTarget}, not ${target} — that's the one that doesn't match.`;
  const candidates = shuffle([
    { label: wrongExpr.text, isAnswer: true, reason: null },
    ...correctExprs.map(e => ({ label: e.text, isAnswer: false, reason: `${e.text} = ${target}, which DOES match` })),
  ]);
  return { prompt: `Which of the following options does NOT equal ${target}?`, candidates, howTo };
}

function linearEquationVariant() {
  const n = randomInt(5, 30);
  const m = randomInt(2, 4);
  const k = n * (m - 1);
  const howTo = `If the number is n, then n + ${k} = ${m} × n. That means ${k} = ${m - 1} × n, so n = ${k} ÷ ${m - 1} = ${n}.`;
  const pool = [...new Set([k, n + m, n * m].filter(v => v !== n))];
  while (pool.length < 3) pool.push(n + pool.length + 5);
  const candidates = shuffle([
    { label: String(n), isAnswer: true, reason: null },
    ...pool.slice(0, 3).map(v => ({ label: String(v), isAnswer: false, reason: `doesn't satisfy n + ${k} = ${m} × n` })),
  ]);
  return { prompt: `When ${k} is added to a number, the result is ${m} times the number itself. What was the number?`, candidates, howTo };
}

function sortExpressionsVariant() {
  const letters3 = ["A", "B", "C"];
  const exprs = letters3.map(lab => {
    const a = randomInt(5, 20), b = randomInt(1, a - 1);
    return { lab, value: a - b, text: `${a} - ${b}` };
  });
  if (new Set(exprs.map(e => e.value)).size < 3) return sortExpressionsVariant();
  const sorted = [...exprs].sort((x, y) => x.value - y.value);
  const correctStr = sorted.map(e => e.lab).join("");
  const allPerms = [["A","B","C"],["A","C","B"],["B","A","C"],["B","C","A"],["C","A","B"],["C","B","A"]].map(p => p.join(""));
  const wrongPerms = shuffle(allPerms.filter(p => p !== correctStr)).slice(0, 3);
  const exprList = exprs.map(e => `${e.lab}) ${e.text}`).join(", ");
  const howTo = `Evaluating each: ${exprs.map(e => `${e.text} = ${e.value}`).join(", ")}. Sorted ascending: ${sorted.map(e => e.lab).join(" → ")}.`;
  const candidates = shuffle([
    { label: correctStr, isAnswer: true, reason: null },
    ...wrongPerms.map(p => ({ label: p, isAnswer: false, reason: `doesn't put the results in ascending order` })),
  ]);
  return { prompt: `Which of the following options has these expressions in ascending order of their value? ${exprList}`, candidates, howTo };
}

export function generateBalanceQuestion(difficulty = "medium", index = 0) {
  const built = pick([signRemapVariant, columnAdditionVariant, digitExtractionVariant, wrongComputationVariant, linearEquationVariant, sortExpressionsVariant])();
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
