import { shuffle, randomInt, pick } from "../../lib/utils.js";

const WORD_CATEGORIES = {
  fruit: ["apple", "mango", "banana", "orange", "grape"],
  vegetable: ["carrot", "potato", "onion", "spinach", "pea"],
  animal: ["tiger", "elephant", "zebra", "monkey", "lion"],
  vehicle: ["car", "bus", "train", "bicycle", "truck"],
};

function wordVariant() {
  const keys = Object.keys(WORD_CATEGORIES);
  const [catA, catB] = shuffle(keys).slice(0, 2);
  const words = [...shuffle(WORD_CATEGORIES[catA]).slice(0, 3), pick(WORD_CATEGORIES[catB])];
  const shuffled = shuffle(words.map((w, i) => ({ label: w, isOdd: i === 3 })));
  const howTo = `${words[0]}, ${words[1]}, and ${words[2]} are all a kind of ${catA}. The odd one out is ${words[3]}, which is a ${catB} instead.`;
  return { options: shuffled, howTo, prompt: "Find the ODD one out:" };
}

function numberVariant(difficulty) {
  const m = difficulty === "hard" ? randomInt(6, 9) : randomInt(2, 5);
  const multiples = shuffle(Array.from({ length: 20 }, (_, i) => (i + 1) * m)).slice(0, 3);
  let nonMultiple = randomInt(2, 9 * m);
  while (nonMultiple % m === 0) nonMultiple = randomInt(2, 9 * m);
  const values = [...multiples, nonMultiple];
  const shuffled = shuffle(values.map((v, i) => ({ label: String(v), isOdd: i === 3 })));
  const howTo = `${multiples.join(", ")} are all multiples of ${m}. ${nonMultiple} is the odd one out because it isn't.`;
  return { options: shuffled, howTo, prompt: "Find the ODD one out:" };
}

function placeValueVariant() {
  const hundreds = randomInt(2, 9);
  const value = hundreds * 100;
  const correctForms = [
    { label: `${hundreds} hundred's`, ok: true },
    { label: `${hundreds * 10} ten's`, ok: true },
    { label: `${value} one's`, ok: true },
  ];
  const wrongTens = hundreds * 10 + randomInt(1, 9); // an off-by-a-bit ten's count that does NOT equal `value`
  const values = [...correctForms.map(f => ({ label: f.label, isOdd: false })), { label: `${wrongTens} ten's`, isOdd: true }];
  const shuffled = shuffle(values);
  const howTo = `${hundreds} hundred's, ${hundreds * 10} ten's, and ${value} one's are all the same value: ${value}. ${wrongTens} ten's equals ${wrongTens * 10}, not ${value} — that's the odd one out.`;
  return { options: shuffled, howTo, prompt: "Find the ODD one out (they should all stand for the same value):" };
}

export function generateOddOneOutQuestion(difficulty = "medium", index = 0) {
  const built = pick([wordVariant, () => numberVariant(difficulty), placeValueVariant])();
  const letters = ["A", "B", "C", "D"];
  const options = built.options.map((o, i) => ({ id: letters[i], label: o.label }));
  const answerId = letters[built.options.findIndex(o => o.isOdd)];
  const mistakes = {};
  built.options.forEach((o, i) => {
    if (!o.isOdd) mistakes[letters[i]] = `${o.label} fits the group. ${built.howTo}`;
  });
  return {
    id: `odd-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "analytical",
    topicId: "oddOneOut",
    difficulty,
    prompt: built.prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${built.howTo}`, howTo: built.howTo, mistakes },
  };
}

export const oddOneOutTopic = {
  id: "oddOneOut",
  categoryId: "analytical",
  title: "Odd One Out",
  teach: {
    steps: [
      { caption: "Three of the four things in a group share something in common." },
      { caption: "One thing is different — that's the odd one out!" },
      { caption: "Sometimes the group shares a category (fruit), sometimes a math property (multiples of 5), sometimes a value in disguise (400 written as hundreds, tens, or ones)." },
      { caption: "Ask yourself: what do most of these have in common? Which one breaks that rule?" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateOddOneOutQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateOddOneOutQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
