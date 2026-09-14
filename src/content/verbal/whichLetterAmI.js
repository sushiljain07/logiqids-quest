import { shuffle, pickMidpointPuzzle } from "../../lib/utils.js";

const WORD_BANK = ["giraffe", "elephant", "banana", "umbrella", "butterfly", "pineapple", "kangaroo", "dinosaur", "chocolate", "mountain", "fox"];

function countLetter(word, letter) {
  return word.split("").filter(ch => ch === letter).length;
}

function findOnceTwicePair() {
  const shuffledWords = shuffle(WORD_BANK);
  for (let a = 0; a < shuffledWords.length; a++) {
    for (let b = 0; b < shuffledWords.length; b++) {
      if (a === b) continue;
      const word1 = shuffledWords[a], word2 = shuffledWords[b];
      for (let code = 97; code < 97 + 26; code++) {
        const letter = String.fromCharCode(code);
        if (countLetter(word1, letter) === 1 && countLetter(word2, letter) === 2) {
          return { word1, word2, letter };
        }
      }
    }
  }
  return { word1: "fox", word2: "giraffe", letter: "f" }; // verified fallback: f appears once in fox, twice in giraffe
}

function onceTwiceVariant() {
  const { word1, word2, letter } = findOnceTwicePair();
  const otherLetters = new Set((word1 + word2).split("").filter(ch => ch !== letter));
  const decoys = shuffle([...otherLetters]).slice(0, 3);
  while (decoys.length < 3) decoys.push(String.fromCharCode(97 + Math.floor(Math.random() * 26)));

  const howTo = `Check each letter: "${letter}" appears exactly once in "${word1}" and exactly twice in "${word2}" — that's the match!`;
  const candidates = shuffle([
    { label: letter, isAnswer: true },
    ...decoys.map(d => ({ label: d, isAnswer: false, reason: `"${d}" appears ${countLetter(word1, d)} time(s) in "${word1}" and ${countLetter(word2, d)} time(s) in "${word2}" — that doesn't match once-then-twice` })),
  ]);
  return { prompt: `I am a letter in the English alphabet. I come once in "${word1}" and twice in "${word2}". Which letter am I?`, candidates, howTo };
}

function midpointVariant() {
  const { sequence, letterA, letterB, midpointLetter } = pickMidpointPuzzle();
  const iA = sequence.indexOf(letterA), iB = sequence.indexOf(letterB);
  const midIndex = (iA + iB) / 2;
  const decoyPool = sequence.filter((_, i) => i !== midIndex && i !== iA && i !== iB);
  const decoys = shuffle(decoyPool).slice(0, 3);

  const howTo = `In this order — ${sequence.join(" ")} — "${letterA}" is at position ${iA + 1} and "${letterB}" is at position ${iB + 1}. Exactly halfway between them, at position ${(iA + iB) / 2 + 1}, is "${midpointLetter}".`;
  const candidates = shuffle([
    { label: midpointLetter, isAnswer: true },
    ...decoys.map(d => ({ label: d, isAnswer: false, reason: `"${d}" sits at position ${sequence.indexOf(d) + 1}, not halfway between "${letterA}" and "${letterB}"` })),
  ]);
  return { prompt: `In this letter order: ${sequence.join(" ")} — which letter is exactly midway between "${letterA}" and "${letterB}"?`, candidates, howTo };
}

export function generateWhichLetterQuestion(difficulty = "medium", index = 0) {
  const built = Math.random() < 0.6 ? onceTwiceVariant() : midpointVariant();
  const { prompt, candidates, howTo } = built;
  const letters4 = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters4[i], label: c.label }));
  const answerId = letters4[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters4[i]] = `${c.reason}. ${howTo}`;
  });

  return {
    id: `letter-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "verbal",
    topicId: "whichLetterAmI",
    difficulty,
    prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const whichLetterAmITopic = {
  id: "whichLetterAmI",
  categoryId: "verbal",
  title: "Which Letter Am I?",
  teach: {
    steps: [
      { caption: "This puzzle gives you clues about a letter's position or count, and asks you to find it." },
      { caption: "One kind: spell out two words slowly and keep a tally. \"Fox\" has f-o-x (each once). \"Giraffe\" has f twice!" },
      { caption: "Another kind: letters are listed in a made-up order. Count positions carefully to find the one exactly in the middle of two others." },
      { caption: "Either way — go slowly, one letter at a time, and double-check your count before answering." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateWhichLetterQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateWhichLetterQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
