import { shuffle, pickN } from "../../lib/utils.js";

const CODE_POOL = ["zog", "mint", "pilo", "dax", "wren", "qubo", "farn", "clix", "trom", "yelp"];

const GROUPS = [
  { words: ["car", "window", "door", "lock", "key"], question: "what would you use to open a lock", target: "key" },
  { words: ["plate", "spoon", "cup", "fork", "chair"], question: "what would you sit on", target: "chair" },
  { words: ["pen", "paper", "bag", "chair", "shoe"], question: "what would you carry your books in", target: "bag" },
];

export function generateCodedLanguageQuestion(difficulty = "medium", index = 0) {
  const group = GROUPS[index % GROUPS.length];
  const codes = pickN(CODE_POOL, group.words.length);
  const mapping = group.words.map((w, i) => ({ word: w, code: codes[i] }));
  const targetEntry = mapping.find(m => m.word === group.target);

  const statements = mapping.map(m => `${m.word} is called ${m.code}`).join(", ");
  const howTo = `Match "${group.target}" to its code: ${group.target} is called ${targetEntry.code}. That's the answer to "${group.question}".`;

  const decoys = shuffle(mapping.filter(m => m.word !== group.target)).slice(0, 3);
  const candidates = shuffle([
    { label: targetEntry.code, isAnswer: true },
    ...decoys.map(d => ({ label: d.code, word: d.word, isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} is the code for "${c.word}", not "${group.target}". ${howTo}`;
  });

  return {
    id: `coded-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "memory",
    topicId: "codedLanguage",
    difficulty,
    prompt: `If in a certain language, ${statements}, then ${group.question}?`,
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
      { caption: "Then answer the question using the CODE word for the real answer, not the real word itself!" },
      { caption: "If \"key is called dax,\" and the answer is key, then your answer is dax." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateCodedLanguageQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateCodedLanguageQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
