import { shuffle, randomInt, pick } from "../../lib/utils.js";

const NAMES = ["Riya", "Aarav", "Meera", "Kabir", "Ishita", "Vihaan"];
const ITEMS = ["apples", "marbles", "pencils", "stickers", "balloons", "books"];

function buildScenario(difficulty) {
  const name = pick(NAMES);
  const item = pick(ITEMS);
  const kind = difficulty === "hard" ? "mul" : pick(["add", "sub", "mul"]);
  if (kind === "add") {
    const a = randomInt(3, 12), b = randomInt(2, 10);
    return { prompt: `${name} has ${a} ${item}. ${name} gets ${b} more ${item}. How many ${item} does ${name} have now?`, answer: a + b, wrong: [a - b, a * b, a + b + 1] };
  }
  if (kind === "sub") {
    const a = randomInt(8, 15), b = randomInt(1, a - 1);
    return { prompt: `${name} has ${a} ${item}. ${name} gives away ${b} ${item}. How many ${item} does ${name} have left?`, answer: a - b, wrong: [a + b, a * b, a - b - 1] };
  }
  const a = randomInt(2, 6), b = randomInt(2, 6);
  return { prompt: `${name} has ${a} bags with ${b} ${item} in each bag. How many ${item} are there in total?`, answer: a * b, wrong: [a + b, a - b, a * b + 1] };
}

export function generateWordProblemQuestion(difficulty = "medium", index = 0) {
  const scenario = buildScenario(difficulty);
  const candidatePool = [...new Set(scenario.wrong.filter(v => v > 0 && v !== scenario.answer))];
  while (candidatePool.length < 3) candidatePool.push(scenario.answer + candidatePool.length + 2);
  const wrongValues = candidatePool.slice(0, 3);

  const howTo = `Read carefully what's happening in the story, then do the matching operation. The answer is ${scenario.answer}.`;
  const candidates = shuffle([
    { label: String(scenario.answer), isAnswer: true },
    ...wrongValues.map(v => ({ label: String(v), isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} comes from mixing up the operation in the story. ${howTo}`;
  });

  return {
    id: `wordprob-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "numerical",
    topicId: "wordProblems",
    difficulty,
    prompt: scenario.prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const wordProblemsTopic = {
  id: "wordProblems",
  categoryId: "numerical",
  title: "Word Problems",
  teach: {
    steps: [
      { caption: "A word problem tells a small story with numbers hidden inside." },
      { caption: "Figure out what's happening: are things being added, taken away, or grouped?" },
      { caption: "\"Gets more\" or \"in total\" often means add or multiply. \"Gives away\" means subtract." },
      { caption: "Then just do that operation with the numbers in the story." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateWordProblemQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateWordProblemQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
