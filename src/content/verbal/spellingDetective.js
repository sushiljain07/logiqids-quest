import { shuffle, pick } from "../../lib/utils.js";

const SPELLING_PAIRS = [
  ["friend", "freind"], ["believe", "beleive"], ["school", "shcool"],
  ["because", "becuase"], ["people", "poeple"], ["different", "diffrent"],
  ["remember", "remeber"], ["tomorrow", "tommorow"], ["favourite", "favourate"],
];

const HIDDEN_WORDS = ["lettuce", "carrot", "pencil", "window", "rocket", "guitar", "bottle", "candle"];
const DECOY_FRAGMENTS = ["diwnd", "fig", "trop", "blen", "swiz", "quim"];

const RHYME_FAMILIES = [
  { seed: "old", core: ["gold", "old", "sold", "scold"], impostors: ["bold", "fold", "hold", "cold", "mold", "told"] },
  { seed: "ight", core: ["light", "night", "sight", "fight"], impostors: ["bright", "flight", "might", "right", "tight", "slight"] },
  { seed: "ake", core: ["cake", "lake", "make", "rake"], impostors: ["bake", "fake", "wake", "take", "snake", "brake"] },
];

function misspellingVariant() {
  const shuffledPairs = shuffle(SPELLING_PAIRS);
  const [correctTarget, misspelled] = shuffledPairs[0];
  const otherCorrect = shuffledPairs.slice(1, 4).map(p => p[0]);

  const howTo = `"${misspelled}" is spelled incorrectly — the correct spelling is "${correctTarget}." The other three words are already spelled correctly.`;
  const candidates = shuffle([
    { label: misspelled, isAnswer: true, reason: null },
    ...otherCorrect.map(w => ({ label: w, isAnswer: false, reason: `is actually spelled correctly` })),
  ]);
  return { prompt: "Which of the following words is spelled INCORRECTLY?", candidates, howTo };
}

function hiddenWordVariant() {
  const target = pick(HIDDEN_WORDS);
  const before = pick(DECOY_FRAGMENTS);
  const after = pick(DECOY_FRAGMENTS.filter(f => f !== before));
  const grid = `${before}${target}${after}`.toUpperCase();
  const decoys = shuffle(HIDDEN_WORDS.filter(w => w !== target)).slice(0, 3);

  const howTo = `Reading through the letters carefully, "${target}" is hiding inside: ${before.toUpperCase()}${target.toUpperCase()}${after.toUpperCase()}.`;
  const candidates = shuffle([
    { label: target, isAnswer: true, reason: null },
    ...decoys.map(w => ({ label: w, isAnswer: false, reason: `isn't hidden in the letter grid above` })),
  ]);
  return { prompt: `Find the word hidden in the grid below: ${grid}`, candidates, howTo };
}

function oddFamilyVariant() {
  const family = pick(RHYME_FAMILIES);
  const wrongFamily = pick(RHYME_FAMILIES.filter(f => f.seed !== family.seed));
  const correctWords = shuffle(family.core);
  const wrongWords = shuffle(wrongFamily.core);
  const impostorWords = shuffle(family.impostors).slice(0, 4);
  const mixedWords = shuffle([...shuffle(family.core).slice(0, 2), ...shuffle(wrongFamily.core).slice(0, 2)]);

  const options = [
    { label: correctWords.join(", "), ok: true, why: null },
    { label: wrongWords.join(", "), ok: false, why: `these rhyme with "-${wrongFamily.seed}", not "-${family.seed}"` },
    { label: impostorWords.join(", "), ok: false, why: `these rhyme the same way, but none of them actually contain "${family.seed}"` },
    { label: mixedWords.join(", "), ok: false, why: `mixes two different rhyme families together` },
  ];

  const howTo = `${family.core.join(", ")} all end in "-${family.seed}" and rhyme the same way — that's the matching family.`;
  const candidates = shuffle(options.map(o => ({ label: o.label, isAnswer: o.ok, reason: o.why })));
  return { prompt: `Find the option where every word rhymes the same way as: ${family.core.join(", ")}`, candidates, howTo };
}

export function generateSpellingQuestion(difficulty = "medium", index = 0) {
  const built = pick([misspellingVariant, hiddenWordVariant, oddFamilyVariant])();
  const { prompt, candidates, howTo } = built;
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `"${c.label}" ${c.reason}. ${howTo}`;
  });

  return {
    id: `spelling-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "verbal",
    topicId: "spellingDetective",
    difficulty,
    prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const spellingDetectiveTopic = {
  id: "spellingDetective",
  categoryId: "verbal",
  title: "Spelling Detective",
  teach: {
    steps: [
      { caption: "Some words are tricky to spell — like 'friend' and 'because'." },
      { caption: "Look closely at each word, one letter at a time — does it match the way you learned to spell it?" },
      { caption: "Words can also hide inside a run of letters, like LETTUCE hiding inside DIWNDLETTUCEFIGERATOR." },
      { caption: "And whole families of words can rhyme the same way, like GOLD, OLD, SOLD, and SCOLD." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateSpellingQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateSpellingQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
