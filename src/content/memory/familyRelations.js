import { shuffle, pick } from "../../lib/utils.js";

const NAMES = ["Aman", "Riya", "Sanjiv", "Meera", "Kabir", "Neha", "Vihaan", "Ishita"];

const RELATION_TEMPLATES = [
  { childRel: "daughter", siblingRel: "brother", answer: "uncle" },
  { childRel: "daughter", siblingRel: "sister", answer: "aunt" },
  { childRel: "son", siblingRel: "brother", answer: "uncle" },
  { childRel: "son", siblingRel: "sister", answer: "aunt" },
];

const ALWAYS_OLDER = ["Father", "Mother", "Grandfather", "Grandmother"];
const VARIABLE_AGE = ["Brother", "Sister", "Cousin", "Friend"];

function directRelationVariant() {
  const [a, b, c] = shuffle(NAMES).slice(0, 3);
  const tmpl = pick(RELATION_TEMPLATES);
  const decoys = shuffle(["uncle", "aunt", "brother", "father", "grandfather", "cousin"].filter(w => w !== tmpl.answer)).slice(0, 3);
  const howTo = `${a} is ${b}'s ${tmpl.childRel}, so ${b} is ${a}'s parent. ${c} is ${b}'s ${tmpl.siblingRel}, so ${c} is ${a}'s ${tmpl.answer}.`;
  const candidates = shuffle([
    { label: `${c} is ${a}'s ${tmpl.answer}`, isAnswer: true, reason: null },
    ...decoys.map(w => ({ label: `${c} is ${a}'s ${w}`, isAnswer: false, reason: `${c} is actually ${a}'s ${tmpl.answer}, not ${w}` })),
  ]);
  return { prompt: `If ${a} is ${b}'s ${tmpl.childRel}, and ${b} has a ${tmpl.siblingRel} named ${c}, who is ${c} to ${a}?`, candidates, howTo };
}

function logicalConstraintVariant() {
  const answer = pick(ALWAYS_OLDER);
  const decoys = shuffle(VARIABLE_AGE).slice(0, 3);
  const howTo = `A ${answer.toLowerCase()} is always older than you, by definition — they can never be younger than you. A brother, sister, or cousin CAN be either older or younger, so those relations aren't fixed.`;
  const candidates = shuffle([
    { label: answer, isAnswer: true, reason: null },
    ...decoys.map(w => ({ label: w, isAnswer: false, reason: `a ${w.toLowerCase()} CAN be younger than you — that relation isn't fixed by age` })),
  ]);
  return { prompt: "I am elder than some of my family members and younger than some of them. Which of the following relations can NEVER be younger than me?", candidates, howTo };
}

function onlyChildVariant() {
  const [x, ...others] = shuffle(NAMES).slice(0, 4);
  const howTo = `${x} is an only child, so ${x}'s father has exactly one child — ${x} themself. The answer is ${x}.`;
  const decoys = shuffle(others).slice(0, 3);
  const candidates = shuffle([
    { label: x, isAnswer: true, reason: null },
    ...decoys.map(name => ({ label: name, isAnswer: false, reason: `the question is about ${x}'s own father's only child, which is ${x}, not ${name}` })),
  ]);
  return { prompt: `${x} is an only child. What is the name of ${x}'s father's only child?`, candidates, howTo };
}

export function generateFamilyRelationsQuestion(difficulty = "medium", index = 0) {
  const built = pick([directRelationVariant, logicalConstraintVariant, onlyChildVariant])();
  const { prompt, candidates, howTo } = built;
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.reason}. ${howTo}`;
  });

  return {
    id: `family-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "memory",
    topicId: "familyRelations",
    difficulty,
    prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const familyRelationsTopic = {
  id: "familyRelations",
  categoryId: "memory",
  title: "Family Relations",
  teach: {
    steps: [
      { caption: "Family riddles ask you to follow relationships step by step: parent, child, sibling." },
      { caption: "\"Amanda is Jack's daughter, Jack has a brother Paul\" — draw it out: Paul is Jack's brother, so Paul is Amanda's uncle." },
      { caption: "Some relations are ALWAYS older (like a parent or grandparent) — others, like a sibling, could be either." },
      { caption: "Watch for trick questions that loop back to the very person the question started with!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateFamilyRelationsQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateFamilyRelationsQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
