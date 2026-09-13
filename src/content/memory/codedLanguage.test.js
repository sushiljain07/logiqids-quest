import { describe, it, expect } from "vitest";
import { generateCodedLanguageQuestion, codedLanguageTopic } from "./codedLanguage.js";

describe("generateCodedLanguageQuestion", () => {
  it("the answer option is the code word actually assigned to the target word", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateCodedLanguageQuestion("medium", i);
      const answerLabel = q.options.find(o => o.id === q.answerId).label;
      expect(q.prompt).toContain(answerLabel);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
    }
  });
});

describe("codedLanguageTopic", () => {
  it("has the right shape", () => {
    expect(codedLanguageTopic.categoryId).toBe("memory");
    expect(codedLanguageTopic.getTryTogether().length).toBe(2);
    expect(codedLanguageTopic.getYourTurn().length).toBe(4);
  });
});
