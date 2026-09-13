import { describe, it, expect } from "vitest";
import { generateWhichLetterQuestion, whichLetterAmITopic } from "./whichLetterAmI.js";

function countLetter(word, letter) {
  return word.split("").filter(ch => ch === letter).length;
}

describe("generateWhichLetterQuestion", () => {
  it("the claimed letter really does appear once and twice as stated", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateWhichLetterQuestion("medium", i);
      const answerLetter = q.options.find(o => o.id === q.answerId).label;
      const words = q.prompt.match(/"([a-z]+)"/g).map(w => w.replace(/"/g, ""));
      expect(countLetter(words[0], answerLetter)).toBe(1);
      expect(countLetter(words[1], answerLetter)).toBe(2);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
    }
  });
});

describe("whichLetterAmITopic", () => {
  it("has the right shape", () => {
    expect(whichLetterAmITopic.categoryId).toBe("verbal");
    expect(whichLetterAmITopic.getTryTogether().length).toBe(2);
    expect(whichLetterAmITopic.getYourTurn().length).toBe(4);
  });
});
