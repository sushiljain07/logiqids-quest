import { describe, it, expect } from "vitest";
import { generateBalanceQuestion, balanceEquationTopic } from "./balanceEquation.js";

const OPS = { "+": (a,b)=>a+b, "-": (a,b)=>a-b, "×": (a,b)=>a*b, "÷": (a,b)=>a/b };

describe("generateBalanceQuestion", () => {
  it("produces a well-formed question with a unique answer (sign, column-addition, or digit-extraction variant)", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateBalanceQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
      if (q.prompt.includes("△")) {
        const [a, b, result] = q.prompt.match(/-?\d+/g).map(Number);
        const answerOp = q.options.find(o => o.id === q.answerId).label;
        expect(OPS[answerOp](a, b)).toBe(result);
        expect(new Set(q.options.map(o => o.label))).toEqual(new Set(["+", "-", "×", "÷"]));
      } else {
        expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      }
    }
  });
});

describe("balanceEquationTopic", () => {
  it("has the right shape", () => {
    expect(balanceEquationTopic.categoryId).toBe("numerical");
    expect(balanceEquationTopic.getTryTogether().length).toBe(2);
    expect(balanceEquationTopic.getYourTurn().length).toBe(4);
  });
});
