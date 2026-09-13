import { shuffle } from "../../lib/utils.js";

const COMPOUND_WORDS = [
  ["sun", "flower"], ["foot", "ball"], ["rain", "bow"], ["note", "book"],
  ["butter", "fly"], ["tooth", "brush"], ["bed", "room"], ["sand", "castle"],
  ["straw", "berry"], ["air", "port"], ["back", "pack"], ["basket", "ball"],
];

const VALID_PAIR_SET = new Set(COMPOUND_WORDS.map(([h, t]) => `${h}+${t}`));

export function generateCompoundWordQuestion(difficulty = "medium", index = 0) {
  const shuffledEntries = shuffle(COMPOUND_WORDS);
  const [correctHead, correctTail] = shuffledEntries[0];

  // Sample head and tail independently across the FULL entry list. An earlier version walked a
  // nested loop that never advanced its outer index, so all three wrong options shared one head
  // word while the answer used a different one — the answer was the "odd head out" 100% of the
  // time. Sampling freely lets a distractor reuse the correct head, killing that signal.
  const correctKey = `${correctHead}+${correctTail}`;
  const wrongPairs = [];
  const seenKeys = new Set([correctKey]);
  let guard = 0;
  while (wrongPairs.length < 3 && guard < 500) {
    guard++;
    const i = Math.floor(Math.random() * shuffledEntries.length);
    const j = Math.floor(Math.random() * shuffledEntries.length);
    const head = shuffledEntries[i][0];
    const tail = shuffledEntries[j][1];
    const key = `${head}+${tail}`;
    if (seenKeys.has(key) || VALID_PAIR_SET.has(key)) continue;
    seenKeys.add(key);
    wrongPairs.push({ head, tail, key });
  }

  const howTo = `${correctHead.toUpperCase()} + ${correctTail.toUpperCase()} makes the real word "${correctHead}${correctTail}." The other pairs don't make a real word when joined.`;
  const candidates = shuffle([
    { label: `${correctHead.toUpperCase()} + ${correctTail.toUpperCase()}`, isAnswer: true },
    ...wrongPairs.map(p => ({ label: `${p.head.toUpperCase()} + ${p.tail.toUpperCase()}`, isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} isn't a real word when joined together. ${howTo}`;
  });

  return {
    id: `compound-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "verbal",
    topicId: "compoundWords",
    difficulty,
    prompt: "Which pair of words can be joined to make one meaningful word?",
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const compoundWordsTopic = {
  id: "compoundWords",
  categoryId: "verbal",
  title: "Compound Word Matching",
  teach: {
    steps: [
      { caption: "A compound word is made by joining two smaller words together." },
      { caption: "SUN + FLOWER = SUNFLOWER — a real word!" },
      { caption: "But FOOT + FLOWER isn't a word — it doesn't mean anything." },
      { caption: "Try joining each pair out loud — does it sound like a real word you know?" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateCompoundWordQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateCompoundWordQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
