import { shuffle, randomInt, pick } from "../../lib/utils.js";

const SYMBOLS = ["+", "-", "×"];
const ICON_PAIRS = [["🦸", "🕷️"], ["🐶", "🐱"], ["⚽", "🏀"], ["🍎", "🍌"]];

function applyOp(meaning, a, b) {
  if (meaning === "+") return a + b;
  if (meaning === "-") return a - b;
  return a * b;
}

function randomRemap() {
  let perm;
  do { perm = shuffle(SYMBOLS); } while (perm.some((v, i) => v === SYMBOLS[i]));
  return Object.fromEntries(SYMBOLS.map((s, i) => [s, perm[i]]));
}

function evalExpression(nums, syms, remap) {
  let result = nums[0];
  for (let i = 0; i < syms.length; i++) result = applyOp(remap[syms[i]], result, nums[i + 1]);
  return result;
}

function toCandidates(answer, distractorPool, reasonFor) {
  const distractorValues = [...new Set(distractorPool.map(String))].filter(v => v !== String(answer));
  while (distractorValues.length < 3) distractorValues.push(String(Number(answer) + distractorValues.length + 2));
  return shuffle([
    { label: String(answer), isAnswer: true, reason: null },
    ...distractorValues.slice(0, 3).map(v => ({ label: v, isAnswer: false, reason: reasonFor(v) })),
  ]);
}

function remapEvaluateVariant(difficulty) {
  const remap = randomRemap();
  const opCount = difficulty === "hard" ? 3 : 2;
  const nums = Array.from({ length: opCount + 1 }, () => randomInt(1, 6));
  const syms = Array.from({ length: opCount }, () => pick(SYMBOLS));
  const answer = evalExpression(nums, syms, remap);
  const exprStr = nums.map((n, i) => (i === 0 ? `${n}` : ` ${syms[i - 1]} ${n}`)).join("");
  const remapDesc = SYMBOLS.map(s => `"${s}" means "${remap[s]}"`).join(", ");
  const realExprStr = nums.map((n, i) => (i === 0 ? `${n}` : ` ${remap[syms[i - 1]]} ${n}`)).join("");
  const literalAnswer = evalExpression(nums, syms, { "+": "+", "-": "-", "×": "×" });
  const howTo = `${remapDesc}. So ${exprStr} really means ${realExprStr} = ${answer}.`;
  const candidates = toCandidates(answer, [literalAnswer, answer + randomInt(1, 4), answer - randomInt(1, 4)],
    () => `doesn't match once you swap in the real meaning of each symbol`);
  return { prompt: `If ${remapDesc}, then what is the value of ${exprStr}?`, candidates, howTo };
}

function remapCompareVariant() {
  const remap = randomRemap();
  const remapDesc = SYMBOLS.map(s => `"${s}" means "${remap[s]}"`).join(", ");
  let exprs, askLowest, sorted;
  do {
    exprs = Array.from({ length: 4 }, () => {
      const a = randomInt(1, 9), b = randomInt(1, 9);
      const sym = pick(SYMBOLS);
      return { a, b, sym, value: applyOp(remap[sym], a, b), text: `${a} ${sym} ${b}` };
    });
    askLowest = Math.random() < 0.5;
    sorted = [...exprs].sort((x, y) => (askLowest ? x.value - y.value : y.value - x.value));
  } while (sorted.filter(e => e.value === sorted[0].value).length > 1);
  const target = sorted[0];
  const howTo = `${remapDesc}. Evaluating each: ${exprs.map(e => `${e.text} = ${e.value}`).join(", ")}. ${target.text} gives the ${askLowest ? "lowest" : "highest"} result.`;
  const candidates = shuffle(exprs.map(e => ({
    label: e.text,
    isAnswer: e === target,
    reason: e === target ? null : `${e.text} = ${e.value}, which isn't the ${askLowest ? "lowest" : "highest"}`,
  })));
  return { prompt: `If ${remapDesc}, which of the following expressions gives the ${askLowest ? "lowest" : "highest"} answer?`, candidates, howTo };
}

function iconEquationVariant() {
  const [iconX, iconY] = pick(ICON_PAIRS);
  const x = randomInt(0, 5);
  const y = randomInt(0, 5);
  const askX = Math.random() < 0.5;
  const answer = askX ? x : y;
  const askIcon = askX ? iconX : iconY;
  const howTo = `From the three clues, ${iconX} = ${x} and ${iconY} = ${y} is the only pair of values that fits all three equations at once.`;
  const candidates = toCandidates(answer, [x, y, answer + 1].filter(v => v >= 0), () => `doesn't fit all three equations together`);
  return {
    prompt: `If ${iconX} + ${iconY} = ${x + y}, ${iconX} × ${iconY} = ${x * y}, and ${iconX} - ${iconY} = ${x - y}, then ${askIcon} = ?`,
    candidates, howTo,
  };
}

export function generateSymbolSubstitutionQuestion(difficulty = "medium", index = 0) {
  const built = pick([() => remapEvaluateVariant(difficulty), remapCompareVariant, iconEquationVariant])();
  const { prompt, candidates, howTo } = built;
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.reason}. ${howTo}`;
  });

  return {
    id: `symbolsub-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "numerical",
    topicId: "symbolSubstitution",
    difficulty,
    prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const symbolSubstitutionTopic = {
  id: "symbolSubstitution",
  categoryId: "numerical",
  title: "Symbol Substitution",
  teach: {
    steps: [
      { caption: "Sometimes math symbols get secretly swapped — \"+\" might really mean \"−\"!" },
      { caption: "Before solving anything, rewrite the problem using the REAL meaning of each symbol." },
      { caption: "Then solve left to right, one step at a time, just like normal." },
      { caption: "The same idea works with pictures standing in for numbers — use the clues to figure out what each picture is worth." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateSymbolSubstitutionQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateSymbolSubstitutionQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
