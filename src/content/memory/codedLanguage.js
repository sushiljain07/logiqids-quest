import { shuffle, pick, pickN } from "../../lib/utils.js";

const CODE_POOL = ["zog", "mint", "pilo", "dax", "wren", "qubo", "farn", "clix", "trom", "yelp", "brik", "sona"];

const GROUPS = [
  { words: ["car", "window", "door", "lock", "key"], question: "what would you use to open a lock", target: "key" },
  { words: ["plate", "spoon", "cup", "fork", "chair"], question: "what would you sit on", target: "chair" },
  { words: ["pen", "paper", "bag", "chair", "shoe"], question: "what would you carry your books in", target: "bag" },
  { words: ["ball", "bat", "net", "shoe", "hat"], question: "what would you use to hit a ball", target: "bat" },
  { words: ["sun", "moon", "star", "cloud", "rain"], question: "what lights up the sky at night", target: "moon" },
  { words: ["dog", "cat", "bird", "fish", "cow"], question: "what would you keep in a bowl of water", target: "fish" },
  { words: ["apple", "bread", "milk", "rice", "egg"], question: "what comes from a hen", target: "egg" },
  { words: ["train", "bus", "car", "bike", "boat"], question: "what would you ride on water", target: "boat" },
  { words: ["knife", "spoon", "fork", "plate", "cup"], question: "what would you use to cut a cake", target: "knife" },
  { words: ["teacher", "doctor", "farmer", "pilot", "chef"], question: "who treats sick people", target: "doctor" },
  { words: ["circle", "square", "triangle", "star", "heart"], question: "what shape has three sides", target: "triangle" },
];

const CHAIN_SCENARIOS = [
  { chain: ["lead", "stick", "nib", "needle", "rope"], question: "what would you fit inside a pen to write with it", answerWord: "lead" },
  { chain: ["cup", "plate", "spoon", "fork", "bowl"], question: "what would you drink water from", answerWord: "cup" },
  { chain: ["shoe", "sock", "hat", "glove", "belt"], question: "what would you wear on your feet", answerWord: "shoe" },
];

const DERIVED_FROM = { orange: ["red", "yellow"], green: ["yellow", "blue"], violet: ["blue", "red"] };
const STEP2_RULES = [
  { base: "red", derived: "orange", result: "red orange" },
  { base: "yellow", derived: "green", result: "leaf" },
  { base: "blue", derived: "violet", result: "ultra" },
  { base: "red", derived: "violet", result: "red violet" },
  { base: "yellow", derived: "orange", result: "deep yellow" },
  { base: "blue", derived: "green", result: "blue green" },
];

function directCodeVariant() {
  const group = pick(GROUPS);
  const codes = pickN(CODE_POOL, group.words.length);
  const mapping = group.words.map((w, i) => ({ word: w, code: codes[i] }));
  const targetEntry = mapping.find(m => m.word === group.target);
  const statements = mapping.map(m => `${m.word} is called ${m.code}`).join(", ");
  const howTo = `Match "${group.target}" to its code: ${group.target} is called ${targetEntry.code}. That's the answer to "${group.question}".`;
  const decoys = shuffle(mapping.filter(m => m.word !== group.target)).slice(0, 3);
  const candidates = shuffle([
    { label: targetEntry.code, isAnswer: true, reason: null },
    ...decoys.map(d => ({ label: d.code, isAnswer: false, reason: `that's the code for "${d.word}", not "${group.target}"` })),
  ]);
  return { prompt: `If in a certain language, ${statements}, then ${group.question}?`, candidates, howTo };
}

function chainRelabelVariant() {
  const scenario = pick(CHAIN_SCENARIOS);
  const chain = scenario.chain;
  const n = chain.length;
  const mapping = chain.map((w, i) => ({ word: w, code: chain[(i + 1) % n] }));
  const statements = mapping.map(m => `${m.word} is called ${m.code}`).join(", ");
  const answerEntry = mapping.find(m => m.word === scenario.answerWord);
  const howTo = `Follow the chain: ${statements}. So "${scenario.answerWord}" is called "${answerEntry.code}".`;
  const decoys = shuffle(mapping.filter(m => m.word !== scenario.answerWord)).slice(0, 3);
  const candidates = shuffle([
    { label: answerEntry.code, isAnswer: true, reason: null },
    ...decoys.map(d => ({ label: d.code, isAnswer: false, reason: `that's the code for "${d.word}", not "${scenario.answerWord}"` })),
  ]);
  return { prompt: `If in a certain language, ${statements}, then ${scenario.question}?`, candidates, howTo };
}

function combinationChartVariant() {
  const rule2 = pick(STEP2_RULES);
  const [x, y] = DERIVED_FROM[rule2.derived];
  const howTo = `Step 1: ${x} + ${y} = ${rule2.derived}. Step 2: ${rule2.derived} + ${rule2.base} = ${rule2.result}.`;
  const decoyResults = shuffle(STEP2_RULES.filter(r => r.result !== rule2.result).map(r => r.result)).slice(0, 3);
  const candidates = shuffle([
    { label: rule2.result, isAnswer: true, reason: null },
    ...decoyResults.map(r => ({ label: r, isAnswer: false, reason: `that's a different combination's result` })),
  ]);
  return {
    prompt: `Colors combine in steps: red+yellow=orange, yellow+blue=green, blue+red=violet, and mixing one of those with a base color gives a deeper color. Step 1: mix ${x} and ${y}. Step 2: mix the result of step 1 with ${rule2.base}. What is the final color?`,
    candidates, howTo,
  };
}

export function generateCodedLanguageQuestion(difficulty = "medium", index = 0) {
  const built = pick([directCodeVariant, chainRelabelVariant, combinationChartVariant])();
  const { prompt, candidates, howTo } = built;
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.reason}. ${howTo}`;
  });

  return {
    id: `coded-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "memory",
    topicId: "codedLanguage",
    difficulty,
    prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const codedLanguageTopic = {
  id: "codedLanguage",
  categoryId: "memory",
  title: "Coded Language",
  teach: {
    steps: [
      { caption: "In this puzzle, every word is secretly renamed to a made-up code word." },
      { caption: "Read the list carefully and match each real word to its code word." },
      { caption: "Sometimes the renaming forms a CHAIN — one word is called another, which is called another, and so on." },
      { caption: "Sometimes two things combine by a rule chart, in steps — track the result of each step before moving to the next." },
      { caption: "Answer using the CODE or the final result, not the original real-world word!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateCodedLanguageQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateCodedLanguageQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
