import { shuffle, randomInt, pick } from "../../lib/utils.js";

const NAMES = ["Riya", "Aarav", "Meera", "Kabir", "Ishita", "Vihaan"];
const ITEMS = ["apples", "marbles", "pencils", "stickers", "balloons", "books"];

function storyScenarioVariant(difficulty) {
  const name = pick(NAMES);
  const item = pick(ITEMS);
  const kind = difficulty === "hard" ? "mul" : pick(["add", "sub", "mul"]);
  let prompt, answer, distractorPool;
  if (kind === "add") {
    const a = randomInt(3, 12), b = randomInt(2, 10);
    answer = a + b;
    prompt = `${name} has ${a} ${item}. ${name} gets ${b} more ${item}. How many ${item} does ${name} have now?`;
    distractorPool = [a - b, a * b, answer + 1];
  } else if (kind === "sub") {
    const a = randomInt(8, 15), b = randomInt(1, a - 1);
    answer = a - b;
    prompt = `${name} has ${a} ${item}. ${name} gives away ${b} ${item}. How many ${item} does ${name} have left?`;
    distractorPool = [a + b, a * b, answer - 1];
  } else {
    const a = randomInt(2, 6), b = randomInt(2, 6);
    answer = a * b;
    prompt = `${name} has ${a} bags with ${b} ${item} in each bag. How many ${item} are there in total?`;
    distractorPool = [a + b, a - b, answer + 1];
  }
  const howTo = `Read carefully what's happening in the story, then do the matching operation. The answer is ${answer}.`;
  return { prompt, answer, distractorPool, howTo };
}

function comparisonDeductionVariant() {
  const [p, q, r] = shuffle(NAMES).slice(0, 3);
  const maxMarks = 50;
  const z = randomInt(2, 6);
  const x = randomInt(2, 6);
  const rScore = randomInt(20, maxMarks - x - z - 2);
  const qScore = rScore + z;
  const pScore = qScore + x;
  const howTo = `${r} scored ${rScore}. ${q} got ${z} more than ${r} (${qScore}). ${p} got ${x} more than ${q} (${pScore}).`;
  const distractorPool = [qScore, rScore, pScore + x];
  return {
    prompt: `Three students ${p}, ${q}, and ${r} took an exam of ${maxMarks} marks. 1. ${p} scored the highest marks among the three. 2. ${q} got ${x} marks less than ${p}. 3. ${r} scored ${rScore}, which was ${z} marks less than ${q}. How much did ${p} score?`,
    answer: pScore, distractorPool, howTo,
  };
}

function tableLookupVariant() {
  const rows = shuffle(NAMES).slice(0, 4).map(name => {
    const startH = randomInt(8, 11);
    const startM = pick([0, 15, 30, 45]);
    const durMin = randomInt(60, 150);
    const endTotal = startH * 60 + startM + durMin;
    return { name, startH, startM, endH: Math.floor(endTotal / 60), endM: endTotal % 60, durMin };
  });
  const askLongest = Math.random() < 0.5;
  const sorted = [...rows].sort((a, b) => (askLongest ? b.durMin - a.durMin : a.durMin - b.durMin));
  const target = sorted[0].name;
  const fmt = (h, m) => `${h}:${String(m).padStart(2, "0")}`;
  const tableDesc = rows.map(row => `${row.name} studied from ${fmt(row.startH, row.startM)} to ${fmt(row.endH, row.endM)}`).join("; ");
  const howTo = `Durations: ${rows.map(row => `${row.name} studied ${row.durMin} minutes`).join(", ")}. ${target} studied the ${askLongest ? "longest" : "shortest"}.`;
  return {
    prompt: `${tableDesc}. Who studied for the ${askLongest ? "longest" : "shortest"} duration?`,
    answer: target, distractorPool: rows.map(row => row.name).filter(n => n !== target), howTo,
  };
}

function twoStepTransformVariant() {
  const a = randomInt(200, 900);
  const b = randomInt(100, a - 10);
  const diff = a - b;
  const diffStr = String(diff);
  const swapped = diffStr.length >= 2
    ? diffStr.slice(0, -2) + diffStr.slice(-1) + diffStr.slice(-2, -1)
    : diffStr;
  const answer = Number(swapped);
  const howTo = `Step 1: ${a} - ${b} = ${diff}. Step 2: swap the last two digits of ${diff} to get ${swapped}.`;
  const distractorPool = [diff, answer + 10, answer - 10];
  return {
    prompt: `Step 1: Find the difference of ${a} and ${b}. Step 2: Swap the units and tens places. What is the resultant number?`,
    answer, distractorPool, howTo,
  };
}

function netChangeVariant() {
  const start = randomInt(2, 6);
  const added = randomInt(1, 3);
  const dec = randomInt(1, start);
  const removed = added + dec;
  const current = start - dec;
  const item = pick(ITEMS);
  const howTo = `Starting amount: ${start} ${item}. Adding ${added} then removing ${removed} leaves ${start} + ${added} - ${removed} = ${current}. To get back to ${start}, ${dec} more need to be put back.`;
  const distractorPool = [dec + 1, dec - 1, added, removed].filter(v => v >= 0 && v !== dec);
  return {
    prompt: `A container had ${start} ${item}. Someone adds ${added} ${item} and then removes ${removed} ${item}. How many ${item} need to be put back in to return to the original amount of ${start}?`,
    answer: dec, distractorPool, howTo,
  };
}

function hitMissAlgebraVariant() {
  const totalShots = randomInt(6, 10);
  const hitReward = randomInt(2, 4);
  const missPenalty = 1;
  const misses = randomInt(1, Math.floor(totalShots / 2));
  const hits = totalShots - misses;
  const net = hits * hitReward - misses * missPenalty;
  const howTo = `With ${hits} hits and ${misses} misses out of ${totalShots} shots: ${hits} × ${hitReward} - ${misses} × ${missPenalty} = ${net}. That's the number of misses that gives a net score of ${net}.`;
  const distractorPool = [misses + 1, misses - 1, hits].filter(v => v >= 0 && v !== misses);
  return {
    prompt: `For every hit in a game, a player earns ${hitReward} points. For every miss, they lose ${missPenalty} point. After ${totalShots} shots, they have a net score of ${net}. How many shots did they miss?`,
    answer: misses, distractorPool, howTo,
  };
}

function reverseOperationWordedVariant() {
  const start = randomInt(50, 300);
  const kind = pick(["add", "sub", "double"]);
  let end, correctDesc;
  if (kind === "add") { const k = randomInt(10, 90); end = start + k; correctDesc = `${k} is added to the number`; }
  else if (kind === "sub") { const k = randomInt(10, 90); end = start - k; correctDesc = `${k} is subtracted from the number`; }
  else { end = start * 2; correctDesc = `the number is doubled`; }
  const distractorPool = [...new Set([
    `${randomInt(10, 90)} is added to the number`,
    `${randomInt(10, 90)} is subtracted from the number`,
    `the number is doubled`,
    `${randomInt(2, 5)} is multiplied to the number`,
  ].filter(d => d !== correctDesc))];
  const howTo = `${start} → ${end}. "${correctDesc}" explains exactly that change.`;
  return {
    prompt: `A number ${start} is taken and an operation is performed on it. The result is ${end}. What operation might have been performed?`,
    answer: correctDesc, distractorPool, howTo,
  };
}

export function generateWordProblemQuestion(difficulty = "medium", index = 0) {
  const built = pick([
    () => storyScenarioVariant(difficulty), comparisonDeductionVariant, tableLookupVariant, twoStepTransformVariant,
    netChangeVariant, hitMissAlgebraVariant, reverseOperationWordedVariant,
  ])();
  const { prompt, answer, distractorPool, howTo } = built;
  const candidatePool = [...new Set(distractorPool.map(String))].filter(v => v !== String(answer) && v !== "NaN");
  while (candidatePool.length < 3) candidatePool.push(`${answer}${candidatePool.length}x`);
  const wrongValues = shuffle(candidatePool).slice(0, 3);

  const candidates = shuffle([
    { label: String(answer), isAnswer: true },
    ...wrongValues.map(v => ({ label: v, isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} isn't right — go back through each step carefully. ${howTo}`;
  });

  return {
    id: `wordprob-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "numerical",
    topicId: "wordProblems",
    difficulty,
    prompt,
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
      { caption: "Some problems give clues about several people at once — work through them one at a time, like a detective." },
      { caption: "Some problems have TWO steps — finish step 1 completely before starting step 2." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateWordProblemQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateWordProblemQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
