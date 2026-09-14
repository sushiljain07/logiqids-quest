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

const NAMES_A = ["Anant", "Rohan", "Aditya", "Karan"];
const NAMES_B = ["Rajesh", "Suresh", "Manish", "Dinesh"];

function lineInsertSwapVariant() {
  const totalBefore = randomInt(30, 50);
  const nameA = pick(NAMES_A);
  const nameB = pick(NAMES_B);
  const posAFromLeft = randomInt(10, totalBefore - 15);
  const posBFromRight = randomInt(10, totalBefore - posAFromLeft - 2);
  const joinCount = randomInt(1, 4);
  const posBFromLeftBefore = totalBefore - posBFromRight + 1;
  const posAFromLeftAfterJoin = posAFromLeft + joinCount;
  const posBFromLeftAfterJoin = posBFromLeftBefore + joinCount;
  const answer = posAFromLeftAfterJoin; // B swaps into A's spot
  const howTo = `${nameA} starts ${ordinal(posAFromLeft)} from the left, ${nameB} starts ${ordinal(posBFromRight)} from the right (${ordinal(posBFromLeftBefore)} from the left in a line of ${totalBefore}). When ${joinCount} more join at the left end, everyone's position-from-left shifts by ${joinCount}: ${nameA} is now ${ordinal(posAFromLeftAfterJoin)}, ${nameB} is now ${ordinal(posBFromLeftAfterJoin)}. After they swap, ${nameB} takes ${nameA}'s spot: position ${answer} from the left.`;
  const pool = [...new Set([posBFromLeftAfterJoin, posAFromLeft, posAFromLeftAfterJoin + joinCount].filter(v => v > 0 && v !== answer))];
  while (pool.length < 3) pool.push(answer + pool.length + 3);
  const candidates = shuffle([
    { label: String(answer), isAnswer: true, reason: null },
    ...pool.slice(0, 3).map(v => ({ label: String(v), isAnswer: false, reason: `doesn't correctly account for both the new joiners and the swap` })),
  ]);
  return {
    prompt: `There are ${totalBefore} people in a line. ${nameA} is ${ordinal(posAFromLeft)} from the left and ${nameB} is ${ordinal(posBFromRight)} from the right. ${joinCount} more people join the line at the left end. After this, ${nameA} and ${nameB} interchange their positions. Find ${nameB}'s position from the left.`,
    candidates, howTo,
  };
}

function maxGapVariant() {
  const { sequence } = pickMidpointPuzzle();
  const pairs = [];
  let guard = 0;
  while (pairs.length < 4 && guard < 200) {
    guard++;
    const i = randomInt(0, 25), j = randomInt(0, 25);
    if (i === j) continue;
    const key = [sequence[i], sequence[j]].sort().join("");
    if (pairs.some(p => p.key === key)) continue;
    pairs.push({ a: sequence[i], b: sequence[j], gap: Math.abs(i - j), key });
  }
  const sorted = [...pairs].sort((x, y) => y.gap - x.gap);
  if (sorted[0].gap === sorted[1].gap) return maxGapVariant();
  const target = sorted[0];
  const howTo = `In this order — ${sequence.join(" ")} — counting the letters between each pair: ${pairs.map(p => `${p.a} and ${p.b} have ${p.gap - 1}`).join(", ")}. "${target.a}" and "${target.b}" have the most letters between them.`;
  const candidates = shuffle(pairs.map(p => ({
    label: `${p.a} and ${p.b}`,
    isAnswer: p === target,
    reason: p === target ? null : `has fewer letters between them than ${target.a} and ${target.b}`,
  })));
  return { prompt: `In this order of letters: ${sequence.join(" ")} — which of these pairs has the GREATEST number of letters between them?`, candidates, howTo };
}

export function generatePositionInSequenceQuestion(difficulty = "medium", index = 0) {
  const built = pick([nthFromEndVariant, midpointVariant, lineInsertSwapVariant, maxGapVariant])();
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
