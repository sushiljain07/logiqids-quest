import { shuffle } from "../../lib/utils.js";

const RELATION_SETS = {
  opposites: [["big","small"],["hot","cold"],["day","night"],["up","down"],["fast","slow"],["happy","sad"],["open","shut"],["light","dark"]],
  babyAnimals: [["cat","kitten"],["dog","puppy"],["cow","calf"],["horse","foal"],["sheep","lamb"],["hen","chick"]],
};

export function generateAnalogyQuestion(difficulty = "medium", index = 0) {
  const relationName = Math.random() < 0.5 ? "opposites" : "babyAnimals";
  const pairs = RELATION_SETS[relationName];
  const shuffledPairs = shuffle(pairs);
  const [a1, b1] = shuffledPairs[0];
  const [a2, b2] = shuffledPairs[1];
  const otherBs = shuffledPairs.slice(2, 4).map(p => p[1]);

  const relationLabel = relationName === "opposites" ? "the opposite of" : "the baby of";
  const howTo = `${a1} is to ${b1} because ${b1} is ${relationLabel} ${a1}. Using the same rule, ${a2} is to ${b2}.`;

  const candidates = shuffle([
    { value: b2, isAnswer: true },
    { value: a2, reason: `repeats ${a2} itself instead of giving its pair` },
    { value: otherBs[0], reason: `belongs to a different pair (${relationLabel} something else)` },
    { value: otherBs[1], reason: `also belongs to a different pair (${relationLabel} something else)` },
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.value }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.value} ${c.reason}. ${howTo}`;
  });

  return {
    id: `analogy-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "analytical",
    topicId: "analogies",
    difficulty,
    prompt: `${a1} is to ${b1} as ${a2} is to ?`,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const analogiesTopic = {
  id: "analogies",
  categoryId: "analytical",
  title: "Analogies",
  teach: {
    steps: [
      { caption: "An analogy compares two pairs of words that share the same relationship." },
      { caption: "\"Big is to small\" — that's an opposites relationship." },
      { caption: "Find the relationship in the first pair, then use the SAME relationship for the second pair." },
      { caption: "\"Hot is to cold as day is to ?\" — the answer is night, because it's the opposite of day." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateAnalogyQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateAnalogyQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
