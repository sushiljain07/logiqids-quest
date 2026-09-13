import { shuffle } from "../../lib/utils.js";

const ANIMALS = ["Tiger", "Lion", "Cheetah", "Horse", "Rabbit", "Deer", "Leopard", "Elephant"];

export function generateWhosFastestQuestion(difficulty = "medium", index = 0) {
  const [a, b, c, decoy] = shuffle(ANIMALS).slice(0, 4);
  const order = shuffle([a, b, c]); // order[0] fastest ... order[2] slowest
  const askFastest = Math.random() < 0.5;
  const target = askFastest ? order[0] : order[2];

  const s1 = `${order[0]} runs faster than ${order[1]}.`;
  const s2 = `${order[1]} runs faster than ${order[2]}.`;
  const howTo = `Putting the clues together: ${order[0]} > ${order[1]} > ${order[2]} in speed, so ${target} is the ${askFastest ? "fastest" : "slowest"}.`;

  const letters = ["A", "B", "C", "D"];
  const optionAnimals = shuffle([order[0], order[1], order[2], decoy]);
  const options = optionAnimals.map((name, i) => ({ id: letters[i], label: name }));
  const answerId = letters[optionAnimals.indexOf(target)];
  const mistakes = {};
  optionAnimals.forEach((name, i) => {
    if (letters[i] === answerId) return;
    if (name === decoy) {
      mistakes[letters[i]] = `${name} isn't even mentioned in the clues — only ${order[0]}, ${order[1]}, and ${order[2]} were compared. ${howTo}`;
    } else {
      mistakes[letters[i]] = `${name} isn't the ${askFastest ? "fastest" : "slowest"}. ${howTo}`;
    }
  });

  return {
    id: `fastest-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "memory",
    topicId: "whosFastest",
    difficulty,
    prompt: `${s1} ${s2} Who is the ${askFastest ? "fastest" : "slowest"}?`,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const whosFastestTopic = {
  id: "whosFastest",
  categoryId: "memory",
  title: "Who's Fastest?",
  teach: {
    steps: [
      { caption: "Two clues compare three things two at a time — you have to chain them together." },
      { caption: "\"Tiger faster than Lion. Tiger slower than Cheetah.\"" },
      { caption: "That means: Cheetah > Tiger > Lion in speed." },
      { caption: "Now you can answer who's fastest (Cheetah) or slowest (Lion)!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateWhosFastestQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateWhosFastestQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
