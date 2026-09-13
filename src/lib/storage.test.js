import { describe, it, expect, beforeEach, vi } from "vitest";

function makeMemoryStorage() {
  let store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    clear: () => { store = {}; },
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", makeMemoryStorage());
  vi.resetModules();
});

describe("storage", () => {
  it("loadJSON returns fallback when nothing stored", async () => {
    const { loadJSON } = await import("./storage.js");
    expect(loadJSON("nope", { a: 1 })).toEqual({ a: 1 });
  });

  it("saveJSON + loadJSON round-trips", async () => {
    const { saveJSON, loadJSON } = await import("./storage.js");
    saveJSON("k", { hello: "world" });
    expect(loadJSON("k", null)).toEqual({ hello: "world" });
  });

  it("recordTopicAttempt accumulates attempts/correct and sets a sticky everMastered flag", async () => {
    const { recordTopicAttempt, loadProgress } = await import("./storage.js");
    recordTopicAttempt("seriesCompletion", true);
    recordTopicAttempt("seriesCompletion", false);
    const rec = recordTopicAttempt("seriesCompletion", true);
    // 2 correct out of 3 — under the threshold, so not mastered yet
    expect(rec).toEqual({ attempts: 3, correct: 2, everMastered: false });
    expect(loadProgress().seriesCompletion).toEqual({ attempts: 3, correct: 2, everMastered: false });

    // 3 correct out of 4 = 75% — threshold crossed
    const mastered = recordTopicAttempt("seriesCompletion", true);
    expect(mastered).toEqual({ attempts: 4, correct: 3, everMastered: true });

    // Two more wrong answers drop the live ratio to 3/6 = 50%, but mastery stays earned
    recordTopicAttempt("seriesCompletion", false);
    const after = recordTopicAttempt("seriesCompletion", false);
    expect(after.correct / after.attempts).toBeLessThan(0.75);
    expect(after).toEqual({ attempts: 6, correct: 3, everMastered: true });
    expect(loadProgress().seriesCompletion.everMastered).toBe(true);
  });

  it("addLeaderboardEntry keeps only top 5 by pct desc", async () => {
    const { addLeaderboardEntry, loadLeaderboard } = await import("./storage.js");
    for (let i = 0; i < 6; i++) {
      addLeaderboardEntry({ name: `p${i}`, avatar: "🦁", raw: i, pct: i * 10, date: "2026-01-01" });
    }
    const board = loadLeaderboard();
    expect(board.length).toBe(5);
    expect(board[0].pct).toBe(50);
    expect(board[4].pct).toBe(10);
  });
});
