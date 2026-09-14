import { shuffle, randomInt, pick, pickMidpointPuzzle } from "../../lib/utils.js";

const ITEM_POOLS = [
  ["🌻", "🌼", "🌹", "🌷", "🌸", "🌺", "🌵", "🍀", "🍁", "🌲", "🌳", "🌴"],
  ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮"],
  ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸", "🥊", "🥋"],
];

function ordinal(n) {
  if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
  if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
  if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
  return `${n}th`;
}

function nthFromEndVariant() {
  const pool = pick(ITEM_POOLS);
  const n = randomInt(8, 12);
  const row = shuffle(pool).slice(0, n);
  const offset = randomInt(1, 3);
  const dir = pick(["right", "left"]);
  const minRef = dir === "right" ? 0 : offset;
  const maxRef = dir === "right" ? n - 1 - offset : n - 1;
  const refIndex = randomInt(minRef, maxRef);
  const targetIndex = dir === "right" ? refIndex + offset : refIndex - offset;
  const target = row[targetIndex];
  const decoys = shuffle(row.filter((_, i) => i !== targetIndex)).slice(0, 3);
  const howTo = `Counting from the left end, the ${ordinal(refIndex + 1)} item is ${row[refIndex]}. Moving ${offset} more position${offset > 1 ? "s" : ""} to the ${dir}, the ${ordinal(targetIndex + 1)} item is ${target}.`;
  const candidates = shuffle([
    { label: target, isAnswer: true, reason: null },
    ...decoys.map(d => ({ label: d, isAnswer: false, reason: `isn't in the right spot — recount carefully from the ${ordinal(refIndex + 1)} item` })),
  ]);
  return { prompt: `${row.join(" ")} — Which item is ${offset} position${offset > 1 ? "s" : ""} to the ${dir} of the ${ordinal(refIndex + 1)} item from the left end?`, candidates, howTo };
}

function midpointVariant() {
  const { sequence, letterA, letterB, midpointLetter } = pickMidpointPuzzle();
  const iA = sequence.indexOf(letterA), iB = sequence.indexOf(letterB);
  const midIndex = (iA + iB) / 2;
  const decoyPool = sequence.filter((_, i) => i !== midIndex && i !== iA && i !== iB);
  const decoys = shuffle(decoyPool).slice(0, 3);
  const howTo = `In this order — ${sequence.join(" ")} — "${letterA}" is at position ${iA + 1} and "${letterB}" is at position ${iB + 1}. The letter exactly halfway between them is at position ${midIndex + 1}: "${midpointLetter}".`;
  const candidates = shuffle([
    { label: midpointLetter, isAnswer: true, reason: null },
    ...decoys.map(d => ({ label: d, isAnswer: false, reason: `sits at position ${sequence.indexOf(d) + 1}, not exactly halfway between "${letterA}" and "${letterB}"` })),
  ]);
  return { prompt: `Given this order of letters: ${sequence.join(" ")} — which letter sits exactly midway between "${letterA}" and "${letterB}"?`, candidates, howTo };
}

export function generatePositionInSequenceQuestion(difficulty = "medium", index = 0) {
  const built = pick([nthFromEndVariant, midpointVariant])();
  const { prompt, candidates, howTo } = built;
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.reason}. ${howTo}`;
  });

  return {
    id: `position-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "memory",
    topicId: "positionInSequence",
    difficulty,
    prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const positionInSequenceTopic = {
  id: "positionInSequence",
  categoryId: "memory",
  title: "Position in a Sequence",
  teach: {
    steps: [
      { caption: "Line up a row of items and count carefully from one end — position 1, 2, 3..." },
      { caption: "\"2 to the right of the 6th item\" means: find the 6th item first, then move 2 more spots right." },
      { caption: "The same counting idea works with letters in a made-up order, not just pictures." },
      { caption: "Go slowly and recount if you're not sure — one miscount changes the whole answer." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generatePositionInSequenceQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generatePositionInSequenceQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
