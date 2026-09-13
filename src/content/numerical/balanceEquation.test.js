import { describe, it, expect } from "vitest";
import { generateBalanceQuestion, balanceEquationTopic } from "./balanceEquation.js";

const OPS = { "+": (a,b)=>a+b, "-": (a,b)=>a-b, "×": (a,b)=>a*b, "÷": (a,b)=>a/b };

describe("generateBalanceQuestion", () => {
  it("the answer operator really does produce the stated result", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateBalanceQuestion("medium", i);
      const [a, b, result] = q.prompt.match(/-?\d+/g).map(Number);
      const answerOp = q.options.find(o => o.id === q.answerId).label;
      expect(OPS[answerOp](a, b)).toBe(result);
      expect(new Set(q.options.map(o => o.label))).toEqual(new Set(["+","-","×","÷"]));
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
