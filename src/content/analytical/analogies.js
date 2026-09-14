import { shuffle, pick } from "../../lib/utils.js";

const RELATION_SETS = {
  opposites: { label: "the opposite of", pairs: [["big","small"],["hot","cold"],["day","night"],["up","down"],["fast","slow"],["happy","sad"],["open","shut"],["light","dark"]] },
  babyAnimals: { label: "the baby of", pairs: [["cat","kitten"],["dog","puppy"],["cow","calf"],["horse","foal"],["sheep","lamb"],["hen","chick"]] },
  function: { label: "what a", pairs: [["bulb","glow"],["fan","rotate"],["clock","tick"],["phone","ring"],["kettle","whistle"],["engine","roar"]] },
  category: { label: "a kind of", pairs: [["dog","pet"],["housefly","pest"],["rose","flower"],["car","vehicle"],["rupee","currency"],["mango","fruit"]] },
  toolUse: { label: "used to", pairs: [["pen","write"],["scissors","cut"],["broom","sweep"],["key","unlock"],["spoon","stir"],["needle","sew"]] },
};

export function generateAnalogyQuestion(difficulty = "medium", index = 0) {
  const relationName = pick(Object.keys(RELATION_SETS));
  const { label: relationLabel, pairs } = RELATION_SETS[relationName];
  const shuffledPairs = shuffle(pairs);
  const [a1, b1] = shuffledPairs[0];
  const [a2, b2] = shuffledPairs[1];
  const otherBs = shuffledPairs.slice(2, 4).map(p => p[1]);

  const howTo = relationName === "function" || relationName === "toolUse"
    ? `${a1} is to ${b1} because that's ${relationLabel} ${a1} does/is for. Using the same rule, ${a2} is to ${b2}.`
    : `${a1} is to ${b1} because ${b1} is ${relationLabel} ${a1}. Using the same rule, ${a2} is to ${b2}.`;

  const candidates = shuffle([
    { value: b2, isAnswer: true },
    { value: a2, reason: `repeats ${a2} itself instead of giving its pair` },
    { value: otherBs[0], reason: `belongs to a different pair` },
    { value: otherBs[1], reason: `also belongs to a different pair` },
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
      { caption: "\"Big is to small\" is opposites. \"Cat is to kitten\" is baby animals." },
      { caption: "\"Bulb is to glow\" is what it does. \"Dog is to pet\" is what category it belongs to." },
      { caption: "Find the relationship in the first pair, then use the SAME relationship for the second pair." },
      { caption: "\"Hot is to cold as day is to ?\" — the answer is night, because it's the opposite of day." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateAnalogyQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateAnalogyQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
