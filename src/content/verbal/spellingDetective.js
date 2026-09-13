import { shuffle } from "../../lib/utils.js";

const SPELLING_PAIRS = [
  ["friend", "freind"], ["believe", "beleive"], ["school", "shcool"],
  ["because", "becuase"], ["people", "poeple"], ["different", "diffrent"],
  ["remember", "remeber"], ["tomorrow", "tommorow"], ["favourite", "favourate"],
];

export function generateSpellingQuestion(difficulty = "medium", index = 0) {
  const shuffledPairs = shuffle(SPELLING_PAIRS);
  const [correctTarget, misspelled] = shuffledPairs[0];
  const otherCorrect = shuffledPairs.slice(1, 4).map(p => p[0]);

  const howTo = `"${misspelled}" is spelled incorrectly — the correct spelling is "${correctTarget}." The other three words are already spelled correctly.`;
  const candidates = shuffle([
    { label: misspelled, isAnswer: true },
    ...otherCorrect.map(w => ({ label: w, isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `"${c.label}" is actually spelled correctly. ${howTo}`;
  });

  return {
    id: `spelling-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "verbal",
    topicId: "spellingDetective",
    difficulty,
    prompt: "Which of the following words is spelled INCORRECTLY?",
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const spellingDetectiveTopic = {
  id: "spellingDetective",
  categoryId: "verbal",
  title: "Spelling Detective",
  teach: {
    steps: [
      { caption: "Some words are tricky to spell — like 'friend' and 'because'." },
      { caption: "Look closely at each word, one letter at a time." },
      { caption: "Does it match the way you learned to spell it? Watch for swapped or missing letters." },
      { caption: "\"Freind\" looks close to \"friend,\" but the i and e are swapped — that's the mistake!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateSpellingQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateSpellingQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
