import { describe, it, expect } from "vitest";
import { CATEGORIES } from "./categories.js";
import { TOPICS, TOPICS_BY_CATEGORY, getTopic } from "./index.js";

describe("content index", () => {
  it("has 19 topics: 3 each for analytical/verbal/visual, 5 each for numerical/memory", () => {
    expect(TOPICS.length).toBe(19);
    const expectedCounts = { analytical: 3, verbal: 3, visual: 3, numerical: 5, memory: 5 };
    CATEGORIES.forEach(cat => {
      expect(TOPICS_BY_CATEGORY[cat.id].length).toBe(expectedCounts[cat.id]);
      TOPICS_BY_CATEGORY[cat.id].forEach(t => expect(t.categoryId).toBe(cat.id));
    });
  });

  it("getTopic finds a topic by id and returns undefined for unknown ids", () => {
    expect(getTopic("seriesCompletion").title).toBe("Series Completion");
    expect(getTopic("nonexistent")).toBeUndefined();
  });

  it("every topic exposes teach steps and correctly-sized generators", () => {
    TOPICS.forEach(t => {
      expect(t.teach.steps.length).toBeGreaterThan(0);
      expect(t.getTryTogether().length).toBe(2);
      expect(t.getYourTurn().length).toBe(4);
    });
  });
});
