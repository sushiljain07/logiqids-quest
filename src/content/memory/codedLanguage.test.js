import { describe, it, expect } from "vitest";
import { generateCodedLanguageQuestion, codedLanguageTopic } from "./codedLanguage.js";

describe("generateCodedLanguageQuestion", () => {
  it("produces a well-formed question with a unique answer (direct code, chain, or combination-chart variant)", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateCodedLanguageQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
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
