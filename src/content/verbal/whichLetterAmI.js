import { shuffle } from "../../lib/utils.js";

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

export function generateWhichLetterQuestion(difficulty = "medium", index = 0) {
  const { word1, word2, letter } = findOnceTwicePair();
  const otherLetters = new Set((word1 + word2).split("").filter(ch => ch !== letter));
  const decoys = shuffle([...otherLetters]).slice(0, 3);
  while (decoys.length < 3) decoys.push(String.fromCharCode(97 + Math.floor(Math.random() * 26)));

  const howTo = `Check each letter: "${letter}" appears exactly once in "${word1}" and exactly twice in "${word2}" — that's the match!`;
  const candidates = shuffle([
    { label: letter, isAnswer: true },
    ...decoys.map(d => ({ label: d, isAnswer: false })),
  ]);
  const letters4 = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters4[i], label: c.label }));
  const answerId = letters4[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) {
      mistakes[letters4[i]] = `"${c.label}" appears ${countLetter(word1, c.label)} time(s) in "${word1}" and ${countLetter(word2, c.label)} time(s) in "${word2}" — that doesn't match once-then-twice. ${howTo}`;
    }
  });

  return {
    id: `letter-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "verbal",
    topicId: "whichLetterAmI",
    difficulty,
    prompt: `I am a letter in the English alphabet. I come once in "${word1}" and twice in "${word2}". Which letter am I?`,
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
      { caption: "This riddle gives you two words and asks which letter fits a counting clue." },
      { caption: "Spell out each word slowly, letter by letter, and keep a tally." },
      { caption: "Example: \"fox\" has f-o-x (each once). \"Giraffe\" has f twice!" },
      { caption: "So the letter that appears once in fox and twice in giraffe is F." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateWhichLetterQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateWhichLetterQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
