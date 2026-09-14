import { shuffle, pick } from "../../lib/utils.js";

const ANIMALS = ["Tiger", "Lion", "Cheetah", "Horse", "Rabbit", "Deer", "Leopard", "Elephant"];

function twoClueVariant() {
  const [a, b, c, decoy] = shuffle(ANIMALS).slice(0, 4);
  const order = shuffle([a, b, c]);
  const askFastest = Math.random() < 0.5;
  const target = askFastest ? order[0] : order[2];
  const s1 = `${order[0]} runs faster than ${order[1]}.`;
  const s2 = `${order[1]} runs faster than ${order[2]}.`;
  const howTo = `Putting the clues together: ${order[0]} > ${order[1]} > ${order[2]} in speed, so ${target} is the ${askFastest ? "fastest" : "slowest"}.`;
  const optionAnimals = shuffle([order[0], order[1], order[2], decoy]);
  const candidates = optionAnimals.map(name => ({
    label: name,
    isAnswer: name === target,
    reason: name === target ? null : (name === decoy
      ? `${name} isn't even mentioned in the clues — only ${order[0]}, ${order[1]}, and ${order[2]} were compared`
      : `${name} isn't the ${askFastest ? "fastest" : "slowest"}`),
  }));
  return { prompt: `${s1} ${s2} Who is the ${askFastest ? "fastest" : "slowest"}?`, candidates, howTo };
}

function fourItemChainVariant() {
  const [a, b, c, d] = shuffle(ANIMALS).slice(0, 4);
  const askFastest = Math.random() < 0.5;
  const target = askFastest ? a : d;
  const s1 = `${a} runs faster than ${b}.`;
  const s2 = `${b} runs faster than ${c}.`;
  const s3 = `${c} runs faster than ${d}.`;
  const howTo = `Putting the clues together: ${a} > ${b} > ${c} > ${d} in speed, so ${target} is the ${askFastest ? "fastest" : "slowest"}.`;
  const optionAnimals = shuffle([a, b, c, d]);
  const candidates = optionAnimals.map(name => ({
    label: name,
    isAnswer: name === target,
    reason: name === target ? null : `${name} isn't the ${askFastest ? "fastest" : "slowest"}`,
  }));
  return { prompt: `${s1} ${s2} ${s3} Who is the ${askFastest ? "fastest" : "slowest"}?`, candidates, howTo };
}

function notMentionedTrapVariant() {
  const [a, b, c, decoy] = shuffle(ANIMALS).slice(0, 4);
  const order = shuffle([a, b, c]);
  const s1 = `${order[0]} runs faster than ${order[1]}.`;
  const s2 = `${order[1]} runs faster than ${order[2]}.`;
  const howTo = `The clues only talk about ${order[0]}, ${order[1]}, and ${order[2]}. ${decoy} is never mentioned at all.`;
  const optionAnimals = shuffle([order[0], order[1], order[2], decoy]);
  const candidates = optionAnimals.map(name => ({
    label: name,
    isAnswer: name === decoy,
    reason: name === decoy ? null : `${name} IS mentioned in the clues above`,
  }));
  return { prompt: `${s1} ${s2} Which of these animals was NOT mentioned in the clues?`, candidates, howTo };
}

export function generateWhosFastestQuestion(difficulty = "medium", index = 0) {
  const built = pick([twoClueVariant, fourItemChainVariant, notMentionedTrapVariant])();
  const { prompt, candidates, howTo } = built;
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.reason}. ${howTo}`;
  });

  return {
    id: `fastest-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "memory",
    topicId: "whosFastest",
    difficulty,
    prompt,
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
      { caption: "Clues compare things two at a time — you have to chain them together." },
      { caption: "\"Tiger faster than Lion. Tiger slower than Cheetah.\" That means: Cheetah > Tiger > Lion." },
      { caption: "Sometimes there are 3 clues chaining 4 things together — the same idea, just longer." },
      { caption: "Watch out for a name that's never even mentioned — you can't reason about it at all!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateWhosFastestQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateWhosFastestQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
