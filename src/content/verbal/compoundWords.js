import { shuffle, pick } from "../../lib/utils.js";

const COMPOUND_WORDS = [
  ["sun", "flower"], ["foot", "ball"], ["rain", "bow"], ["note", "book"],
  ["butter", "fly"], ["tooth", "brush"], ["bed", "room"], ["sand", "castle"],
  ["straw", "berry"], ["air", "port"], ["back", "pack"], ["basket", "ball"],
];
const VALID_PAIR_SET = new Set(COMPOUND_WORDS.map(([h, t]) => `${h}+${t}`));

const STEM_SETS = [
  { stem: "at", valid: ["c", "h", "m", "p", "r", "s"] },
  { stem: "an", valid: ["c", "m", "p", "t", "r"] },
  { stem: "ail", valid: ["m", "s", "t", "n"] },
  { stem: "ake", valid: ["c", "l", "m", "r", "t", "w"] },
];
const INVALID_PREFIXES = ["x", "y", "z", "g"];

function joinPairVariant() {
  const shuffledEntries = shuffle(COMPOUND_WORDS);
  const [correctHead, correctTail] = shuffledEntries[0];
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
    { label: `${correctHead.toUpperCase()} + ${correctTail.toUpperCase()}`, isAnswer: true, reason: null },
    ...wrongPairs.map(p => ({ label: `${p.head.toUpperCase()} + ${p.tail.toUpperCase()}`, isAnswer: false, reason: `isn't a real word when joined together` })),
  ]);
  return { prompt: "Which pair of words can be joined to make one meaningful word?", candidates, howTo };
}

function buildLetterSet(correctSet) {
  const numReplace = pick([1, 2]);
  const positions = shuffle([0, 1, 2, 3]).slice(0, numReplace);
  const bad = [];
  const letters = correctSet.map((l, idx) => {
    if (!positions.includes(idx)) return l;
    const badLetter = pick(INVALID_PREFIXES).toUpperCase();
    bad.push(badLetter);
    return badLetter;
  });
  return { letters: shuffle(letters), bad };
}

function stemPrefixVariant() {
  const set = pick(STEM_SETS);
  const correctSet = shuffle(set.valid).slice(0, 4).map(l => l.toUpperCase());
  const wrongSets = [0, 1, 2].map(() => buildLetterSet(correctSet));
  const howTo = `_${set.stem.toUpperCase()} becomes a real word with any of ${correctSet.join(", ")} in front (like "${correctSet[0].toLowerCase()}${set.stem}"). Every letter in the right answer must work — the other sets each sneak in a letter that doesn't make a real word.`;
  const candidates = shuffle([
    { label: shuffle(correctSet).join(", "), isAnswer: true, reason: null },
    ...wrongSets.map(w => ({ label: w.letters.join(", "), isAnswer: false, reason: `${w.bad.join(" and ")} doesn't make a real word in front of "${set.stem}"` })),
  ]);
  return { prompt: `I am a word. _${set.stem.toUpperCase()} Out of the given options, which option has letters which ALL form meaningful words when placed at the beginning?`, candidates, howTo };
}

export function generateCompoundWordQuestion(difficulty = "medium", index = 0) {
  const built = pick([joinPairVariant, stemPrefixVariant])();
  const { prompt, candidates, howTo } = built;
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} ${c.reason}. ${howTo}`;
  });

  return {
    id: `compound-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "verbal",
    topicId: "compoundWords",
    difficulty,
    prompt,
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
      { caption: "Words can be built by joining two smaller words, or by adding letters to the front of a word part." },
      { caption: "SUN + FLOWER = SUNFLOWER — a real word! But FOOT + FLOWER isn't." },
      { caption: "C + AT = CAT is real too. Every letter in the right answer has to make a real word — even one that fails ruins the set." },
      { caption: "Try each combination out loud — does it sound like a real word you know?" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateCompoundWordQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateCompoundWordQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
