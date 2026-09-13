import { describe, it, expect } from "vitest";
import { shuffle, randomInt, pick, pickN } from "./utils.js";

describe("utils", () => {
  it("shuffle returns same elements, possibly reordered", () => {
    const a = [1,2,3,4,5];
    const s = shuffle(a);
    expect(s).not.toBe(a);
    expect([...s].sort()).toEqual([...a].sort());
  });
  it("randomInt stays within inclusive bounds", () => {
    for (let i=0;i<200;i++){
      const n = randomInt(3,7);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(7);
    }
  });
  it("pick returns an element of the array", () => {
    const a = ["x","y","z"];
    expect(a).toContain(pick(a));
  });
  it("pickN returns n distinct elements", () => {
    const a = [1,2,3,4,5];
    const n = pickN(a, 3);
    expect(n.length).toBe(3);
    expect(new Set(n).size).toBe(3);
    n.forEach(x => expect(a).toContain(x));
  });
});
