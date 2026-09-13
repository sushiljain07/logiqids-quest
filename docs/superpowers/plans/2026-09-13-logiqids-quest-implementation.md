# LogiQids Quest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a teach-first learning app (not a quiz bank) that helps a class 3 student build the 5 reasoning skills tested by LogiQids, via a skill map of 15 topics, each with a Teach → Try Together → Your Turn loop and spoken, mistake-specific explanations.

**Architecture:** React + Vite SPA, all state in localStorage, no backend. Pure logic (question generators, scoring, geometry formulas, voice selection) lives in `src/lib/` and `src/content/`, unit-tested with vitest. UI components consume that logic and are verified with a Playwright smoke script (matching the sibling project india-capital-quest's approach) since this codebase family doesn't use a DOM-testing library.

**Tech Stack:** React 18, Vite 6, vitest 5 (unit tests, node environment, no jsdom needed — no lib code touches the DOM directly except guarded `window.speechSynthesis` calls), lucide-react (icons), playwright-core + system Chrome (smoke verification, same pattern as india-capital-quest).

**Spec:** `docs/superpowers/specs/2026-09-13-logiqids-quest-design.md`

## Global Constraints

- No backend, no accounts, no paid services — everything runs from a static build.
- Audio explanations use only `window.speechSynthesis` (Web Speech API) — no audio files, no external TTS.
- Every question carries a general `howTo` explanation (the solving strategy, always present) plus an optional `mistakes` map giving a wrong-answer-specific explanation where one can be constructed reliably; when a chosen wrong option has no specific entry, the UI falls back to `howTo` rather than showing nothing or a bare "here's the right answer."
- Visual-category puzzles must be correct **by construction** (formulas or explicit shape lists), never by eyeballing a compound figure.
- 5 categories exactly as named in the spec: Analytical Thinking (`analytical`), Verbal (`verbal`), Visual (`visual`), Numerical Ability (`numerical`), Memory & Concentration (`memory`).
- 3 topics per category for v1 (15 total), each with a `teach` step script, a `getTryTogether()` generator (2 questions), and a `getYourTurn()` generator (4 questions).
- New repo `logiqids-quest`, public, under GitHub user `sushiljain07`, deployed to Vercel — same workflow as india-capital-quest.
- Every screen must render correctly on both desktop and mobile (down to ~360px wide) — use fluid/`auto-fit` grids and `clamp()` type sizing (as in india-capital-quest), not fixed breakpoint-only layouts, and verify with real phone/tablet/desktop viewport screenshots before calling any screen done (Task 35 does this for the whole app, but check as you go).

## Shared data shapes (used by every task below)

```js
// Question — returned by every content generator
{
  id: string,                 // unique per generated instance
  categoryId: string,         // one of: analytical, verbal, visual, numerical, memory
  topicId: string,
  difficulty: 'easy' | 'medium' | 'hard',
  prompt: string,
  figure: null | ShapeSpec,   // see lib/figures.js — null for pure-text questions
  options: [{ id: 'A'|'B'|'C'|'D', label?: string, figure?: ShapeSpec }],  // exactly 4
  answerId: string,           // matches one options[].id
  explanation: {
    correct: string,             // shown/spoken when she answers correctly
    howTo: string,                // ALWAYS present: general solving-strategy explanation, used as fallback
    mistakes: { [optionId: string]: string }  // OPTIONAL, partial: specific wrong-answer explanations where one can be reliably constructed
  }
}

// ShapeSpec — used by figure and options[].figure
{
  width: number, height: number,
  shapes: [
    { type: 'rect', x, y, w, h, fill?, stroke? } |
    { type: 'line', x1, y1, x2, y2, stroke, strokeWidth? } |
    { type: 'polygon', points: string, fill?, stroke? } |
    { type: 'circle', cx, cy, r, fill?, stroke? } |
    { type: 'text', x, y, text, fontSize?, fill? }
  ]
}

// Topic — one of the 15 exported from content/index.js
{
  id: string, categoryId: string, title: string,
  teach: { steps: [{ caption: string, visual?: ShapeSpec }] },
  getTryTogether: () => Question[],   // length 2
  getYourTurn: () => Question[],      // length 4
}
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx` (temporary placeholder — replaced fully in Task 33, but must render *something real*, not a TODO)
- Create: `src/styles.css` (base reset + design tokens, extended by later tasks)
- Create: `.gitignore`

**Interfaces:**
- Produces: an app that runs with `npm run dev` and builds with `npm run build`; `src/styles.css` exposes CSS custom properties (`--ink`, `--muted`, `--orange`, `--cream`, `--card`, `--line`, `--green`, `--red`, `--purple`) that every later component's CSS relies on.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "logiqids-quest",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.7",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "vitest": "^5.0.0"
  }
}
```

- [ ] **Step 2: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#fff8ed" />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%A7%A9%3C/text%3E%3C/svg%3E" />
    <title>LogiQids Quest</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Write `src/main.jsx`**

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(<App />);
```

- [ ] **Step 4: Write a real placeholder `src/App.jsx`**

```jsx
import React from "react";

export default function App() {
  return (
    <div className="app">
      <div className="ambient a1" /><div className="ambient a2" />
      <main className="home">
        <h1>LogiQids Quest</h1>
        <p>Scaffold ready — screens are wired up in later tasks.</p>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Write `src/styles.css` (base tokens + reset)**

```css
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap');
:root{font-family:Nunito,system-ui,sans-serif;color:#25233a;background:#fff9f0;font-synthesis:none;--ink:#25233a;--muted:#77758a;--orange:#ff7a3d;--gold:#f5b73c;--cream:#fff9f0;--card:#fff;--line:#ece7df;--green:#20a66a;--red:#e45b5b;--purple:#6b5bd6}
*{box-sizing:border-box}body{margin:0;background:var(--cream)}button{font:inherit;cursor:pointer;border:0;color:inherit}
.app{min-height:100vh;position:relative;overflow-x:hidden}
.ambient{position:absolute;border-radius:50%;filter:blur(1px);opacity:.35;pointer-events:none}
.a1{width:360px;height:360px;background:#ffe3c5;top:-150px;right:-80px}
.a2{width:280px;height:280px;background:#e7ddff;bottom:-130px;left:-100px}
.home{max-width:1120px;margin:auto;padding:40px 24px}
```

- [ ] **Step 6: Write `.gitignore`**

```
node_modules
dist
.vercel
*.log
```

- [ ] **Step 7: Install and verify the build**

Run: `npm install && npm run build`
Expected: build succeeds, `dist/index.html` produced, no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json index.html src/main.jsx src/App.jsx src/styles.css .gitignore package-lock.json
git commit -m "Scaffold LogiQids Quest project"
```

---

### Task 2: `lib/utils.js` — shared pure helpers

**Files:**
- Create: `src/lib/utils.js`
- Test: `src/lib/utils.test.js`

**Interfaces:**
- Produces: `shuffle(arr)`, `randomInt(min, max)` (inclusive), `pick(arr)`, `pickN(arr, n)` — used by every content generator task from here on.

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/utils.test.js`
Expected: FAIL — `utils.js` does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
export function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

export function pickN(arr, n) {
  return shuffle(arr).slice(0, n);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/utils.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.js src/lib/utils.test.js
git commit -m "Add shared random/shuffle utilities"
```

---

### Task 3: `lib/storage.js` — localStorage persistence

**Files:**
- Create: `src/lib/storage.js`
- Test: `src/lib/storage.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `KEYS` object, `loadJSON(key, fallback)`, `saveJSON(key, value)`, `loadProgress()`, `recordTopicAttempt(topicId, correct)` → returns updated `{attempts, correct}` record and persists it under `KEYS.PROGRESS`, `loadLeaderboard()`, `addLeaderboardEntry(entry)` → keeps top 5 by `pct` desc then `raw` desc, persists and returns the new list. Used by `lib/scoring.js` (reads progress records) and every screen component.

- [ ] **Step 1: Write the failing test**

```js
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

  it("recordTopicAttempt accumulates attempts/correct", async () => {
    const { recordTopicAttempt, loadProgress } = await import("./storage.js");
    recordTopicAttempt("seriesCompletion", true);
    recordTopicAttempt("seriesCompletion", false);
    const rec = recordTopicAttempt("seriesCompletion", true);
    expect(rec).toEqual({ attempts: 3, correct: 2 });
    expect(loadProgress().seriesCompletion).toEqual({ attempts: 3, correct: 2 });
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/storage.test.js`
Expected: FAIL — `storage.js` does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
export const KEYS = {
  AVATAR: "lq-avatar",
  NAME: "lq-player-name",
  PROGRESS: "lq-progress",
  LEADERBOARD: "lq-leaderboard",
  BEST_STREAK: "lq-best-streak",
};

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadProgress() {
  return loadJSON(KEYS.PROGRESS, {});
}

export function recordTopicAttempt(topicId, correct) {
  const progress = loadProgress();
  const rec = progress[topicId] || { attempts: 0, correct: 0 };
  rec.attempts += 1;
  if (correct) rec.correct += 1;
  progress[topicId] = rec;
  saveJSON(KEYS.PROGRESS, progress);
  return rec;
}

export function loadLeaderboard() {
  return loadJSON(KEYS.LEADERBOARD, []);
}

export function addLeaderboardEntry(entry) {
  const list = loadLeaderboard();
  list.push(entry);
  list.sort((a, b) => b.pct - a.pct || b.raw - a.raw);
  const top = list.slice(0, 5);
  saveJSON(KEYS.LEADERBOARD, top);
  return top;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/storage.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.js src/lib/storage.test.js
git commit -m "Add localStorage persistence for progress and leaderboard"
```

---

### Task 4: `lib/scoring.js` — mastery and mock-test scoring

**Files:**
- Create: `src/lib/scoring.js`
- Test: `src/lib/scoring.test.js`

**Interfaces:**
- Consumes: nothing directly (takes plain records/arrays as arguments).
- Produces: `isTopicMastered({attempts, correct})` → boolean, `scoreMockTest(answers)` where `answers: [{isAnswered, isCorrect, isLQChamp}]` → `{raw, maxRaw, pct, correctCount, wrongCount, unansweredCount}`. Used by `TopicView` (mastery badges), `MockTest` (results screen), `SkillMap`/`ProgressScreen` (mastery display).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { isTopicMastered, scoreMockTest } from "./scoring.js";

describe("isTopicMastered", () => {
  it("requires at least 3 correct and 75% accuracy", () => {
    expect(isTopicMastered({ attempts: 4, correct: 3 })).toBe(true);
    expect(isTopicMastered({ attempts: 4, correct: 2 })).toBe(false);
    expect(isTopicMastered({ attempts: 2, correct: 2 })).toBe(false); // fewer than 3 correct
    expect(isTopicMastered(undefined)).toBe(false);
  });
});

describe("scoreMockTest", () => {
  it("applies +4/-1 for normal and +8/-2 for LQ Champ, 0 for unanswered", () => {
    const answers = [
      { isAnswered: true, isCorrect: true, isLQChamp: false },   // +4
      { isAnswered: true, isCorrect: false, isLQChamp: false },  // -1
      { isAnswered: true, isCorrect: true, isLQChamp: true },    // +8
      { isAnswered: true, isCorrect: false, isLQChamp: true },   // -2
      { isAnswered: false, isCorrect: false, isLQChamp: false }, // 0
    ];
    const result = scoreMockTest(answers);
    expect(result.raw).toBe(4 - 1 + 8 - 2 + 0);
    expect(result.maxRaw).toBe(4 + 4 + 8 + 8 + 4);
    expect(result.correctCount).toBe(2);
    expect(result.wrongCount).toBe(2);
    expect(result.unansweredCount).toBe(1);
    expect(result.pct).toBe(Math.round((9 / 28) * 100));
  });

  it("clamps pct at 0 when raw score is negative", () => {
    const answers = [{ isAnswered: true, isCorrect: false, isLQChamp: true }];
    const result = scoreMockTest(answers);
    expect(result.raw).toBe(-2);
    expect(result.pct).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/scoring.test.js`
Expected: FAIL — `scoring.js` does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
export function isTopicMastered(record) {
  if (!record) return false;
  const { attempts, correct } = record;
  if (!attempts) return false;
  return correct >= 3 && correct / attempts >= 0.75;
}

export function scoreMockTest(answers) {
  let raw = 0, maxRaw = 0, correctCount = 0, wrongCount = 0, unansweredCount = 0;
  for (const a of answers) {
    const base = a.isLQChamp ? 8 : 4;
    maxRaw += base;
    if (!a.isAnswered) { unansweredCount++; continue; }
    if (a.isCorrect) { raw += base; correctCount++; }
    else { raw -= a.isLQChamp ? 2 : 1; wrongCount++; }
  }
  const pct = maxRaw ? Math.max(0, Math.round((raw / maxRaw) * 100)) : 0;
  return { raw, maxRaw, pct, correctCount, wrongCount, unansweredCount };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/scoring.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.js src/lib/scoring.test.js
git commit -m "Add mastery and mock-test scoring logic"
```

---

### Task 5: `lib/speech.js` — spoken explanations via Web Speech API

**Files:**
- Create: `src/lib/speech.js`
- Test: `src/lib/speech.test.js`

**Interfaces:**
- Produces: `pickVoice(voices)` (pure, tested), `speak(text, opts)` and `stopSpeech()` (browser-only side effects, guarded when `speechSynthesis` is unavailable — not unit tested here, verified later by the Playwright smoke task). Used by `QuestionCard`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { pickVoice } from "./speech.js";

describe("pickVoice", () => {
  it("prefers an English voice with a feminine/child-friendly name", () => {
    const voices = [
      { name: "Google US English", lang: "en-US" },
      { name: "Microsoft Zira", lang: "en-US" },
      { name: "Google Deutsch", lang: "de-DE" },
    ];
    expect(pickVoice(voices).name).toBe("Microsoft Zira");
  });

  it("falls back to any English voice when no preferred name matches", () => {
    const voices = [
      { name: "Google Deutsch", lang: "de-DE" },
      { name: "Google US English", lang: "en-US" },
    ];
    expect(pickVoice(voices).name).toBe("Google US English");
  });

  it("falls back to the first voice when nothing is English", () => {
    const voices = [{ name: "Google Deutsch", lang: "de-DE" }];
    expect(pickVoice(voices).name).toBe("Google Deutsch");
  });

  it("returns null for an empty voice list", () => {
    expect(pickVoice([])).toBe(null);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/speech.test.js`
Expected: FAIL — `speech.js` does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
const PREFERRED_NAME_PATTERN = /female|woman|girl|samantha|victoria|zira|susan/i;

export function pickVoice(voices) {
  if (!voices || voices.length === 0) return null;
  const english = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("en"));
  const preferred = english.find(v => PREFERRED_NAME_PATTERN.test(v.name));
  if (preferred) return preferred;
  if (english.length > 0) return english[0];
  return voices[0];
}

export function speak(text, { rate = 0.95 } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  const voice = pickVoice(window.speechSynthesis.getVoices());
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/speech.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/speech.js src/lib/speech.test.js
git commit -m "Add Web Speech API wrapper for spoken explanations"
```

---

### Task 6: `lib/figures.js` — formula-verified geometry for Visual questions

**Files:**
- Create: `src/lib/figures.js`
- Test: `src/lib/figures.test.js`

**Interfaces:**
- Produces: `countGridRectangles(rows, cols)`, `countFanTriangles(n)`, `buildGridFigure(rows, cols, opts)` → `ShapeSpec`, `buildFanFigure(n, opts)` → `ShapeSpec`, `buildDiffPair(baseShapes, changes)` → `{ before: shape[], after: shape[] }`. These are pure and formula/construction-verified so correctness never depends on eyeballing a figure. Used by `content/visual/countTheShapes.js` and `content/visual/spotTheDifference.js`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { countGridRectangles, countFanTriangles, buildGridFigure, buildFanFigure, buildDiffPair } from "./figures.js";

describe("countGridRectangles", () => {
  it("matches the known combinatorial formula C(rows+1,2)*C(cols+1,2)", () => {
    expect(countGridRectangles(1, 1)).toBe(1);
    expect(countGridRectangles(2, 2)).toBe(9);
    expect(countGridRectangles(1, 2)).toBe(3);
    expect(countGridRectangles(1, 3)).toBe(6);
  });
});

describe("countFanTriangles", () => {
  it("matches n*(n+1)/2 for a fan of n base segments", () => {
    expect(countFanTriangles(2)).toBe(3);
    expect(countFanTriangles(3)).toBe(6);
  });
});

describe("buildGridFigure", () => {
  it("draws (rows+1) horizontal and (cols+1) vertical lines", () => {
    const fig = buildGridFigure(2, 2, { width: 200, height: 200 });
    const lines = fig.shapes.filter(s => s.type === "line");
    const horizontals = lines.filter(l => l.y1 === l.y2);
    const verticals = lines.filter(l => l.x1 === l.x2);
    expect(horizontals.length).toBe(3);
    expect(verticals.length).toBe(3);
  });
});

describe("buildFanFigure", () => {
  it("draws 2 outer sides + (n-1) internal cevians + 1 base line = n+2 lines total", () => {
    const fig = buildFanFigure(3, { width: 200, height: 200 });
    const lines = fig.shapes.filter(s => s.type === "line");
    expect(lines.length).toBe(5); // 2 outer sides + 2 internal cevians + 1 base line, for n=3
  });
});

describe("buildDiffPair", () => {
  it("applies exactly the given changes and reports that count", () => {
    const base = [
      { type: "circle", cx: 10, cy: 10, r: 5, fill: "red" },
      { type: "rect", x: 20, y: 20, w: 10, h: 10, fill: "blue" },
    ];
    const { before, after } = buildDiffPair(base, [
      { index: 0, patch: { fill: "green" } },
      { index: 1, patch: { x: 30 } },
    ]);
    expect(before).toEqual(base);
    expect(after[0].fill).toBe("green");
    expect(after[1].x).toBe(30);
    expect(after[0].cx).toBe(10); // untouched fields preserved
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/figures.test.js`
Expected: FAIL — `figures.js` does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
function nC2(n) {
  return (n * (n - 1)) / 2;
}

export function countGridRectangles(rows, cols) {
  return nC2(rows + 1) * nC2(cols + 1);
}

export function countFanTriangles(n) {
  return (n * (n + 1)) / 2;
}

export function buildGridFigure(rows, cols, { width = 220, height = 220, stroke = "#25233a" } = {}) {
  const shapes = [];
  for (let r = 0; r <= rows; r++) {
    const y = (height / rows) * r;
    shapes.push({ type: "line", x1: 0, y1: y, x2: width, y2: y, stroke, strokeWidth: 2 });
  }
  for (let c = 0; c <= cols; c++) {
    const x = (width / cols) * c;
    shapes.push({ type: "line", x1: x, y1: 0, x2: x, y2: height, stroke, strokeWidth: 2 });
  }
  return { width, height, shapes };
}

export function buildFanFigure(n, { width = 220, height = 220, stroke = "#25233a" } = {}) {
  const apex = { x: width / 2, y: 10 };
  const baseY = height - 10;
  const shapes = [];
  const basePoints = [];
  for (let i = 0; i <= n; i++) {
    basePoints.push({ x: 10 + ((width - 20) / n) * i, y: baseY });
  }
  // outer two sides
  shapes.push({ type: "line", x1: apex.x, y1: apex.y, x2: basePoints[0].x, y2: basePoints[0].y, stroke, strokeWidth: 2 });
  shapes.push({ type: "line", x1: apex.x, y1: apex.y, x2: basePoints[n].x, y2: basePoints[n].y, stroke, strokeWidth: 2 });
  // internal cevians (n-1 of them) + the base line itself
  for (let i = 1; i < n; i++) {
    shapes.push({ type: "line", x1: apex.x, y1: apex.y, x2: basePoints[i].x, y2: basePoints[i].y, stroke, strokeWidth: 2 });
  }
  shapes.push({ type: "line", x1: basePoints[0].x, y1: baseY, x2: basePoints[n].x, y2: baseY, stroke, strokeWidth: 2 });
  return { width, height, shapes };
}

export function buildDiffPair(baseShapes, changes) {
  const before = baseShapes.map(s => ({ ...s }));
  const after = baseShapes.map(s => ({ ...s }));
  for (const change of changes) {
    if (change.remove !== undefined) {
      after[change.remove] = null;
    } else if (change.add) {
      after.push({ ...change.add });
    } else {
      after[change.index] = { ...after[change.index], ...change.patch };
    }
  }
  return { before, after: after.filter(Boolean) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/figures.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/figures.js src/lib/figures.test.js
git commit -m "Add formula-verified geometry helpers for Visual questions"
```

---

### Task 7: `content/categories.js` — the 5 official categories

**Files:**
- Create: `src/content/categories.js`
- Test: `src/content/categories.test.js`

**Interfaces:**
- Produces: `CATEGORIES` array of `{ id, name, icon, color }`. Consumed by `SkillMap`, `MixedPractice`, `ProgressScreen`, and every content module (which references `categoryId` by these exact ids: `analytical`, `verbal`, `visual`, `numerical`, `memory`).

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { CATEGORIES } from "./categories.js";

describe("CATEGORIES", () => {
  it("has exactly the 5 official categories with required fields", () => {
    expect(CATEGORIES.length).toBe(5);
    const ids = CATEGORIES.map(c => c.id).sort();
    expect(ids).toEqual(["analytical", "memory", "numerical", "verbal", "visual"].sort());
    CATEGORIES.forEach(c => {
      expect(typeof c.name).toBe("string");
      expect(typeof c.icon).toBe("string");
      expect(typeof c.color).toBe("string");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/categories.test.js`
Expected: FAIL — `categories.js` does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
export const CATEGORIES = [
  { id: "analytical", name: "Analytical Thinking", icon: "🧩", color: "#6b5bd6" },
  { id: "verbal", name: "Verbal", icon: "📖", color: "#e46b30" },
  { id: "visual", name: "Visual", icon: "👁️", color: "#20a66a" },
  { id: "numerical", name: "Numerical Ability", icon: "🔢", color: "#3576e0" },
  { id: "memory", name: "Memory & Concentration", icon: "🧠", color: "#d1487a" },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/categories.test.js`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/content/categories.js src/content/categories.test.js
git commit -m "Add the 5 official LogiQids category definitions"
```

---

### Task 8: `content/analytical/seriesCompletion.js`

**Files:**
- Create: `src/content/analytical/seriesCompletion.js`
- Test: `src/content/analytical/seriesCompletion.test.js`

**Interfaces:**
- Consumes: `shuffle`, `randomInt` from `../../lib/utils.js`.
- Produces: `generateSeriesQuestion(difficulty, index)` → `Question`; `seriesCompletionTopic` → `Topic` (id `seriesCompletion`, categoryId `analytical`). Consumed by `content/index.js`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateSeriesQuestion, seriesCompletionTopic } from "./seriesCompletion.js";

function assertValidQuestion(q) {
  expect(q.options.length).toBe(4);
  expect(new Set(q.options.map(o => o.id))).toEqual(new Set(["A","B","C","D"]));
  expect(q.options.map(o => o.id)).toContain(q.answerId);
  expect(typeof q.explanation.howTo).toBe("string");
  expect(typeof q.explanation.correct).toBe("string");
  const values = q.options.map(o => o.label);
  expect(new Set(values).size).toBe(4); // no duplicate option text
}

describe("generateSeriesQuestion", () => {
  it("produces a valid, self-consistent arithmetic-series question", () => {
    for (let i = 0; i < 30; i++) {
      const q = generateSeriesQuestion("medium", i);
      assertValidQuestion(q);
      const answerLabel = q.options.find(o => o.id === q.answerId).label;
      const nums = q.prompt.match(/-?\d+/g).map(Number);
      const step = nums[1] - nums[0];
      expect(Number(answerLabel)).toBe(nums[nums.length - 1] + step);
    }
  });

  it("harder difficulty uses a bigger step on average", () => {
    const steps = (difficulty) => {
      let total = 0;
      for (let i = 0; i < 20; i++) {
        const q = generateSeriesQuestion(difficulty, i);
        const nums = q.prompt.match(/-?\d+/g).map(Number);
        total += nums[1] - nums[0];
      }
      return total / 20;
    };
    expect(steps("hard")).toBeGreaterThan(steps("easy"));
  });
});

describe("seriesCompletionTopic", () => {
  it("exposes teach steps and correctly-sized generators", () => {
    expect(seriesCompletionTopic.id).toBe("seriesCompletion");
    expect(seriesCompletionTopic.categoryId).toBe("analytical");
    expect(seriesCompletionTopic.teach.steps.length).toBeGreaterThan(0);
    expect(seriesCompletionTopic.getTryTogether().length).toBe(2);
    expect(seriesCompletionTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/analytical/seriesCompletion.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle, randomInt } from "../../lib/utils.js";

function stepFor(difficulty) {
  if (difficulty === "hard") return randomInt(6, 9);
  if (difficulty === "easy") return randomInt(2, 3);
  return randomInt(3, 5);
}

export function generateSeriesQuestion(difficulty = "medium", index = 0) {
  const step = stepFor(difficulty);
  const start = randomInt(1, 10);
  const terms = [start, start + step, start + step * 2, start + step * 3];
  const answer = start + step * 4;

  const candidates = shuffle([
    { value: answer, isAnswer: true },
    { value: answer + step, reason: "adds one extra step instead of stopping at the pattern" },
    { value: answer - step, reason: "stops one step too early — that's the term before the answer" },
    { value: terms[0], reason: "repeats the very first number instead of continuing the pattern" },
  ]);

  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: String(c.value) }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const howTo = `The pattern adds ${step} each time. Starting at ${terms[0]} and adding ${step} four times gets you to ${answer}.`;

  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) {
      mistakes[letters[i]] = `You picked ${c.value}, which ${c.reason}. ${howTo}`;
    }
  });

  return {
    id: `series-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "analytical",
    topicId: "seriesCompletion",
    difficulty,
    prompt: `Find the next number in the series: ${terms.join(", ")}, ?`,
    figure: null,
    options,
    answerId,
    explanation: {
      correct: `Yes! ${howTo}`,
      howTo,
      mistakes,
    },
  };
}

export const seriesCompletionTopic = {
  id: "seriesCompletion",
  categoryId: "analytical",
  title: "Series Completion",
  teach: {
    steps: [
      { caption: "A number series is a list of numbers that follows a hidden rule." },
      { caption: "Look at 2, 4, 6, 8 — each number is 2 more than the one before it." },
      { caption: "To find the next number, figure out the rule, then apply it one more time." },
      { caption: "So after 2, 4, 6, 8 comes 10 — because we keep adding 2!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateSeriesQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateSeriesQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/analytical/seriesCompletion.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/analytical/seriesCompletion.js src/content/analytical/seriesCompletion.test.js
git commit -m "Add Series Completion topic content"
```

---

### Task 9: `content/analytical/oddOneOut.js`

**Files:**
- Create: `src/content/analytical/oddOneOut.js`
- Test: `src/content/analytical/oddOneOut.test.js`

**Interfaces:**
- Consumes: `shuffle`, `randomInt`, `pick` from `../../lib/utils.js`.
- Produces: `generateOddOneOutQuestion(difficulty, index)`, `oddOneOutTopic`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateOddOneOutQuestion, oddOneOutTopic } from "./oddOneOut.js";

describe("generateOddOneOutQuestion", () => {
  it("always produces 4 distinct options with a valid answer and howTo text", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateOddOneOutQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
      expect(typeof q.explanation.howTo).toBe("string");
    }
  });
});

describe("oddOneOutTopic", () => {
  it("has the right shape", () => {
    expect(oddOneOutTopic.categoryId).toBe("analytical");
    expect(oddOneOutTopic.getTryTogether().length).toBe(2);
    expect(oddOneOutTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/analytical/oddOneOut.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle, randomInt, pick } from "../../lib/utils.js";

const WORD_CATEGORIES = {
  fruit: ["apple", "mango", "banana", "orange", "grape"],
  vegetable: ["carrot", "potato", "onion", "spinach", "pea"],
  animal: ["tiger", "elephant", "zebra", "monkey", "lion"],
  vehicle: ["car", "bus", "train", "bicycle", "truck"],
};

function wordVariant() {
  const keys = Object.keys(WORD_CATEGORIES);
  const [catA, catB] = shuffle(keys).slice(0, 2);
  const words = [...shuffle(WORD_CATEGORIES[catA]).slice(0, 3), pick(WORD_CATEGORIES[catB])];
  const shuffled = shuffle(words.map((w, i) => ({ label: w, isOdd: i === 3 })));
  const howTo = `${words[0]}, ${words[1]}, and ${words[2]} are all a kind of ${catA}. The odd one out is ${words[3]}, which is a ${catB} instead.`;
  return { options: shuffled, howTo, prompt: "Find the ODD one out:" };
}

function numberVariant(difficulty) {
  const m = difficulty === "hard" ? randomInt(6, 9) : randomInt(2, 5);
  const multiples = shuffle(Array.from({ length: 20 }, (_, i) => (i + 1) * m)).slice(0, 3);
  let nonMultiple = randomInt(2, 9 * m);
  while (nonMultiple % m === 0) nonMultiple = randomInt(2, 9 * m);
  const values = [...multiples, nonMultiple];
  const shuffled = shuffle(values.map((v, i) => ({ label: String(v), isOdd: i === 3 })));
  const howTo = `${multiples.join(", ")} are all multiples of ${m}. ${nonMultiple} is the odd one out because it isn't.`;
  return { options: shuffled, howTo, prompt: "Find the ODD one out:" };
}

export function generateOddOneOutQuestion(difficulty = "medium", index = 0) {
  const built = Math.random() < 0.5 ? wordVariant() : numberVariant(difficulty);
  const letters = ["A", "B", "C", "D"];
  const options = built.options.map((o, i) => ({ id: letters[i], label: o.label }));
  const answerId = letters[built.options.findIndex(o => o.isOdd)];
  const mistakes = {};
  built.options.forEach((o, i) => {
    if (!o.isOdd) mistakes[letters[i]] = `${o.label} fits the group. ${built.howTo}`;
  });
  return {
    id: `odd-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "analytical",
    topicId: "oddOneOut",
    difficulty,
    prompt: built.prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${built.howTo}`, howTo: built.howTo, mistakes },
  };
}

export const oddOneOutTopic = {
  id: "oddOneOut",
  categoryId: "analytical",
  title: "Odd One Out",
  teach: {
    steps: [
      { caption: "Three of the four things in a group share something in common." },
      { caption: "One thing is different — that's the odd one out!" },
      { caption: "Ask yourself: what do most of these have in common? Which one breaks that rule?" },
      { caption: "Example: apple, mango, banana are fruits. Carrot is a vegetable — the odd one out!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateOddOneOutQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateOddOneOutQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/analytical/oddOneOut.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/analytical/oddOneOut.js src/content/analytical/oddOneOut.test.js
git commit -m "Add Odd One Out topic content"
```

---

### Task 10: `content/analytical/analogies.js`

**Files:**
- Create: `src/content/analytical/analogies.js`
- Test: `src/content/analytical/analogies.test.js`

**Interfaces:**
- Consumes: `shuffle` from `../../lib/utils.js`.
- Produces: `generateAnalogyQuestion(difficulty, index)`, `analogiesTopic`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateAnalogyQuestion, analogiesTopic } from "./analogies.js";

describe("generateAnalogyQuestion", () => {
  it("produces a valid analogy question every time", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateAnalogyQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
      expect(q.prompt).toMatch(/is to/);
    }
  });
});

describe("analogiesTopic", () => {
  it("has the right shape", () => {
    expect(analogiesTopic.categoryId).toBe("analytical");
    expect(analogiesTopic.getTryTogether().length).toBe(2);
    expect(analogiesTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/analytical/analogies.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle } from "../../lib/utils.js";

const RELATION_SETS = {
  opposites: [["big","small"],["hot","cold"],["day","night"],["up","down"],["fast","slow"],["happy","sad"],["open","shut"],["light","dark"]],
  babyAnimals: [["cat","kitten"],["dog","puppy"],["cow","calf"],["horse","foal"],["sheep","lamb"],["hen","chick"]],
};

export function generateAnalogyQuestion(difficulty = "medium", index = 0) {
  const relationName = Math.random() < 0.5 ? "opposites" : "babyAnimals";
  const pairs = RELATION_SETS[relationName];
  const shuffledPairs = shuffle(pairs);
  const [a1, b1] = shuffledPairs[0];
  const [a2, b2] = shuffledPairs[1];
  const otherBs = shuffledPairs.slice(2, 4).map(p => p[1]);

  const relationLabel = relationName === "opposites" ? "the opposite of" : "the baby of";
  const howTo = `${a1} is to ${b1} because ${b1} is ${relationLabel} ${a1}. Using the same rule, ${a2} is to ${b2}.`;

  const candidates = shuffle([
    { value: b2, isAnswer: true },
    { value: a2, reason: `repeats ${a2} itself instead of giving its pair` },
    { value: otherBs[0], reason: `belongs to a different pair (${relationLabel} something else)` },
    { value: otherBs[1], reason: `also belongs to a different pair (${relationLabel} something else)` },
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.value }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.value} ${c.reason}. ${howTo}`;
  });

  return {
    id: `analogy-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "analytical",
    topicId: "analogies",
    difficulty,
    prompt: `${a1} is to ${b1} as ${a2} is to ?`,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const analogiesTopic = {
  id: "analogies",
  categoryId: "analytical",
  title: "Analogies",
  teach: {
    steps: [
      { caption: "An analogy compares two pairs of words that share the same relationship." },
      { caption: "\"Big is to small\" — that's an opposites relationship." },
      { caption: "Find the relationship in the first pair, then use the SAME relationship for the second pair." },
      { caption: "\"Hot is to cold as day is to ?\" — the answer is night, because it's the opposite of day." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateAnalogyQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateAnalogyQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/analytical/analogies.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/analytical/analogies.js src/content/analytical/analogies.test.js
git commit -m "Add Analogies topic content"
```

---

### Task 11: `content/verbal/compoundWords.js`

**Files:**
- Create: `src/content/verbal/compoundWords.js`
- Test: `src/content/verbal/compoundWords.test.js`

**Interfaces:**
- Consumes: `shuffle`, `pick` from `../../lib/utils.js`.
- Produces: `generateCompoundWordQuestion(difficulty, index)`, `compoundWordsTopic`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateCompoundWordQuestion, compoundWordsTopic } from "./compoundWords.js";

describe("generateCompoundWordQuestion", () => {
  it("produces 4 distinct head+tail pairs where only one is a real curated word", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateCompoundWordQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
    }
  });
});

describe("compoundWordsTopic", () => {
  it("has the right shape", () => {
    expect(compoundWordsTopic.categoryId).toBe("verbal");
    expect(compoundWordsTopic.getTryTogether().length).toBe(2);
    expect(compoundWordsTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/verbal/compoundWords.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle } from "../../lib/utils.js";

const COMPOUND_WORDS = [
  ["sun", "flower"], ["foot", "ball"], ["rain", "bow"], ["note", "book"],
  ["butter", "fly"], ["tooth", "brush"], ["bed", "room"], ["sand", "castle"],
  ["star", "fish"], ["air", "port"], ["back", "pack"], ["basket", "ball"],
];

const VALID_PAIR_SET = new Set(COMPOUND_WORDS.map(([h, t]) => `${h}+${t}`));

export function generateCompoundWordQuestion(difficulty = "medium", index = 0) {
  const shuffledEntries = shuffle(COMPOUND_WORDS);
  const [correctHead, correctTail] = shuffledEntries[0];

  const wrongPairs = [];
  for (let i = 1; i < shuffledEntries.length && wrongPairs.length < 3; i++) {
    const head = shuffledEntries[i][0];
    for (let j = 1; j < shuffledEntries.length && wrongPairs.length < 3; j++) {
      if (i === j) continue;
      const tail = shuffledEntries[j][1];
      const key = `${head}+${tail}`;
      if (!VALID_PAIR_SET.has(key) && !wrongPairs.some(p => p.key === key)) {
        wrongPairs.push({ head, tail, key });
      }
    }
  }

  const howTo = `${correctHead.toUpperCase()} + ${correctTail.toUpperCase()} makes the real word "${correctHead}${correctTail}." The other pairs don't make a real word when joined.`;
  const candidates = shuffle([
    { label: `${correctHead.toUpperCase()} + ${correctTail.toUpperCase()}`, isAnswer: true },
    ...wrongPairs.map(p => ({ label: `${p.head.toUpperCase()} + ${p.tail.toUpperCase()}`, isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} isn't a real word when joined together. ${howTo}`;
  });

  return {
    id: `compound-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "verbal",
    topicId: "compoundWords",
    difficulty,
    prompt: "Which pair of words can be joined to make one meaningful word?",
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const compoundWordsTopic = {
  id: "compoundWords",
  categoryId: "verbal",
  title: "Compound Word Matching",
  teach: {
    steps: [
      { caption: "A compound word is made by joining two smaller words together." },
      { caption: "SUN + FLOWER = SUNFLOWER — a real word!" },
      { caption: "But FOOT + FLOWER isn't a word — it doesn't mean anything." },
      { caption: "Try joining each pair out loud — does it sound like a real word you know?" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateCompoundWordQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateCompoundWordQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/verbal/compoundWords.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/verbal/compoundWords.js src/content/verbal/compoundWords.test.js
git commit -m "Add Compound Word Matching topic content"
```

---

### Task 12: `content/verbal/whichLetterAmI.js`

**Files:**
- Create: `src/content/verbal/whichLetterAmI.js`
- Test: `src/content/verbal/whichLetterAmI.test.js`

**Interfaces:**
- Consumes: `shuffle`, `pick` from `../../lib/utils.js`.
- Produces: `generateWhichLetterQuestion(difficulty, index)`, `whichLetterAmITopic`.
- Correctness note: the "once in word1, twice in word2" claim is **computed at runtime by counting actual letter occurrences**, never hand-claimed, so it cannot be wrong.

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/verbal/whichLetterAmI.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/verbal/whichLetterAmI.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/verbal/whichLetterAmI.js src/content/verbal/whichLetterAmI.test.js
git commit -m "Add Which Letter Am I topic content"
```

---

### Task 13: `content/verbal/spellingDetective.js`

**Files:**
- Create: `src/content/verbal/spellingDetective.js`
- Test: `src/content/verbal/spellingDetective.test.js`

**Interfaces:**
- Consumes: `shuffle` from `../../lib/utils.js`.
- Produces: `generateSpellingQuestion(difficulty, index)`, `spellingDetectiveTopic`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateSpellingQuestion, spellingDetectiveTopic } from "./spellingDetective.js";

describe("generateSpellingQuestion", () => {
  it("exactly one option is the misspelled word", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateSpellingQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
    }
  });
});

describe("spellingDetectiveTopic", () => {
  it("has the right shape", () => {
    expect(spellingDetectiveTopic.categoryId).toBe("verbal");
    expect(spellingDetectiveTopic.getTryTogether().length).toBe(2);
    expect(spellingDetectiveTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/verbal/spellingDetective.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/verbal/spellingDetective.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/verbal/spellingDetective.js src/content/verbal/spellingDetective.test.js
git commit -m "Add Spelling Detective topic content"
```

---

### Task 14: `content/numerical/balanceEquation.js`

**Files:**
- Create: `src/content/numerical/balanceEquation.js`
- Test: `src/content/numerical/balanceEquation.test.js`

**Interfaces:**
- Consumes: `shuffle`, `randomInt` from `../../lib/utils.js`.
- Produces: `generateBalanceQuestion(difficulty, index)`, `balanceEquationTopic`.

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/numerical/balanceEquation.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle, randomInt } from "../../lib/utils.js";

const OPS = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "×": (a, b) => a * b,
  "÷": (a, b) => a / b,
};

function buildOperands(op) {
  if (op === "+") { const a = randomInt(1,9), b = randomInt(1,9); return [a,b]; }
  if (op === "-") { const a = randomInt(5,9), b = randomInt(1,a); return [a,b]; }
  if (op === "×") { const a = randomInt(2,9), b = randomInt(2,9); return [a,b]; }
  const b = randomInt(2,5), q = randomInt(2,9);
  return [b*q, b];
}

export function generateBalanceQuestion(difficulty = "medium", index = 0) {
  const opNames = Object.keys(OPS);
  const correctOp = opNames[randomInt(0, opNames.length - 1)];
  const [a, b] = buildOperands(correctOp);
  const result = OPS[correctOp](a, b);
  const howTo = `Try each sign: only ${a} ${correctOp} ${b} = ${result} is true, so ${correctOp} is the answer.`;

  const letters = ["A", "B", "C", "D"];
  const shuffledOps = shuffle(opNames);
  const options = shuffledOps.map((op, i) => ({ id: letters[i], label: op }));
  const answerId = letters[shuffledOps.indexOf(correctOp)];
  const mistakes = {};
  shuffledOps.forEach((op, i) => {
    if (op === correctOp) return;
    const wrongResult = OPS[op](a, b);
    mistakes[letters[i]] = `If you use ${op}, ${a} ${op} ${b} = ${wrongResult}, not ${result}. ${howTo}`;
  });

  return {
    id: `balance-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "numerical",
    topicId: "balanceEquation",
    difficulty,
    prompt: `Which sign replaces △ so that ${a} △ ${b} = ${result}?`,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const balanceEquationTopic = {
  id: "balanceEquation",
  categoryId: "numerical",
  title: "Balance the Equation",
  teach: {
    steps: [
      { caption: "A missing sign puzzle asks: which of +, -, ×, ÷ makes the equation true?" },
      { caption: "Try each sign one at a time and check if both sides match." },
      { caption: "Example: 6 △ 2 = 8. Try +: 6+2=8. That works!" },
      { caption: "So △ stands for + in that equation." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateBalanceQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateBalanceQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/numerical/balanceEquation.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/numerical/balanceEquation.js src/content/numerical/balanceEquation.test.js
git commit -m "Add Balance the Equation topic content"
```

---

### Task 15: `content/numerical/greatestSmallest.js`

**Files:**
- Create: `src/content/numerical/greatestSmallest.js`
- Test: `src/content/numerical/greatestSmallest.test.js`

**Interfaces:**
- Consumes: `shuffle`, `randomInt` from `../../lib/utils.js`.
- Produces: `generateGreatestSmallestQuestion(difficulty, index)`, `greatestSmallestTopic`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateGreatestSmallestQuestion, greatestSmallestTopic } from "./greatestSmallest.js";

describe("generateGreatestSmallestQuestion", () => {
  it("the answer really is the greatest/smallest arrangement of the given digits", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateGreatestSmallestQuestion("medium", i);
      const digits = q.prompt.match(/\d/g);
      const sortedDesc = [...digits].sort((a,b) => b - a).join("");
      const sortedAsc = [...digits].sort((a,b) => a - b).join("");
      const answerLabel = q.options.find(o => o.id === q.answerId).label;
      const expected = q.prompt.includes("greatest") ? sortedDesc : sortedAsc;
      expect(answerLabel).toBe(expected);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
    }
  });
});

describe("greatestSmallestTopic", () => {
  it("has the right shape", () => {
    expect(greatestSmallestTopic.categoryId).toBe("numerical");
    expect(greatestSmallestTopic.getTryTogether().length).toBe(2);
    expect(greatestSmallestTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/numerical/greatestSmallest.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle, randomInt } from "../../lib/utils.js";

function randomDistinctDigits(count) {
  const digits = new Set();
  while (digits.size < count) digits.add(String(randomInt(1, 9)));
  return [...digits];
}

export function generateGreatestSmallestQuestion(difficulty = "medium", index = 0) {
  const count = difficulty === "hard" ? 4 : 3;
  const digits = randomDistinctDigits(count);
  const askGreatest = Math.random() < 0.5;
  const correct = [...digits].sort((a, b) => (askGreatest ? b - a : a - b)).join("");
  const opposite = [...digits].sort((a, b) => (askGreatest ? a - b : b - a)).join("");

  const swapped = correct.split("");
  [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  const nearMiss = swapped.join("");

  const distractorSet = new Set([opposite, nearMiss]);
  let randomShuffleStr = shuffle(digits).join("");
  let guard = 0;
  while ((distractorSet.has(randomShuffleStr) || randomShuffleStr === correct) && guard < 20) {
    randomShuffleStr = shuffle(digits).join("");
    guard++;
  }
  distractorSet.add(randomShuffleStr);

  const howTo = `To make the ${askGreatest ? "greatest" : "smallest"} number, arrange the digits from ${askGreatest ? "biggest to smallest" : "smallest to biggest"}: ${digits.join(", ")} → ${correct}.`;
  const candidates = shuffle([
    { label: correct, isAnswer: true },
    { label: opposite, reason: `arranges the digits ${askGreatest ? "smallest to biggest" : "biggest to smallest"} instead — the opposite order` },
    { label: nearMiss, reason: "swaps two digits out of order" },
    { label: randomShuffleStr, reason: "isn't arranged in order at all" },
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} ${c.reason}. ${howTo}`;
  });

  return {
    id: `greatest-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "numerical",
    topicId: "greatestSmallest",
    difficulty,
    prompt: `What is the ${askGreatest ? "greatest" : "smallest"} number you can make using all these digits? ${digits.join(" ")}`,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const greatestSmallestTopic = {
  id: "greatestSmallest",
  categoryId: "numerical",
  title: "Greatest / Smallest Number",
  teach: {
    steps: [
      { caption: "You can rearrange a set of digits to make different numbers." },
      { caption: "For the GREATEST number, put the biggest digit first, then next biggest, and so on." },
      { caption: "For the SMALLEST number, do the opposite — smallest digit first." },
      { caption: "Digits 8, 3, 6 → greatest is 863, smallest is 368." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateGreatestSmallestQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateGreatestSmallestQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/numerical/greatestSmallest.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/numerical/greatestSmallest.js src/content/numerical/greatestSmallest.test.js
git commit -m "Add Greatest/Smallest Number topic content"
```

---

### Task 16: `content/numerical/wordProblems.js`

**Files:**
- Create: `src/content/numerical/wordProblems.js`
- Test: `src/content/numerical/wordProblems.test.js`

**Interfaces:**
- Consumes: `shuffle`, `randomInt`, `pick` from `../../lib/utils.js`.
- Produces: `generateWordProblemQuestion(difficulty, index)`, `wordProblemsTopic`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateWordProblemQuestion, wordProblemsTopic } from "./wordProblems.js";

describe("generateWordProblemQuestion", () => {
  it("always has 4 distinct positive-looking options with a valid answer", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateWordProblemQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
    }
  });
});

describe("wordProblemsTopic", () => {
  it("has the right shape", () => {
    expect(wordProblemsTopic.categoryId).toBe("numerical");
    expect(wordProblemsTopic.getTryTogether().length).toBe(2);
    expect(wordProblemsTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/numerical/wordProblems.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle, randomInt, pick } from "../../lib/utils.js";

const NAMES = ["Riya", "Aarav", "Meera", "Kabir", "Ishita", "Vihaan"];
const ITEMS = ["apples", "marbles", "pencils", "stickers", "balloons", "books"];

function buildScenario(difficulty) {
  const name = pick(NAMES);
  const item = pick(ITEMS);
  const kind = difficulty === "hard" ? "mul" : pick(["add", "sub", "mul"]);
  if (kind === "add") {
    const a = randomInt(3, 12), b = randomInt(2, 10);
    return { prompt: `${name} has ${a} ${item}. ${name} gets ${b} more ${item}. How many ${item} does ${name} have now?`, answer: a + b, wrong: [a - b, a * b, a + b + 1] };
  }
  if (kind === "sub") {
    const a = randomInt(8, 15), b = randomInt(1, a - 1);
    return { prompt: `${name} has ${a} ${item}. ${name} gives away ${b} ${item}. How many ${item} does ${name} have left?`, answer: a - b, wrong: [a + b, a * b, a - b - 1] };
  }
  const a = randomInt(2, 6), b = randomInt(2, 6);
  return { prompt: `${name} has ${a} bags with ${b} ${item} in each bag. How many ${item} are there in total?`, answer: a * b, wrong: [a + b, a - b, a * b + 1] };
}

export function generateWordProblemQuestion(difficulty = "medium", index = 0) {
  const scenario = buildScenario(difficulty);
  const candidatePool = [...new Set(scenario.wrong.filter(v => v > 0 && v !== scenario.answer))];
  while (candidatePool.length < 3) candidatePool.push(scenario.answer + candidatePool.length + 2);
  const wrongValues = candidatePool.slice(0, 3);

  const howTo = `Read carefully what's happening in the story, then do the matching operation. The answer is ${scenario.answer}.`;
  const candidates = shuffle([
    { label: String(scenario.answer), isAnswer: true },
    ...wrongValues.map(v => ({ label: String(v), isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} comes from mixing up the operation in the story. ${howTo}`;
  });

  return {
    id: `wordprob-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "numerical",
    topicId: "wordProblems",
    difficulty,
    prompt: scenario.prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const wordProblemsTopic = {
  id: "wordProblems",
  categoryId: "numerical",
  title: "Word Problems",
  teach: {
    steps: [
      { caption: "A word problem tells a small story with numbers hidden inside." },
      { caption: "Figure out what's happening: are things being added, taken away, or grouped?" },
      { caption: "\"Gets more\" or \"in total\" often means add or multiply. \"Gives away\" means subtract." },
      { caption: "Then just do that operation with the numbers in the story." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateWordProblemQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateWordProblemQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/numerical/wordProblems.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/numerical/wordProblems.js src/content/numerical/wordProblems.test.js
git commit -m "Add Word Problems topic content"
```

---

### Task 17: `content/memory/codedLanguage.js`

**Files:**
- Create: `src/content/memory/codedLanguage.js`
- Test: `src/content/memory/codedLanguage.test.js`

**Interfaces:**
- Consumes: `shuffle`, `pickN` from `../../lib/utils.js`.
- Produces: `generateCodedLanguageQuestion(difficulty, index)`, `codedLanguageTopic`.
- Uses fixed, hand-verified word groups (each group's target question maps to exactly one word) so the puzzle is never ambiguous; only the code-word assignment is randomized per play.

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/memory/codedLanguage.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle, pickN } from "../../lib/utils.js";

const CODE_POOL = ["zog", "mint", "pilo", "dax", "wren", "qubo", "farn", "clix", "trom", "yelp"];

const GROUPS = [
  { words: ["car", "window", "door", "lock", "key"], question: "what would you use to open a lock", target: "key" },
  { words: ["plate", "spoon", "cup", "table", "chair"], question: "what would you sit on", target: "chair" },
  { words: ["pen", "paper", "bag", "chair", "shoe"], question: "what would you carry your books in", target: "bag" },
];

export function generateCodedLanguageQuestion(difficulty = "medium", index = 0) {
  const group = GROUPS[index % GROUPS.length];
  const codes = pickN(CODE_POOL, group.words.length);
  const mapping = group.words.map((w, i) => ({ word: w, code: codes[i] }));
  const targetEntry = mapping.find(m => m.word === group.target);

  const statements = mapping.map(m => `${m.word} is called ${m.code}`).join(", ");
  const howTo = `Match "${group.target}" to its code: ${group.target} is called ${targetEntry.code}. That's the answer to "${group.question}".`;

  const decoys = shuffle(mapping.filter(m => m.word !== group.target)).slice(0, 3);
  const candidates = shuffle([
    { label: targetEntry.code, isAnswer: true },
    ...decoys.map(d => ({ label: d.code, word: d.word, isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} is the code for "${c.word}", not "${group.target}". ${howTo}`;
  });

  return {
    id: `coded-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "memory",
    topicId: "codedLanguage",
    difficulty,
    prompt: `If in a certain language, ${statements}, then ${group.question}?`,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const codedLanguageTopic = {
  id: "codedLanguage",
  categoryId: "memory",
  title: "Coded Language",
  teach: {
    steps: [
      { caption: "In this puzzle, every word is secretly renamed to a made-up code word." },
      { caption: "Read the list carefully and match each real word to its code word." },
      { caption: "Then answer the question using the CODE word for the real answer, not the real word itself!" },
      { caption: "If \"key is called dax,\" and the answer is key, then your answer is dax." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateCodedLanguageQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateCodedLanguageQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/memory/codedLanguage.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/memory/codedLanguage.js src/content/memory/codedLanguage.test.js
git commit -m "Add Coded Language topic content"
```

---

### Task 18: `content/memory/whosFastest.js`

**Files:**
- Create: `src/content/memory/whosFastest.js`
- Test: `src/content/memory/whosFastest.test.js`

**Interfaces:**
- Consumes: `shuffle` from `../../lib/utils.js`.
- Produces: `generateWhosFastestQuestion(difficulty, index)`, `whosFastestTopic`.
- Correctness note: the two comparison statements are derived **from a randomly generated ground-truth ranking**, so they always logically pin down the correct answer.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateWhosFastestQuestion, whosFastestTopic } from "./whosFastest.js";

describe("generateWhosFastestQuestion", () => {
  it("the two clue statements are logically consistent with the stated answer", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateWhosFastestQuestion("medium", i);
      const answerLabel = q.options.find(o => o.id === q.answerId).label;
      const namesInClues = [...q.prompt.matchAll(/([A-Z][a-z]+) runs faster than ([A-Z][a-z]+)/g)]
        .flatMap(m => [m[1], m[2]]);
      expect(namesInClues).toContain(answerLabel);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
    }
  });
});

describe("whosFastestTopic", () => {
  it("has the right shape", () => {
    expect(whosFastestTopic.categoryId).toBe("memory");
    expect(whosFastestTopic.getTryTogether().length).toBe(2);
    expect(whosFastestTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/memory/whosFastest.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle } from "../../lib/utils.js";

const ANIMALS = ["Tiger", "Lion", "Cheetah", "Horse", "Rabbit", "Deer", "Leopard", "Elephant"];

export function generateWhosFastestQuestion(difficulty = "medium", index = 0) {
  const [a, b, c, decoy] = shuffle(ANIMALS).slice(0, 4);
  const order = shuffle([a, b, c]); // order[0] fastest ... order[2] slowest
  const askFastest = Math.random() < 0.5;
  const target = askFastest ? order[0] : order[2];

  const s1 = `${order[0]} runs faster than ${order[1]}.`;
  const s2 = `${order[1]} runs faster than ${order[2]}.`;
  const howTo = `Putting the clues together: ${order[0]} > ${order[1]} > ${order[2]} in speed, so ${target} is the ${askFastest ? "fastest" : "slowest"}.`;

  const letters = ["A", "B", "C", "D"];
  const optionAnimals = shuffle([order[0], order[1], order[2], decoy]);
  const options = optionAnimals.map((name, i) => ({ id: letters[i], label: name }));
  const answerId = letters[optionAnimals.indexOf(target)];
  const mistakes = {};
  optionAnimals.forEach((name, i) => {
    if (letters[i] === answerId) return;
    if (name === decoy) {
      mistakes[letters[i]] = `${name} isn't even mentioned in the clues — only ${order[0]}, ${order[1]}, and ${order[2]} were compared. ${howTo}`;
    } else {
      mistakes[letters[i]] = `${name} isn't the ${askFastest ? "fastest" : "slowest"}. ${howTo}`;
    }
  });

  return {
    id: `fastest-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "memory",
    topicId: "whosFastest",
    difficulty,
    prompt: `${s1} ${s2} Who is the ${askFastest ? "fastest" : "slowest"}?`,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const whosFastestTopic = {
  id: "whosFastest",
  categoryId: "memory",
  title: "Who's Fastest?",
  teach: {
    steps: [
      { caption: "Two clues compare three things two at a time — you have to chain them together." },
      { caption: "\"Tiger faster than Lion. Tiger slower than Cheetah.\"" },
      { caption: "That means: Cheetah > Tiger > Lion in speed." },
      { caption: "Now you can answer who's fastest (Cheetah) or slowest (Lion)!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateWhosFastestQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateWhosFastestQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/memory/whosFastest.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/memory/whosFastest.js src/content/memory/whosFastest.test.js
git commit -m "Add Who's Fastest topic content"
```

---

### Task 19: `content/memory/spotThePattern.js`

**Files:**
- Create: `src/content/memory/spotThePattern.js`
- Test: `src/content/memory/spotThePattern.test.js`

**Interfaces:**
- Consumes: `pick` from `../../lib/utils.js`.
- Produces: `generateSpotPatternQuestion(difficulty, index)`, `spotThePatternTopic`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateSpotPatternQuestion, spotThePatternTopic } from "./spotThePattern.js";

describe("generateSpotPatternQuestion", () => {
  it("the answer really is the next symbol in the repeating cycle shown", () => {
    for (let i = 0; i < 40; i++) {
      const q = generateSpotPatternQuestion("medium", i);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
    }
  });
});

describe("spotThePatternTopic", () => {
  it("has the right shape", () => {
    expect(spotThePatternTopic.categoryId).toBe("memory");
    expect(spotThePatternTopic.getTryTogether().length).toBe(2);
    expect(spotThePatternTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/memory/spotThePattern.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle, pick } from "../../lib/utils.js";

const SYMBOL_SETS = [["🔴", "🔵"], ["⭐", "🌙", "☀️"], ["🍎", "🍌"], ["🟩", "🟦", "🟨"]];
const EXTRA_SYMBOLS = ["⬛", "🟣", "🔺", "💠"];

export function generateSpotPatternQuestion(difficulty = "medium", index = 0) {
  const set = pick(SYMBOL_SETS);
  const cycleLen = set.length;
  const totalShown = difficulty === "hard" ? cycleLen * 3 : cycleLen * 2;
  const seq = Array.from({ length: totalShown }, (_, i) => set[i % cycleLen]);
  const answer = set[totalShown % cycleLen];

  let distractors = set.filter(s => s !== answer);
  let extraIdx = 0;
  while (distractors.length < 3) {
    distractors.push(EXTRA_SYMBOLS[extraIdx % EXTRA_SYMBOLS.length]);
    extraIdx++;
  }
  distractors = distractors.slice(0, 3);

  const howTo = `The pattern repeats ${set.join(" ")} over and over. After ${seq.slice(-cycleLen).join(" ")}, the cycle starts again with ${answer}.`;
  const candidates = shuffle([
    { label: answer, isAnswer: true },
    ...distractors.map(d => ({ label: d, isAnswer: false, inSet: set.includes(d) })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (c.isAnswer) return;
    mistakes[letters[i]] = c.inSet
      ? `${c.label} is part of the pattern, but it isn't next in the cycle. ${howTo}`
      : `${c.label} doesn't even appear in the pattern. ${howTo}`;
  });

  return {
    id: `pattern-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "memory",
    topicId: "spotThePattern",
    difficulty,
    prompt: `What comes next in this pattern? ${seq.join(" ")} ?`,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const spotThePatternTopic = {
  id: "spotThePattern",
  categoryId: "memory",
  title: "Spot the Pattern",
  teach: {
    steps: [
      { caption: "A repeating pattern uses the same small group of symbols over and over." },
      { caption: "🔴🔵🔴🔵 — that's the pair 🔴🔵 repeating." },
      { caption: "Find the smallest repeating group, then keep counting around it to find what's next." },
      { caption: "After 🔴🔵🔴🔵 comes 🔴 again — the cycle restarts!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateSpotPatternQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateSpotPatternQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/memory/spotThePattern.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/memory/spotThePattern.js src/content/memory/spotThePattern.test.js
git commit -m "Add Spot the Pattern topic content"
```

---

### Task 20: `content/visual/countTheShapes.js`

**Files:**
- Create: `src/content/visual/countTheShapes.js`
- Test: `src/content/visual/countTheShapes.test.js`

**Interfaces:**
- Consumes: `shuffle` from `../../lib/utils.js`; `buildGridFigure`, `buildFanFigure`, `countGridRectangles`, `countFanTriangles` from `../../lib/figures.js`.
- Produces: `generateCountShapesQuestion(difficulty, index)`, `countTheShapesTopic`.
- Correctness note: counts come from the combinatorial formulas in `lib/figures.js`, not eyeballing — see Task 6.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateCountShapesQuestion, countTheShapesTopic } from "./countTheShapes.js";

describe("generateCountShapesQuestion", () => {
  it("always carries a figure and a numeric answer matching one option", () => {
    for (let i = 0; i < 30; i++) {
      const q = generateCountShapesQuestion("medium", i);
      expect(q.figure).not.toBe(null);
      expect(q.figure.shapes.length).toBeGreaterThan(0);
      expect(q.options.length).toBe(4);
      expect(new Set(q.options.map(o => o.label)).size).toBe(4);
      expect(q.options.map(o => o.id)).toContain(q.answerId);
      q.options.forEach(o => expect(Number.isInteger(Number(o.label))).toBe(true));
    }
  });
});

describe("countTheShapesTopic", () => {
  it("has the right shape", () => {
    expect(countTheShapesTopic.categoryId).toBe("visual");
    expect(countTheShapesTopic.getTryTogether().length).toBe(2);
    expect(countTheShapesTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/visual/countTheShapes.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle } from "../../lib/utils.js";
import { buildGridFigure, buildFanFigure, countGridRectangles, countFanTriangles } from "../../lib/figures.js";

function gridInstance(difficulty) {
  const [rows, cols] = difficulty === "hard" ? [2, 2] : difficulty === "medium" ? [1, 3] : [1, 2];
  const answer = countGridRectangles(rows, cols);
  return { figure: buildGridFigure(rows, cols), answer, shapeWord: "rectangles", howTo: `This is a ${rows + 1}x${cols + 1}-line grid. Counting every small AND combined rectangle gives ${answer} in total.` };
}

function fanInstance(difficulty) {
  const n = difficulty === "hard" ? 4 : difficulty === "medium" ? 3 : 2;
  const answer = countFanTriangles(n);
  return { figure: buildFanFigure(n), answer, shapeWord: "triangles", howTo: `The big triangle is split into ${n} equal slices from the top point. Counting each small triangle AND every combination of neighboring slices gives ${answer} in total.` };
}

export function generateCountShapesQuestion(difficulty = "medium", index = 0) {
  const built = Math.random() < 0.5 ? gridInstance(difficulty) : fanInstance(difficulty);
  const { answer, howTo, shapeWord } = built;
  const nearby = new Set([answer - 2, answer - 1, answer + 1, answer + 2].filter(v => v > 0));
  const distractors = shuffle([...nearby]).slice(0, 3);
  while (distractors.length < 3) distractors.push(answer + distractors.length + 3);

  const candidates = shuffle([
    { label: String(answer), isAnswer: true },
    ...distractors.map(d => ({ label: String(d), isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} misses some of the combined shapes. Remember to count the small ${shapeWord} AND every bigger one made from combining them. ${howTo}`;
  });

  return {
    id: `count-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "visual",
    topicId: "countTheShapes",
    difficulty,
    prompt: `Count the total number of ${shapeWord} in the figure below (including bigger ones made of smaller ones).`,
    figure: built.figure,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const countTheShapesTopic = {
  id: "countTheShapes",
  categoryId: "visual",
  title: "Count the Shapes",
  teach: {
    steps: [
      { caption: "Some figures hide MORE shapes than you first see." },
      { caption: "A square split by both diagonals hides small triangles AND bigger ones made by combining them." },
      { caption: "Count every small shape first, then look for pairs or groups that form a bigger version of the same shape." },
      { caption: "Add the small count and the combined count together for the total." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateCountShapesQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateCountShapesQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/visual/countTheShapes.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/visual/countTheShapes.js src/content/visual/countTheShapes.test.js
git commit -m "Add Count the Shapes topic content"
```

---

### Task 21: `content/visual/hiddenFigureHunt.js`

**Files:**
- Create: `src/content/visual/hiddenFigureHunt.js`
- Test: `src/content/visual/hiddenFigureHunt.test.js`

**Interfaces:**
- Consumes: `shuffle`, `pick` from `../../lib/utils.js`.
- Produces: `generateHiddenFigureQuestion(difficulty, index)`, `hiddenFigureHuntTopic`.
- Correctness note: the master figure is an explicit, controlled list of primitives; the "not part of it" option is always a primitive type absent from that list, so correctness is guaranteed by construction, never by visual judgment.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateHiddenFigureQuestion, hiddenFigureHuntTopic } from "./hiddenFigureHunt.js";

describe("generateHiddenFigureQuestion", () => {
  it("the 3 wrong options are always shape types present in the master figure, the answer never is", () => {
    for (let i = 0; i < 30; i++) {
      const q = generateHiddenFigureQuestion("medium", i);
      const masterTypes = new Set(q.figure.shapes.map(s => s.type));
      const answerOption = q.options.find(o => o.id === q.answerId);
      expect(masterTypes.has(answerOption.figure.shapes[0].type)).toBe(false);
      q.options.filter(o => o.id !== q.answerId).forEach(o => {
        expect(masterTypes.has(o.figure.shapes[0].type)).toBe(true);
      });
    }
  });
});

describe("hiddenFigureHuntTopic", () => {
  it("has the right shape", () => {
    expect(hiddenFigureHuntTopic.categoryId).toBe("visual");
    expect(hiddenFigureHuntTopic.getTryTogether().length).toBe(2);
    expect(hiddenFigureHuntTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/visual/hiddenFigureHunt.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle, pick } from "../../lib/utils.js";

function thumb(shape) {
  return { width: 60, height: 60, shapes: [shape] };
}

const PRIMITIVES = {
  circle: { type: "circle", cx: 30, cy: 30, r: 25, fill: "#ffb38f", stroke: "#25233a" },
  square: { type: "rect", x: 8, y: 8, w: 44, h: 44, fill: "#a7d9ff", stroke: "#25233a" },
  triangle: { type: "polygon", points: "30,6 54,54 6,54", fill: "#c9f5c9", stroke: "#25233a" },
  star: { type: "polygon", points: "30,4 37,22 56,22 41,34 47,53 30,41 13,53 19,34 4,22 23,22", fill: "#ffe08a", stroke: "#25233a" },
  pentagon: { type: "polygon", points: "30,4 54,22 45,52 15,52 6,22", fill: "#e6c9ff", stroke: "#25233a" },
};

function masterFigure() {
  return {
    width: 220, height: 220,
    shapes: [
      { type: "circle", cx: 80, cy: 80, r: 55, fill: "#ffb38f88", stroke: "#25233a" },
      { type: "rect", x: 90, y: 60, w: 100, h: 100, fill: "#a7d9ff88", stroke: "#25233a" },
      { type: "polygon", points: "60,190 160,190 110,110", fill: "#c9f5c988", stroke: "#25233a" },
    ],
  };
}

export function generateHiddenFigureQuestion(difficulty = "medium", index = 0) {
  const master = masterFigure();
  const memberTypes = ["circle", "square", "triangle"];
  const foreignType = pick(["star", "pentagon"]);
  const howTo = `The figure is made of a circle, a square, and a triangle overlapping. The ${foreignType} is never one of them, so it's the one NOT hidden in the figure.`;

  const candidates = shuffle([
    { type: foreignType, isAnswer: true },
    ...memberTypes.map(t => ({ type: t, isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], figure: thumb(PRIMITIVES[c.type]) }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `The ${c.type} really is one of the overlapping shapes in the figure. ${howTo}`;
  });

  return {
    id: `hidden-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "visual",
    topicId: "hiddenFigureHunt",
    difficulty,
    prompt: "Which of the following shapes is NOT hidden in the figure below?",
    figure: master,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const hiddenFigureHuntTopic = {
  id: "hiddenFigureHunt",
  categoryId: "visual",
  title: "Hidden Figure Hunt",
  teach: {
    steps: [
      { caption: "A big figure can be made of several simple shapes overlapping each other." },
      { caption: "Look at each option and search for it inside the big figure." },
      { caption: "Three of the options really are part of the figure — one is not." },
      { caption: "The one you can't find anywhere in the figure is the answer!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateHiddenFigureQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateHiddenFigureQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/visual/hiddenFigureHunt.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/visual/hiddenFigureHunt.js src/content/visual/hiddenFigureHunt.test.js
git commit -m "Add Hidden Figure Hunt topic content"
```

---

### Task 22: `content/visual/spotTheDifference.js`

**Files:**
- Create: `src/content/visual/spotTheDifference.js`
- Test: `src/content/visual/spotTheDifference.test.js`

**Interfaces:**
- Consumes: `shuffle` from `../../lib/utils.js`; `buildDiffPair` from `../../lib/figures.js`.
- Produces: `generateSpotDifferenceQuestion(difficulty, index)`, `spotTheDifferenceTopic`.
- Correctness note: the "after" scene is generated by applying a known list of changes to the "before" scene, so the true difference count is always `changes.length` — never counted by eye.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { generateSpotDifferenceQuestion, spotTheDifferenceTopic } from "./spotTheDifference.js";

describe("generateSpotDifferenceQuestion", () => {
  it("carries two figures and the numeric answer equals the actual number of changed shapes", () => {
    for (let i = 0; i < 30; i++) {
      const q = generateSpotDifferenceQuestion("medium", i);
      expect(q.figure).not.toBe(null);
      expect(q.secondFigure).not.toBe(null);
      const answerLabel = Number(q.options.find(o => o.id === q.answerId).label);
      let diffCount = 0;
      q.figure.shapes.forEach((s, idx) => {
        const other = q.secondFigure.shapes[idx];
        if (JSON.stringify(s) !== JSON.stringify(other)) diffCount++;
      });
      expect(answerLabel).toBe(diffCount);
    }
  });
});

describe("spotTheDifferenceTopic", () => {
  it("has the right shape", () => {
    expect(spotTheDifferenceTopic.categoryId).toBe("visual");
    expect(spotTheDifferenceTopic.getTryTogether().length).toBe(2);
    expect(spotTheDifferenceTopic.getYourTurn().length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/visual/spotTheDifference.test.js`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { shuffle } from "../../lib/utils.js";
import { buildDiffPair } from "../../lib/figures.js";

const BASE_SCENE = [
  { type: "rect", x: 40, y: 90, w: 100, h: 70, fill: "#ffd6ad", stroke: "#25233a" },
  { type: "polygon", points: "40,90 90,40 140,90", fill: "#e46b30", stroke: "#25233a" },
  { type: "rect", x: 75, y: 120, w: 30, h: 40, fill: "#6b5bd6", stroke: "#25233a" },
  { type: "circle", cx: 160, cy: 40, r: 18, fill: "#f5b73c", stroke: "#25233a" },
  { type: "rect", x: 55, y: 105, w: 18, h: 18, fill: "#a7d9ff", stroke: "#25233a" },
];

const CHANGE_POOL = [
  { index: 0, patch: { fill: "#a7d9ff" } },
  { index: 1, patch: { fill: "#20a66a" } },
  { index: 2, patch: { x: 90 } },
  { index: 3, patch: { r: 26 } },
  { index: 4, patch: { fill: "#e45b5b" } },
];

export function generateSpotDifferenceQuestion(difficulty = "medium", index = 0) {
  const k = difficulty === "hard" ? 4 : difficulty === "medium" ? 3 : 2;
  const changes = shuffle(CHANGE_POOL).slice(0, k);
  const { before, after } = buildDiffPair(BASE_SCENE, changes);
  const answer = changes.length;
  const howTo = `Compare each shape one at a time: its color, size, and position. There ${answer === 1 ? "is 1 difference" : `are ${answer} differences`} between the two pictures.`;

  const nearby = [...new Set([answer - 1, answer + 1, answer + 2].filter(v => v > 0 && v !== answer))];
  const distractors = shuffle(nearby).slice(0, 3);
  while (distractors.length < 3) distractors.push(answer + distractors.length + 3);

  const candidates = shuffle([
    { label: String(answer), isAnswer: true },
    ...distractors.map(d => ({ label: String(d), isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `That count doesn't match — go shape by shape and compare color, size, and position carefully. ${howTo}`;
  });

  return {
    id: `diff-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "visual",
    topicId: "spotTheDifference",
    difficulty,
    prompt: "Count the total number of differences between image 1 and image 2.",
    figure: { width: 220, height: 220, shapes: before },
    secondFigure: { width: 220, height: 220, shapes: after },
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const spotTheDifferenceTopic = {
  id: "spotTheDifference",
  categoryId: "visual",
  title: "Spot the Difference",
  teach: {
    steps: [
      { caption: "Two pictures look almost the same — but a few small things have changed." },
      { caption: "Go shape by shape: check its color, its size, and where it sits." },
      { caption: "Keep a running count every time you spot something different." },
      { caption: "Your total count is the answer!" },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateSpotDifferenceQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateSpotDifferenceQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/visual/spotTheDifference.test.js`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/visual/spotTheDifference.js src/content/visual/spotTheDifference.test.js
git commit -m "Add Spot the Difference topic content"
```

---

### Task 23: `content/index.js` — aggregate all 15 topics

**Files:**
- Create: `src/content/index.js`
- Test: `src/content/index.test.js`

**Interfaces:**
- Consumes: `CATEGORIES` from `./categories.js`; all 15 topic exports from Tasks 8–22 (`seriesCompletionTopic`, `oddOneOutTopic`, `analogiesTopic`, `compoundWordsTopic`, `whichLetterAmITopic`, `spellingDetectiveTopic`, `balanceEquationTopic`, `greatestSmallestTopic`, `wordProblemsTopic`, `codedLanguageTopic`, `whosFastestTopic`, `spotThePatternTopic`, `countTheShapesTopic`, `hiddenFigureHuntTopic`, `spotTheDifferenceTopic`).
- Produces: `TOPICS` (flat array of 15), `TOPICS_BY_CATEGORY` (object keyed by categoryId → array of its 3 topics, in the fixed display order matching the spec's table), `getTopic(topicId)`. Consumed by `SkillMap`, `TopicView`, `MixedPractice`, `MockTest`.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from "vitest";
import { CATEGORIES } from "./categories.js";
import { TOPICS, TOPICS_BY_CATEGORY, getTopic } from "./index.js";

describe("content index", () => {
  it("has exactly 15 topics, 3 per category", () => {
    expect(TOPICS.length).toBe(15);
    CATEGORIES.forEach(cat => {
      expect(TOPICS_BY_CATEGORY[cat.id].length).toBe(3);
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/index.test.js`
Expected: FAIL — `index.js` does not exist yet.

- [ ] **Step 3: Write the implementation**

```js
import { CATEGORIES } from "./categories.js";
import { seriesCompletionTopic } from "./analytical/seriesCompletion.js";
import { oddOneOutTopic } from "./analytical/oddOneOut.js";
import { analogiesTopic } from "./analytical/analogies.js";
import { compoundWordsTopic } from "./verbal/compoundWords.js";
import { whichLetterAmITopic } from "./verbal/whichLetterAmI.js";
import { spellingDetectiveTopic } from "./verbal/spellingDetective.js";
import { balanceEquationTopic } from "./numerical/balanceEquation.js";
import { greatestSmallestTopic } from "./numerical/greatestSmallest.js";
import { wordProblemsTopic } from "./numerical/wordProblems.js";
import { codedLanguageTopic } from "./memory/codedLanguage.js";
import { whosFastestTopic } from "./memory/whosFastest.js";
import { spotThePatternTopic } from "./memory/spotThePattern.js";
import { countTheShapesTopic } from "./visual/countTheShapes.js";
import { hiddenFigureHuntTopic } from "./visual/hiddenFigureHunt.js";
import { spotTheDifferenceTopic } from "./visual/spotTheDifference.js";

export const TOPICS = [
  seriesCompletionTopic, oddOneOutTopic, analogiesTopic,
  compoundWordsTopic, whichLetterAmITopic, spellingDetectiveTopic,
  balanceEquationTopic, greatestSmallestTopic, wordProblemsTopic,
  codedLanguageTopic, whosFastestTopic, spotThePatternTopic,
  countTheShapesTopic, hiddenFigureHuntTopic, spotTheDifferenceTopic,
];

export const TOPICS_BY_CATEGORY = Object.fromEntries(
  CATEGORIES.map(cat => [cat.id, TOPICS.filter(t => t.categoryId === cat.id)])
);

export function getTopic(topicId) {
  return TOPICS.find(t => t.id === topicId);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/index.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/index.js src/content/index.test.js
git commit -m "Aggregate all 15 topics into a single content index"
```

---

### Task 24: `components/FigureSVG.jsx` — generic shape renderer

**Files:**
- Create: `src/components/FigureSVG.jsx`
- Test: `src/components/FigureSVG.test.jsx`

**Interfaces:**
- Consumes: a `ShapeSpec` (see header) as the `spec` prop.
- Produces: `<FigureSVG spec={...} size={number}/>` — a dumb renderer with no state. Used by `QuestionCard` and `TeachSteps`.
- Testing note: component tests in this plan use `react-dom/server`'s `renderToStaticMarkup`, which runs in plain Node (vitest's default environment) — no jsdom dependency needed. Interactive behavior (clicks, audio) is verified later by the Playwright smoke task (Task 34), matching how india-capital-quest was verified.

- [ ] **Step 1: Write the failing test**

```jsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FigureSVG from "./FigureSVG.jsx";

describe("FigureSVG", () => {
  it("renders each shape type to the matching SVG element", () => {
    const spec = {
      width: 100, height: 100,
      shapes: [
        { type: "rect", x: 1, y: 2, w: 3, h: 4 },
        { type: "line", x1: 0, y1: 0, x2: 10, y2: 10 },
        { type: "polygon", points: "0,0 10,0 5,10" },
        { type: "circle", cx: 5, cy: 5, r: 5 },
        { type: "text", x: 1, y: 1, text: "hi" },
      ],
    };
    const html = renderToStaticMarkup(<FigureSVG spec={spec} size={100} />);
    expect(html).toContain("<rect");
    expect(html).toContain("<line");
    expect(html).toContain("<polygon");
    expect(html).toContain("<circle");
    expect(html).toContain("hi");
  });

  it("renders nothing for a null spec", () => {
    expect(renderToStaticMarkup(<FigureSVG spec={null} />)).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/FigureSVG.test.jsx`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```jsx
import React from "react";

export default function FigureSVG({ spec, size = 160 }) {
  if (!spec) return null;
  const { width, height, shapes } = spec;
  const displayHeight = size * (height / width);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={size} height={displayHeight} role="img" aria-label="puzzle figure">
      {shapes.map((s, i) => {
        if (s.type === "rect") return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.fill || "none"} stroke={s.stroke || "none"} strokeWidth={s.strokeWidth || 2} />;
        if (s.type === "line") return <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.stroke || "#25233a"} strokeWidth={s.strokeWidth || 2} />;
        if (s.type === "polygon") return <polygon key={i} points={s.points} fill={s.fill || "none"} stroke={s.stroke || "none"} strokeWidth={s.strokeWidth || 2} />;
        if (s.type === "circle") return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill || "none"} stroke={s.stroke || "none"} strokeWidth={s.strokeWidth || 2} />;
        if (s.type === "text") return <text key={i} x={s.x} y={s.y} fontSize={s.fontSize || 14} fill={s.fill || "#25233a"}>{s.text}</text>;
        return null;
      })}
    </svg>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/FigureSVG.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/FigureSVG.jsx src/components/FigureSVG.test.jsx
git commit -m "Add generic SVG figure renderer for Visual questions"
```

---

### Task 25: Shared small components — `Header`, `AvatarPicker`, `Confetti`

**Files:**
- Create: `src/components/Header.jsx`
- Create: `src/components/AvatarPicker.jsx`
- Create: `src/components/Confetti.jsx`
- Test: `src/components/Header.test.jsx`
- Test: `src/components/AvatarPicker.test.jsx`

**Interfaces:**
- Consumes: `KEYS`, `saveJSON`, `loadJSON` from `../lib/storage.js` (AvatarPicker persists its own selection).
- Produces: `<Header onBack={fn} avatar={string} title={string}/>` (top bar, reused everywhere); `<AvatarPicker avatar={string} playerName={string} onChangeAvatar={fn} onChangeName={fn}/>` (renders the 8-avatar grid + name input, matching india-capital-quest's proven pattern); `<Confetti/>` (canvas burst, browser-only — verified via Playwright, not unit tested, same as india-capital-quest's Confetti component). Consumed by `SkillMap`, `TopicView`, `MixedPractice`, `MockTest`, `ProgressScreen`, `LeaderboardScreen`.

- [ ] **Step 1: Write the failing tests**

```jsx
// src/components/Header.test.jsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Header from "./Header.jsx";

describe("Header", () => {
  it("shows the title and the avatar chip when given one", () => {
    const html = renderToStaticMarkup(<Header onBack={() => {}} avatar="🦁" title="LogiQids Quest" />);
    expect(html).toContain("LogiQids Quest");
    expect(html).toContain("🦁");
  });
});
```

```jsx
// src/components/AvatarPicker.test.jsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import AvatarPicker from "./AvatarPicker.jsx";

describe("AvatarPicker", () => {
  it("renders all 8 avatar options and marks the selected one active", () => {
    const html = renderToStaticMarkup(
      <AvatarPicker avatar="🐼" playerName="Aanya" onChangeAvatar={() => {}} onChangeName={() => {}} />
    );
    expect(html).toContain("🦁");
    expect(html).toContain("🐼");
    expect(html).toContain("Aanya");
    expect(html).toMatch(/class="[^"]*active[^"]*"[^>]*>🐼/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/Header.test.jsx src/components/AvatarPicker.test.jsx`
Expected: FAIL — modules do not exist yet.

- [ ] **Step 3: Write the implementations**

```jsx
// src/components/Header.jsx
import React from "react";
import { Home } from "lucide-react";

export default function Header({ onBack, avatar, title = "LogiQids Quest" }) {
  return (
    <header className="header">
      <button className="iconBtn" onClick={onBack} aria-label="Home"><Home size={19} /></button>
      <div className="brand"><span className="brandMark">🧩</span><div><b>{title}</b><small>Learn • Play • Master</small></div></div>
      {avatar && <div className="avatarChip">{avatar}</div>}
    </header>
  );
}
```

```jsx
// src/components/AvatarPicker.jsx
import React from "react";

export const AVATARS = ["🦁", "🐯", "🦊", "🐼", "🦄", "🐵", "🐸", "🦋"];

export default function AvatarPicker({ avatar, playerName, onChangeAvatar, onChangeName }) {
  return (
    <div className="avatarPickerBlock">
      <h2>Who's playing?</h2>
      <input className="nameInput" value={playerName} maxLength={16} placeholder="Type your name"
        onChange={e => onChangeName(e.target.value)} />
      <div className="avatarPicker">
        {AVATARS.map(a => (
          <button key={a} className={"avatarBtn " + (avatar === a ? "active" : "")}
            onClick={() => onChangeAvatar(a)} aria-label={`Choose avatar ${a}`}>{a}</button>
        ))}
      </div>
    </div>
  );
}
```

```jsx
// src/components/Confetti.jsx
import React, { useEffect, useRef } from "react";

export default function Confetti() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const colors = ["#ff7a3d", "#f5b73c", "#20a66a", "#5b8def", "#e45b5b", "#a76fe0"];
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * W, y: -20 - Math.random() * H * 0.6,
      r: 4 + Math.random() * 5, c: colors[Math.floor(Math.random() * colors.length)],
      speed: 2 + Math.random() * 3, drift: Math.random() * 2 - 1,
      rot: Math.random() * 360, spin: Math.random() * 8 - 4,
    }));
    let raf, frame = 0;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, W, H);
      pieces.forEach(p => {
        p.y += p.speed; p.x += p.drift; p.rot += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();
      });
      if (frame < 170) raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="confettiCanvas" />;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/Header.test.jsx src/components/AvatarPicker.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.jsx src/components/AvatarPicker.jsx src/components/Confetti.jsx src/components/Header.test.jsx src/components/AvatarPicker.test.jsx
git commit -m "Add shared Header, AvatarPicker, and Confetti components"
```

---

### Task 26: `components/QuestionCard.jsx` — the core question/explanation loop

**Files:**
- Create: `src/components/QuestionCard.jsx`
- Test: `src/components/QuestionCard.test.jsx`

**Interfaces:**
- Consumes: `FigureSVG` (Task 24); `speak`, `stopSpeech` from `../lib/speech.js` (Task 5).
- Produces: `<QuestionCard question={Question} onAnswered={(isCorrect, optionId)=>void} soundOn={bool} withholdExplanation={bool}/>`. `onAnswered`'s second argument is the chosen option id, useful to callers that need to remember what was picked (e.g. `MockTest`'s review screen); callers that only care about correctness can ignore it. When `withholdExplanation` is true (Mock Test mode), selecting an option immediately calls `onAnswered` without showing the explanation card or speaking — used so mock-test conditions match the real exam. Otherwise (Practice/Teach modes) it shows the prompt/figure, 4 lettered options, and on selection shows an explanation card (`explanation.mistakes[chosenId]` if present, else `explanation.howTo`) with a replay button, auto-speaking it via `speak()` when the answer is wrong and `soundOn` is true, then a Continue button that calls `onAnswered(isCorrect, chosenId)`. Consumed by `TopicView`, `MixedPractice`, `MockTest`.

- [ ] **Step 1: Write the failing test**

```jsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import QuestionCard from "./QuestionCard.jsx";

const QUESTION = {
  id: "q1", categoryId: "analytical", topicId: "seriesCompletion", difficulty: "easy",
  prompt: "Find the next number: 2, 4, 6, ?",
  figure: null,
  options: [{ id: "A", label: "8" }, { id: "B", label: "10" }, { id: "C", label: "12" }, { id: "D", label: "14" }],
  answerId: "A",
  explanation: {
    correct: "Yes! Adding 2 each time gets you to 8.",
    howTo: "The pattern adds 2 each time.",
    mistakes: { B: "That adds one extra step." },
  },
};

describe("QuestionCard (static render)", () => {
  it("renders the prompt and all 4 lettered options before answering", () => {
    const html = renderToStaticMarkup(<QuestionCard question={QUESTION} onAnswered={() => {}} soundOn={false} />);
    expect(html).toContain("Find the next number");
    ["A", "B", "C", "D"].forEach(letter => expect(html).toContain(`>${letter}<`));
    expect(html).toContain("8");
    expect(html).toContain("10");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/QuestionCard.test.jsx`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```jsx
import React, { useState, useEffect } from "react";
import { Check, X, Volume2 } from "lucide-react";
import FigureSVG from "./FigureSVG.jsx";
import { speak, stopSpeech } from "../lib/speech.js";

export default function QuestionCard({ question, onAnswered, soundOn = true, withholdExplanation = false }) {
  const [selected, setSelected] = useState(null);
  useEffect(() => () => stopSpeech(), []);

  const answered = selected !== null;
  const isCorrect = selected === question.answerId;

  function choose(optionId) {
    if (answered) return;
    if (withholdExplanation) {
      onAnswered(optionId === question.answerId, optionId);
      return;
    }
    setSelected(optionId);
    const isRight = optionId === question.answerId;
    if (!isRight && soundOn) {
      const text = question.explanation.mistakes[optionId] || question.explanation.howTo;
      speak(text);
    }
  }

  function replay() {
    const text = isCorrect ? question.explanation.correct : (question.explanation.mistakes[selected] || question.explanation.howTo);
    speak(text);
  }

  function continueOn() {
    stopSpeech();
    onAnswered(isCorrect, selected);
  }

  const explanationText = answered
    ? (isCorrect ? question.explanation.correct : (question.explanation.mistakes[selected] || question.explanation.howTo))
    : null;

  return (
    <div className="questionCard">
      {question.figure && <div className="questionFigure"><FigureSVG spec={question.figure} size={200} /></div>}
      {question.secondFigure && <div className="questionFigure"><FigureSVG spec={question.secondFigure} size={200} /></div>}
      <h2>{question.prompt}</h2>
      <div className="options">
        {question.options.map(opt => {
          let cls = "option";
          if (answered && opt.id === question.answerId) cls += " right";
          else if (answered && opt.id === selected) cls += " wrong";
          return (
            <button key={opt.id} className={cls} onClick={() => choose(opt.id)}>
              <span className="letter">{opt.id}</span>
              {opt.figure ? <FigureSVG spec={opt.figure} size={56} /> : <span>{opt.label}</span>}
              {answered && opt.id === question.answerId && <Check size={19} />}
              {answered && opt.id === selected && opt.id !== question.answerId && <X size={19} />}
            </button>
          );
        })}
      </div>
      {answered && !withholdExplanation && (
        <div className={"explanationCard " + (isCorrect ? "good" : "bad")}>
          <div className="explanationIcon">{isCorrect ? "🎉" : "💡"}</div>
          <div><span>{explanationText}</span></div>
          <button className="replayBtn" onClick={replay} aria-label="Replay explanation"><Volume2 size={17} /></button>
        </div>
      )}
      {answered && !withholdExplanation && (
        <button className="nextBtn" onClick={continueOn}>Continue</button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/QuestionCard.test.jsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/QuestionCard.jsx src/components/QuestionCard.test.jsx
git commit -m "Add QuestionCard with mistake-specific spoken explanations"
```

---

### Task 27: `components/TeachSteps.jsx` — the animated walkthrough

**Files:**
- Create: `src/components/TeachSteps.jsx`
- Test: `src/components/TeachSteps.test.jsx`

**Interfaces:**
- Consumes: `FigureSVG` (Task 24).
- Produces: `<TeachSteps steps={[{caption, visual?}]} onDone={fn}/>` — shows one step at a time with a "Next"/"Let's practice!" button, advancing through `steps` and calling `onDone()` after the last one. Consumed by `TopicView`.

- [ ] **Step 1: Write the failing test**

```jsx
import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TeachSteps from "./TeachSteps.jsx";

describe("TeachSteps (static render)", () => {
  it("shows the first step's caption and a Next button when more steps remain", () => {
    const steps = [{ caption: "Step one" }, { caption: "Step two" }];
    const html = renderToStaticMarkup(<TeachSteps steps={steps} onDone={() => {}} />);
    expect(html).toContain("Step one");
    expect(html).not.toContain("Step two");
    expect(html).toContain("Next");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/TeachSteps.test.jsx`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```jsx
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import FigureSVG from "./FigureSVG.jsx";

export default function TeachSteps({ steps, onDone }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  function next() {
    if (isLast) onDone();
    else setIndex(i => i + 1);
  }

  return (
    <div className="teachCard">
      <div className="teachProgress">Step {index + 1} of {steps.length}</div>
      {step.visual && <div className="teachVisual"><FigureSVG spec={step.visual} size={180} /></div>}
      <p className="teachCaption">{step.caption}</p>
      <button className="nextBtn" onClick={next}>
        {isLast ? "Let's practice!" : "Next"} <ArrowRight size={19} />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/TeachSteps.test.jsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/TeachSteps.jsx src/components/TeachSteps.test.jsx
git commit -m "Add TeachSteps walkthrough component"
```

---

### Task 28: `components/TopicView.jsx` — the Teach → Try Together → Your Turn loop

**Files:**
- Create: `src/components/TopicView.jsx`
- Test: `src/components/TopicView.test.jsx`

**Interfaces:**
- Consumes: `TeachSteps` (Task 27), `QuestionCard` (Task 26), `Confetti` (Task 25), `recordTopicAttempt` from `../lib/storage.js` (Task 3), `isTopicMastered` from `../lib/scoring.js` (Task 4).
- Produces: `<TopicView topic={Topic} soundOn={bool} onExit={fn}/>`. Internally: phase state `'teach' | 'tryTogether' | 'yourTurn' | 'done'`; generates `topic.getTryTogether()`/`topic.getYourTurn()` once via `useMemo` on mount; during `yourTurn`, each answer calls `recordTopicAttempt(topic.id, isCorrect)`; on completion computes mastery via `isTopicMastered` and shows a completion banner (+ `<Confetti/>` if mastered) before returning to the map via `onExit()`. Consumed by `App.jsx`.

- [ ] **Step 1: Write the failing test**

```jsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TopicView from "./TopicView.jsx";

function makeQuestion(id, answerId = "A") {
  return {
    id, categoryId: "analytical", topicId: "t1", difficulty: "easy",
    prompt: `Prompt ${id}`, figure: null,
    options: [{ id: "A", label: "1" }, { id: "B", label: "2" }, { id: "C", label: "3" }, { id: "D", label: "4" }],
    answerId,
    explanation: { correct: "Yes!", howTo: "Here's how.", mistakes: { B: "no", C: "no", D: "no" } },
  };
}

const TOPIC = {
  id: "t1", categoryId: "analytical", title: "Test Topic",
  teach: { steps: [{ caption: "Learn this." }] },
  getTryTogether: () => [makeQuestion("tt1"), makeQuestion("tt2")],
  getYourTurn: () => [makeQuestion("yt1"), makeQuestion("yt2"), makeQuestion("yt3"), makeQuestion("yt4")],
};

describe("TopicView (static render)", () => {
  it("starts on the Teach phase, showing the topic's first caption", () => {
    const html = renderToStaticMarkup(<TopicView topic={TOPIC} soundOn={false} onExit={() => {}} />);
    expect(html).toContain("Learn this.");
    expect(html).toContain("Test Topic");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/TopicView.test.jsx`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```jsx
import React, { useState, useMemo } from "react";
import Header from "./Header.jsx";
import TeachSteps from "./TeachSteps.jsx";
import QuestionCard from "./QuestionCard.jsx";
import Confetti from "./Confetti.jsx";
import { recordTopicAttempt } from "../lib/storage.js";
import { isTopicMastered } from "../lib/scoring.js";

export default function TopicView({ topic, soundOn, avatar, onExit }) {
  const [phase, setPhase] = useState("teach");
  const [index, setIndex] = useState(0);
  const [yourTurnScore, setYourTurnScore] = useState(0);
  const tryTogether = useMemo(() => topic.getTryTogether(), [topic]);
  const yourTurn = useMemo(() => topic.getYourTurn(), [topic]);

  function handleTeachDone() {
    setPhase("tryTogether");
    setIndex(0);
  }

  function handleTryTogetherAnswered() {
    if (index === tryTogether.length - 1) {
      setPhase("yourTurn");
      setIndex(0);
    } else {
      setIndex(i => i + 1);
    }
  }

  function handleYourTurnAnswered(isCorrect) {
    const rec = recordTopicAttempt(topic.id, isCorrect);
    if (isCorrect) setYourTurnScore(s => s + 1);
    if (index === yourTurn.length - 1) {
      setPhase("done");
    } else {
      setIndex(i => i + 1);
    }
  }

  const mastered = phase === "done" && isTopicMastered({ attempts: yourTurn.length, correct: yourTurnScore });

  return (
    <main className="topicView">
      {mastered && <Confetti />}
      <Header onBack={onExit} avatar={avatar} />
      <div className="topicHeaderRow"><h1>{topic.title}</h1></div>
      {phase === "teach" && <TeachSteps steps={topic.teach.steps} onDone={handleTeachDone} />}
      {phase === "tryTogether" && (
        <div>
          <p className="phaseLabel">Let's try together ({index + 1} of {tryTogether.length})</p>
          <QuestionCard key={tryTogether[index].id} question={tryTogether[index]} soundOn={soundOn} onAnswered={handleTryTogetherAnswered} />
        </div>
      )}
      {phase === "yourTurn" && (
        <div>
          <p className="phaseLabel">Your turn ({index + 1} of {yourTurn.length})</p>
          <QuestionCard key={yourTurn[index].id} question={yourTurn[index]} soundOn={soundOn} onAnswered={handleYourTurnAnswered} />
        </div>
      )}
      {phase === "done" && (
        <div className="topicDoneCard">
          <div className="topicDoneIcon">{mastered ? "⭐" : "👍"}</div>
          <h2>{mastered ? "Topic mastered!" : "Nice practice!"}</h2>
          <p>You got {yourTurnScore} out of {yourTurn.length} right.</p>
          {!mastered && <p>Try this topic again any time to earn your star.</p>}
          <button className="startBtn" onClick={onExit}>Back to map</button>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/TopicView.test.jsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/TopicView.jsx src/components/TopicView.test.jsx
git commit -m "Add TopicView orchestrating Teach, Try Together, and Your Turn"
```

---

### Task 29: `components/SkillMap.jsx` — the home screen

**Files:**
- Create: `src/components/SkillMap.jsx`
- Test: `src/components/SkillMap.test.jsx`

**Interfaces:**
- Consumes: `CATEGORIES` from `../content/categories.js`, `TOPICS_BY_CATEGORY` from `../content/index.js`, `isTopicMastered` from `../lib/scoring.js`.
- Produces: `<SkillMap progress={object} avatar={string} onOpenTopic={(id)=>void} onOpenMixedPractice={fn} onOpenMockTest={fn} onOpenProgress={fn} onOpenLeaderboard={fn}/>`. Renders each category as a colored zone with its 3 topics; a topic is locked if it isn't the first in its category and the previous topic in that category isn't yet mastered. Consumed by `App.jsx`.

- [ ] **Step 1: Write the failing test**

```jsx
import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import SkillMap from "./SkillMap.jsx";

describe("SkillMap (static render)", () => {
  it("shows all 5 category names and all 15 topic titles", () => {
    const html = renderToStaticMarkup(
      <SkillMap progress={{}} avatar="🦁" onOpenTopic={() => {}} onOpenMixedPractice={() => {}}
        onOpenMockTest={() => {}} onOpenProgress={() => {}} onOpenLeaderboard={() => {}} />
    );
    ["Analytical Thinking", "Verbal", "Visual", "Numerical Ability", "Memory & Concentration"].forEach(name =>
      expect(html).toContain(name)
    );
    expect(html).toContain("Series Completion");
    expect(html).toContain("Spot the Difference");
  });

  it("locks the 2nd and 3rd topic of a category until the previous one is mastered", () => {
    const html = renderToStaticMarkup(
      <SkillMap progress={{}} avatar="🦁" onOpenTopic={() => {}} onOpenMixedPractice={() => {}}
        onOpenMockTest={() => {}} onOpenProgress={() => {}} onOpenLeaderboard={() => {}} />
    );
    // Odd One Out is the 2nd analytical topic, should render as locked with no attempts yet
    expect(html).toMatch(/oddOneOut[\s\S]*locked|locked[\s\S]*oddOneOut/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/SkillMap.test.jsx`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

Note: `data-topic-id` is added to each topic node specifically so the lock-state test above can associate the rendered "locked" class with the right topic id.

```jsx
import React from "react";
import { Star, ListOrdered, Timer, BarChart3 } from "lucide-react";
import { CATEGORIES } from "../content/categories.js";
import { TOPICS_BY_CATEGORY } from "../content/index.js";
import { isTopicMastered } from "../lib/scoring.js";

export default function SkillMap({ progress, avatar, onOpenTopic, onOpenMixedPractice, onOpenMockTest, onOpenProgress, onOpenLeaderboard }) {
  return (
    <main className="skillMap">
      <div className="skillMapHero">
        <h1>Ready to learn something fun today, {avatar}?</h1>
        <p>Pick a topic below to start a lesson.</p>
      </div>
      {CATEGORIES.map(cat => (
        <section key={cat.id} className="categoryZone" style={{ "--zoneColor": cat.color }}>
          <h2><span className="categoryIcon">{cat.icon}</span> {cat.name}</h2>
          <div className="topicRow">
            {TOPICS_BY_CATEGORY[cat.id].map((topic, i) => {
              const rec = progress[topic.id];
              const mastered = isTopicMastered(rec);
              const prevTopic = TOPICS_BY_CATEGORY[cat.id][i - 1];
              const locked = i > 0 && !isTopicMastered(progress[prevTopic?.id]);
              return (
                <button key={topic.id} data-topic-id={topic.id}
                  className={"topicNode " + (mastered ? "mastered" : locked ? "locked" : "unlocked")}
                  disabled={locked} onClick={() => !locked && onOpenTopic(topic.id)}>
                  <span className="topicNodeIcon">{mastered ? "⭐" : locked ? "🔒" : "▶️"}</span>
                  <span className="topicNodeTitle">{topic.title}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <div className="skillMapFooter">
        <button className="navChip" onClick={onOpenMixedPractice}><Timer size={16} /> Mixed Practice</button>
        <button className="navChip" onClick={onOpenMockTest}><ListOrdered size={16} /> Mock Test</button>
        <button className="navChip" onClick={onOpenProgress}><BarChart3 size={16} /> My Progress</button>
        <button className="navChip" onClick={onOpenLeaderboard}><Star size={16} /> Leaderboard</button>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/SkillMap.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/SkillMap.jsx src/components/SkillMap.test.jsx
git commit -m "Add SkillMap home screen with per-category topic unlocking"
```

---

### Task 30: `components/ProgressScreen.jsx` and `components/LeaderboardScreen.jsx`

**Files:**
- Create: `src/components/ProgressScreen.jsx`
- Create: `src/components/LeaderboardScreen.jsx`
- Test: `src/components/ProgressScreen.test.jsx`
- Test: `src/components/LeaderboardScreen.test.jsx`

**Interfaces:**
- Consumes: `CATEGORIES` from `../content/categories.js`, `TOPICS_BY_CATEGORY` from `../content/index.js`, `isTopicMastered` from `../lib/scoring.js`, `Header` (Task 25).
- Produces: `<ProgressScreen progress={object} avatar={string} onBack={fn}/>` (per-category mastery counts + a topic-by-topic star grid); `<LeaderboardScreen entries={array} avatar={string} onBack={fn}/>` (top-5 mock-test scores). Consumed by `App.jsx`.

- [ ] **Step 1: Write the failing tests**

```jsx
// src/components/ProgressScreen.test.jsx
import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProgressScreen from "./ProgressScreen.jsx";

describe("ProgressScreen (static render)", () => {
  it("shows a mastered count per category and lists every topic", () => {
    const progress = { seriesCompletion: { attempts: 4, correct: 4 } };
    const html = renderToStaticMarkup(<ProgressScreen progress={progress} avatar="🦁" onBack={() => {}} />);
    expect(html).toContain("Analytical Thinking");
    expect(html).toContain("Series Completion");
    expect(html).toMatch(/1\s*\/\s*3/); // 1 of 3 analytical topics mastered
  });
});
```

```jsx
// src/components/LeaderboardScreen.test.jsx
import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LeaderboardScreen from "./LeaderboardScreen.jsx";

describe("LeaderboardScreen (static render)", () => {
  it("lists entries with name and percentage, or an empty state with none", () => {
    const withEntries = renderToStaticMarkup(
      <LeaderboardScreen entries={[{ name: "Aanya", avatar: "🦁", pct: 90, raw: 100, difficulty: "mock" }]} avatar="🦁" onBack={() => {}} />
    );
    expect(withEntries).toContain("Aanya");
    expect(withEntries).toContain("90%");

    const empty = renderToStaticMarkup(<LeaderboardScreen entries={[]} avatar="🦁" onBack={() => {}} />);
    expect(empty).toMatch(/mock test/i);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/ProgressScreen.test.jsx src/components/LeaderboardScreen.test.jsx`
Expected: FAIL — modules do not exist yet.

- [ ] **Step 3: Write the implementations**

```jsx
// src/components/ProgressScreen.jsx
import React from "react";
import Header from "./Header.jsx";
import { CATEGORIES } from "../content/categories.js";
import { TOPICS_BY_CATEGORY } from "../content/index.js";
import { isTopicMastered } from "../lib/scoring.js";

export default function ProgressScreen({ progress, avatar, onBack }) {
  return (
    <main className="result">
      <Header onBack={onBack} avatar={avatar} />
      <section className="panel listPanel">
        <h2>My Progress</h2>
        {CATEGORIES.map(cat => {
          const topics = TOPICS_BY_CATEGORY[cat.id];
          const masteredCount = topics.filter(t => isTopicMastered(progress[t.id])).length;
          return (
            <div key={cat.id} className="progressCategory">
              <h3>{cat.icon} {cat.name} <span className="progressCount">{masteredCount} / {topics.length}</span></h3>
              <div className="stateGrid">
                {topics.map(t => (
                  <div key={t.id} className={"stateChip " + (isTopicMastered(progress[t.id]) ? "mastered" : (progress[t.id]?.attempts ? "tried" : ""))}>
                    <span>{isTopicMastered(progress[t.id]) ? "⭐" : progress[t.id]?.attempts ? "🌱" : "⚪"}</span> {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
```

```jsx
// src/components/LeaderboardScreen.jsx
import React from "react";
import Header from "./Header.jsx";

export default function LeaderboardScreen({ entries, avatar, onBack }) {
  const medals = ["🥇", "🥈", "🥉", "4", "5"];
  return (
    <main className="result">
      <Header onBack={onBack} avatar={avatar} />
      <section className="panel listPanel">
        <h2>Top Mock Test Scores</h2>
        {entries.length === 0 && <div className="emptyState">Take a mock test to get on the leaderboard!</div>}
        {entries.map((e, i) => (
          <div className="leaderRow" key={i}>
            <span className="leaderRank">{medals[i]}</span>
            <span className="leaderAvatar">{e.avatar}</span>
            <div className="leaderInfo"><b>{e.name}</b><small>{e.raw} pts</small></div>
            <span className="leaderPct">{e.pct}%</span>
          </div>
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/ProgressScreen.test.jsx src/components/LeaderboardScreen.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ProgressScreen.jsx src/components/LeaderboardScreen.jsx src/components/ProgressScreen.test.jsx src/components/LeaderboardScreen.test.jsx
git commit -m "Add Progress and Leaderboard screens"
```

---

### Task 31: `components/MixedPractice.jsx` — untimed, cross-category practice

**Files:**
- Create: `src/components/MixedPractice.jsx`
- Test: `src/components/MixedPractice.test.jsx`

**Interfaces:**
- Consumes: `CATEGORIES` from `../content/categories.js`, `TOPICS_BY_CATEGORY` from `../content/index.js`, `QuestionCard` (Task 26), `Header` (Task 25).
- Produces: `<MixedPractice soundOn={bool} avatar={string} onExit={fn}/>`. Shows a category picker (or "Mixed"), then loops through 10 questions pulled round-robin from that category's (or all categories') `getYourTurn()` generators, tracking a simple score, ending in a summary. Consumed by `App.jsx`.

- [ ] **Step 1: Write the failing test**

```jsx
import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MixedPractice from "./MixedPractice.jsx";

describe("MixedPractice (static render)", () => {
  it("starts on the category picker, offering Mixed and all 5 categories", () => {
    const html = renderToStaticMarkup(<MixedPractice soundOn={false} avatar="🦁" onExit={() => {}} />);
    expect(html).toContain("Mixed");
    expect(html).toContain("Analytical Thinking");
    expect(html).toContain("Visual");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/MixedPractice.test.jsx`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```jsx
import React, { useState, useMemo } from "react";
import Header from "./Header.jsx";
import QuestionCard from "./QuestionCard.jsx";
import { CATEGORIES } from "../content/categories.js";
import { TOPICS_BY_CATEGORY } from "../content/index.js";

const QUESTION_COUNT = 10;

function buildSet(categoryId) {
  const topics = categoryId === "mixed"
    ? CATEGORIES.flatMap(c => TOPICS_BY_CATEGORY[c.id])
    : TOPICS_BY_CATEGORY[categoryId];
  const pool = [];
  while (pool.length < QUESTION_COUNT) {
    const topic = topics[pool.length % topics.length];
    pool.push(topic.getYourTurn()[0]);
  }
  return pool;
}

export default function MixedPractice({ soundOn, avatar, onExit }) {
  const [categoryId, setCategoryId] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const questions = useMemo(() => (categoryId ? buildSet(categoryId) : []), [categoryId]);

  if (!categoryId) {
    return (
      <main className="result">
        <Header onBack={onExit} avatar={avatar} />
        <section className="panel listPanel">
          <h2>Mixed Practice</h2>
          <p>Pick a category to practice, untimed, no lives.</p>
          <div className="modes">
            <button className="modeBtn" onClick={() => setCategoryId("mixed")}><span className="levelIcon">🎲</span><span><b>Mixed</b><small>A bit of everything</small></span></button>
            {CATEGORIES.map(c => (
              <button key={c.id} className="modeBtn" onClick={() => setCategoryId(c.id)}>
                <span className="levelIcon">{c.icon}</span><span><b>{c.name}</b></span>
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (index >= questions.length) {
    return (
      <main className="result">
        <Header onBack={onExit} avatar={avatar} />
        <section className="resultHero">
          <h1>Practice complete!</h1>
          <p>You got {score} out of {questions.length} right.</p>
          <button className="startBtn" onClick={onExit}>Back to map</button>
        </section>
      </main>
    );
  }

  return (
    <main className="quiz">
      <Header onBack={onExit} avatar={avatar} />
      <p className="phaseLabel">Question {index + 1} of {questions.length}</p>
      <QuestionCard key={questions[index].id} question={questions[index]} soundOn={soundOn}
        onAnswered={(isCorrect) => { if (isCorrect) setScore(s => s + 1); setIndex(i => i + 1); }} />
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/MixedPractice.test.jsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/MixedPractice.jsx src/components/MixedPractice.test.jsx
git commit -m "Add Mixed Practice mode"
```

---

### Task 32: `components/MockTest.jsx` — the 35-question timed simulation

**Files:**
- Create: `src/components/MockTest.jsx`
- Test: `src/components/MockTest.test.jsx`

**Interfaces:**
- Consumes: `CATEGORIES` from `../content/categories.js`, `TOPICS` from `../content/index.js`, `QuestionCard` (Task 26), `Header` (Task 25), `scoreMockTest` from `../lib/scoring.js` (Task 4), `addLeaderboardEntry` from `../lib/storage.js` (Task 3).
- Produces: `<MockTest avatar={string} playerName={string} onExit={fn}/>` and the exported pure helper `buildMockTestQuestions()` (assembles 35 questions across all topics, marks 7 as `isLQChamp`, shuffles order — separated out so it's unit-testable without rendering).
- **Deliberate scope simplification** (documented here, not accidental): navigation is linear — Next/Skip only, no going back to change a previous answer — which still faithfully implements the timed, no-feedback-until-the-end, negative-marking exam conditions the spec calls for, without building a full flagged-review exam UI. This can be revisited in a future phase if wanted.

- [ ] **Step 1: Write the failing test**

```jsx
import React from "react";
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MockTest, { buildMockTestQuestions } from "./MockTest.jsx";

describe("buildMockTestQuestions", () => {
  it("assembles exactly 35 questions with exactly 7 marked as LQ Champ", () => {
    const qs = buildMockTestQuestions();
    expect(qs.length).toBe(35);
    expect(qs.filter(q => q.isLQChamp).length).toBe(7);
    qs.forEach(q => expect(q.options.length).toBe(4));
  });
});

describe("MockTest (static render)", () => {
  it("starts on the intro screen explaining the rules", () => {
    const html = renderToStaticMarkup(<MockTest avatar="🦁" playerName="Aanya" onExit={() => {}} />);
    expect(html).toMatch(/35 questions/i);
    expect(html).toMatch(/60/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/MockTest.test.jsx`
Expected: FAIL — module does not exist yet.

- [ ] **Step 3: Write the implementation**

```jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import Header from "./Header.jsx";
import QuestionCard from "./QuestionCard.jsx";
import { TOPICS } from "../content/index.js";
import { scoreMockTest } from "../lib/scoring.js";
import { addLeaderboardEntry } from "../lib/storage.js";

const TOTAL_QUESTIONS = 35;
const LQ_CHAMP_COUNT = 7;
const DIFFICULTY_RANK = { hard: 2, medium: 1, easy: 0 };

export function buildMockTestQuestions() {
  const pool = [];
  TOPICS.forEach(topic => {
    pool.push(...topic.getTryTogether(), ...topic.getYourTurn(), ...topic.getYourTurn());
  });
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS);
  const byDifficulty = [...shuffled].sort((a, b) => DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty]);
  const champIds = new Set(byDifficulty.slice(0, LQ_CHAMP_COUNT).map(q => q.id));
  return shuffled.map(q => ({ ...q, isLQChamp: champIds.has(q.id) }));
}

export default function MockTest({ avatar, playerName, onExit }) {
  const [stage, setStage] = useState("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // [{question, chosenId, isAnswered, isCorrect, isLQChamp}]
  const [secondsLeft, setSecondsLeft] = useState(60 * 60);
  const questions = useMemo(() => (stage !== "intro" ? buildMockTestQuestions() : []), [stage === "intro"]);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (stage !== "inProgress") return;
    if (secondsLeft <= 0) { finishTest(); return; }
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [stage, secondsLeft]);

  function start() {
    setStage("inProgress");
    setIndex(0);
    setAnswers([]);
    setSecondsLeft(60 * 60);
  }

  function handleAnswered(isCorrect, optionId) {
    const q = questions[index];
    setAnswers(a => [...a, { question: q, chosenId: optionId, isAnswered: true, isCorrect, isLQChamp: q.isLQChamp }]);
    advance();
  }

  function skip() {
    const q = questions[index];
    setAnswers(a => [...a, { question: q, chosenId: null, isAnswered: false, isCorrect: false, isLQChamp: q.isLQChamp }]);
    advance();
  }

  function advance() {
    if (index === questions.length - 1) finishTest();
    else setIndex(i => i + 1);
  }

  function finishTest() {
    if (!recordedRef.current) {
      recordedRef.current = true;
      const result = scoreMockTest(answers);
      addLeaderboardEntry({ name: playerName || "Explorer", avatar, raw: result.raw, pct: result.pct, date: new Date().toISOString() });
    }
    setStage("results");
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  if (stage === "intro") {
    return (
      <main className="result">
        <Header onBack={onExit} avatar={avatar} />
        <section className="resultHero">
          <h1>Mock Test</h1>
          <p>35 questions, 60 minutes. Correct answers earn 4 points (8 for LQ Champ questions); wrong answers lose 1 point (2 for LQ Champ). Explanations are shown at the end, just like the real test.</p>
          <button className="startBtn" onClick={start}>Start Test</button>
        </section>
      </main>
    );
  }

  if (stage === "inProgress") {
    const q = questions[index];
    return (
      <main className="quiz">
        <Header onBack={onExit} avatar={avatar} />
        <div className="quizTop">
          <span className="eyebrow">QUESTION {index + 1} OF {questions.length}{q.isLQChamp ? " · LQ CHAMP" : ""}</span>
          <div className="timer">{mm}:{ss}</div>
        </div>
        <QuestionCard key={q.id} question={q} soundOn={false} withholdExplanation onAnswered={handleAnswered} />
        <button className="hintBtn" onClick={skip}>Skip this question</button>
      </main>
    );
  }

  if (stage === "results") {
    const result = scoreMockTest(answers);
    return (
      <main className="result">
        <Header onBack={onExit} avatar={avatar} />
        <section className="resultHero">
          <h1>Test Complete!</h1>
          <div className="scoreCircle"><strong>{result.raw}</strong><span>/ {result.maxRaw}</span><small>{result.pct}%</small></div>
          <div className="resultStats">
            <div><b>{result.correctCount}</b><span>Correct</span></div>
            <div><b>{result.wrongCount}</b><span>Wrong</span></div>
            <div><b>{result.unansweredCount}</b><span>Skipped</span></div>
          </div>
          <button className="startBtn" onClick={() => setStage("review")}>Review Answers</button>
        </section>
      </main>
    );
  }

  return (
    <main className="result">
      <Header onBack={onExit} avatar={avatar} />
      <section className="panel listPanel">
        <h2>Question-Wise Review</h2>
        {answers.map((a, i) => (
          <div className="reviewRow" key={a.question.id}>
            <span className={a.isCorrect ? "miniRight" : "miniWrong"}>{a.isCorrect ? "✓" : "!"}</span>
            <div>
              <b>{i + 1}. {a.question.prompt}</b>
              <small>{a.isAnswered ? (a.isCorrect ? a.question.explanation.correct : (a.question.explanation.mistakes[a.chosenId] || a.question.explanation.howTo)) : `Skipped. ${a.question.explanation.howTo}`}</small>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/MockTest.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/MockTest.jsx src/components/MockTest.test.jsx
git commit -m "Add Mock Test mode with 35-question timed simulation"
```

---

### Task 33: Complete `src/styles.css`

**Files:**
- Modify: `src/styles.css` (appends to the base tokens/reset from Task 1)

**Interfaces:**
- Produces: every class name referenced by Tasks 24–32's JSX (`.skillMap`, `.categoryZone`, `.topicRow`, `.topicNode` + `.mastered`/`.locked`/`.unlocked`, `.questionCard`, `.options`/`.option`/`.letter`/`.right`/`.wrong`, `.explanationCard` + `.good`/`.bad`, `.replayBtn`, `.teachCard`/`.teachProgress`/`.teachVisual`/`.teachCaption`, `.phaseLabel`, `.topicDoneCard`, `.header`/`.iconBtn`/`.brand`/`.brandMark`/`.avatarChip`, `.avatarPickerBlock`/`.nameInput`/`.avatarPicker`/`.avatarBtn`, `.confettiCanvas`, `.navChip`, `.panel`/`.listPanel`/`.emptyState`, `.progressCategory`/`.progressCount`/`.stateGrid`/`.stateChip`, `.leaderRow`/`.leaderRank`/`.leaderAvatar`/`.leaderInfo`/`.leaderPct`, `.quiz`/`.quizTop`/`.eyebrow`/`.timer`, `.result`/`.resultHero`/`.scoreCircle`/`.resultStats`, `.review`/`.reviewRow`/`.miniRight`/`.miniWrong`, `.modes`/`.modeBtn`/`.levelIcon`, `.startBtn`/`.nextBtn`/`.hintBtn`). No JS logic — a pure CSS task, verified visually by the Playwright smoke task (Task 35).

- [ ] **Step 1: Append the stylesheet**

Append to `src/styles.css` (after the Task 1 reset/tokens):

```css
button{font:inherit;cursor:pointer;border:0;color:inherit}
.header{height:70px;display:flex;align-items:center;gap:14px;max-width:1050px;margin:auto;padding:0 20px}
.iconBtn{width:40px;height:40px;border-radius:12px;background:#fff;border:1px solid var(--line);display:grid;place-items:center}
.brand{display:flex;align-items:center;gap:9px;margin-right:auto}
.brandMark{width:31px;height:31px;border-radius:10px;background:var(--purple);color:#fff;display:grid;place-items:center;font-size:16px}
.brand b,.brand small{display:block}
.brand b{font-family:"Baloo 2";font-size:17px}
.brand small{font-size:9px;color:#999}
.avatarChip{width:36px;height:36px;border-radius:12px;background:#f3f0ff;display:grid;place-items:center;font-size:19px;border:1px solid var(--line)}

.avatarPickerBlock{margin-bottom:10px}
.nameInput{width:100%;background:#faf8f4;border:2px solid #eeeae3;border-radius:14px;padding:13px 16px;font-size:15px;font-weight:700;margin:10px 0 16px;color:var(--ink)}
.nameInput:focus{outline:none;border-color:var(--purple)}
.avatarPicker{display:grid;grid-template-columns:repeat(auto-fit,minmax(56px,1fr));gap:10px;margin-bottom:10px}
.avatarBtn{background:#faf8f4;border:2px solid transparent;border-radius:16px;font-size:26px;padding:10px 0}
.avatarBtn.active{background:#f3f0ff;border-color:var(--purple)}

.skillMap{max-width:900px;margin:auto;padding:30px 20px 60px}
.skillMapHero h1{font-family:"Baloo 2";font-size:clamp(24px,5vw,34px);margin:0 0 6px}
.skillMapHero p{color:var(--muted);margin:0 0 24px}
.categoryZone{background:#fff;border:1px solid var(--line);border-radius:24px;padding:20px;margin-bottom:16px;border-left:6px solid var(--zoneColor)}
.categoryZone h2{font-family:"Baloo 2";font-size:19px;margin:0 0 14px;display:flex;align-items:center;gap:8px}
.categoryIcon{font-size:20px}
.topicRow{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.topicNode{display:flex;flex-direction:column;align-items:center;gap:6px;background:#faf9f6;border:2px solid #eeeae3;border-radius:16px;padding:16px 10px;font-weight:800;font-size:13px;text-align:center}
.topicNode.mastered{background:#fff8df;border-color:#f0d989}
.topicNode.locked{opacity:.5;cursor:not-allowed}
.topicNodeIcon{font-size:22px}
.skillMapFooter{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.navChip{flex:1;min-width:140px;display:flex;align-items:center;justify-content:center;gap:7px;background:#faf8f4;border:1px solid var(--line);border-radius:13px;padding:12px;font-weight:800;font-size:13px;color:var(--purple)}

.topicView{max-width:760px;margin:auto;padding:0 20px 40px}
.topicHeaderRow h1{font-family:"Baloo 2";font-size:clamp(20px,5vw,28px);text-align:center}
.phaseLabel{text-align:center;color:var(--muted);font-weight:800;font-size:13px;margin-bottom:10px}

.teachCard{background:#fff;border:1px solid var(--line);border-radius:24px;padding:30px;text-align:center}
.teachProgress{color:#9a96a1;font-size:12px;font-weight:800;margin-bottom:10px}
.teachVisual{margin:10px auto}
.teachCaption{font-size:18px;line-height:1.5;margin:16px 0 24px}

.questionCard{background:#fff;border:1px solid var(--line);border-radius:24px;padding:26px;text-align:center}
.questionFigure{display:flex;justify-content:center;margin-bottom:12px}
.questionCard h2{font-family:"Baloo 2";font-size:clamp(18px,4.5vw,24px);margin:0 0 20px}
.options{display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:left}
.option{min-height:56px;background:#faf9f6;border:2px solid #eeeae3;border-radius:16px;padding:10px 13px;display:flex;align-items:center;gap:12px;font-weight:800}
.option.right{border-color:#63c795;background:#effaf4;color:#16794b}
.option.wrong{border-color:#eb8c8c;background:#fff1f1;color:#aa3f3f}
.letter{width:30px;height:30px;border-radius:9px;background:#fff;border:1px solid #e7e2da;display:grid;place-items:center;font-size:12px;color:#8b8791}
.explanationCard{display:flex;align-items:center;gap:10px;text-align:left;margin-top:18px;padding:13px 15px;border-radius:15px}
.explanationCard.good{background:#effaf4}
.explanationCard.bad{background:#fff4e9}
.explanationIcon{font-size:22px}
.replayBtn{background:#fff;border:1px solid var(--line);border-radius:10px;padding:8px}
.hintBtn{background:transparent;color:var(--purple);font-size:12px;font-weight:900;margin-top:14px;display:block;margin-left:auto;margin-right:auto}

.topicDoneCard{text-align:center;background:#fff;border:1px solid var(--line);border-radius:24px;padding:34px}
.topicDoneIcon{font-size:50px}

.startBtn{margin-top:16px;width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:var(--ink);color:#fff;padding:16px 20px;border-radius:16px;font-weight:900;font-size:16px}
.nextBtn{width:100%;margin-top:15px;border-radius:14px;background:var(--purple);color:#fff;padding:14px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:8px}

.confettiCanvas{position:fixed;inset:0;pointer-events:none;z-index:50}

.panel{background:#fff;border:1px solid var(--line);border-radius:30px;padding:24px;box-shadow:0 22px 55px #493b2612}
.panel h2{font-family:"Baloo 2";font-size:22px;margin:0 0 16px}
.listPanel{max-width:650px;margin:20px auto}
.emptyState{background:#faf8f4;border-radius:14px;padding:20px;text-align:center;color:var(--muted)}

.progressCategory{margin-bottom:20px}
.progressCategory h3{font-size:15px;margin:0 0 8px;display:flex;justify-content:space-between}
.progressCount{color:var(--muted);font-weight:700}
.stateGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}
.stateChip{background:#faf8f4;border-radius:12px;padding:10px 12px;font-size:12.5px;font-weight:700;display:flex;align-items:center;gap:7px}
.stateChip.mastered{background:#fff8df;color:#8a6c1f}
.stateChip.tried{background:#f3f0ff;color:#5c4fae}

.leaderRow{display:flex;align-items:center;gap:12px;padding:12px 6px;border-bottom:1px solid #f1ede8}
.leaderRank{width:28px;text-align:center;font-weight:900}
.leaderAvatar{font-size:22px}
.leaderInfo{flex:1}
.leaderInfo b{display:block;font-size:14px}
.leaderInfo small{color:var(--muted);font-size:11px}
.leaderPct{font-weight:900;color:var(--orange)}

.quiz,.result{max-width:800px;margin:auto;padding-bottom:30px}
.quizTop{display:flex;justify-content:space-between;align-items:center;margin:20px}
.eyebrow{font-size:11px;color:#8d8997;font-weight:900}
.timer{background:#fff;border:1px solid var(--line);border-radius:12px;padding:9px 12px;font-weight:900;font-size:13px}

.resultHero{text-align:center;padding:30px 20px}
.resultHero h1{font-family:"Baloo 2";font-size:clamp(24px,6vw,34px)}
.scoreCircle{width:130px;height:130px;border-radius:50%;border:10px solid #ded1ff;background:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;margin:16px auto}
.scoreCircle strong{font-family:"Baloo 2";font-size:36px}
.resultStats{display:flex;justify-content:center;gap:24px;margin-top:10px}
.resultStats b{display:block;font-size:18px}
.resultStats span{font-size:10px;color:#96919d;text-transform:uppercase}

.review,.reviewRow{text-align:left}
.reviewRow{display:flex;gap:12px;padding:10px 2px;border-bottom:1px solid #f1ede8}
.miniRight,.miniWrong{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:12px}
.miniRight{background:#dcf5e8;color:#16804f}
.miniWrong{background:#ffe4e4;color:#b04444}

.modes{display:grid;gap:10px;margin-bottom:16px}
.modeBtn{display:flex;align-items:center;text-align:left;gap:14px;background:#faf8f4;border:2px solid transparent;border-radius:17px;padding:13px 15px}
.levelIcon{font-size:22px}

@media(max-width:700px){
  .options{grid-template-columns:1fr}
  .resultStats{gap:14px}
  .header{flex-wrap:wrap;height:auto;padding:12px 16px;gap:8px}
  .quizTop{flex-wrap:wrap;gap:10px;margin:16px}
  .questionCard,.teachCard,.topicDoneCard{padding:18px}
  .skillMapFooter{flex-direction:column}
  .categoryZone{padding:14px}
}
@media(max-width:400px){
  .avatarPicker{grid-template-columns:repeat(4,1fr)}
  .topicRow{grid-template-columns:1fr 1fr}
}
```

- [ ] **Step 2: Verify the build still succeeds**

Run: `npm run build`
Expected: build succeeds with no CSS syntax errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "Complete stylesheet for all screens and components"
```

---

### Task 34: `App.jsx` — wire every screen together

**Files:**
- Modify: `src/App.jsx` (replaces the Task 1 placeholder entirely)
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: `KEYS`, `loadJSON`, `saveJSON`, `loadProgress`, `loadLeaderboard` from `./lib/storage.js`; `AvatarPicker`, `AVATARS` from `./components/AvatarPicker.jsx`; `SkillMap`, `TopicView`, `MixedPractice`, `MockTest`, `ProgressScreen`, `LeaderboardScreen`, `Header` from `./components/*`; `getTopic` from `./content/index.js`.
- Produces: the full app. Screen state: `'onboarding' | 'skillmap' | 'topic' | 'mixedPractice' | 'mockTest' | 'progress' | 'leaderboard'`. Shows `AvatarPicker` (as a one-time onboarding screen) when no player name is stored yet; otherwise starts on `SkillMap`.

- [ ] **Step 1: Write the failing test**

```jsx
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

function makeMemoryStorage() {
  let store = {};
  return { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, clear: () => { store = {}; } };
}

describe("App (static render)", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", makeMemoryStorage());
    vi.resetModules();
  });

  it("shows onboarding (avatar picker) when no player name is stored", async () => {
    const { default: App } = await import("./App.jsx");
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Who's playing?");
  });

  it("shows the skill map directly when a player name is already stored", async () => {
    localStorage.setItem("lq-player-name", JSON.stringify("Aanya"));
    const { default: App } = await import("./App.jsx");
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Analytical Thinking");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.jsx`
Expected: FAIL — current `App.jsx` is still the Task 1 placeholder.

- [ ] **Step 3: Write the implementation**

```jsx
import React, { useState } from "react";
import { KEYS, loadJSON, saveJSON, loadProgress, loadLeaderboard } from "./lib/storage.js";
import AvatarPicker, { AVATARS } from "./components/AvatarPicker.jsx";
import SkillMap from "./components/SkillMap.jsx";
import TopicView from "./components/TopicView.jsx";
import MixedPractice from "./components/MixedPractice.jsx";
import MockTest from "./components/MockTest.jsx";
import ProgressScreen from "./components/ProgressScreen.jsx";
import LeaderboardScreen from "./components/LeaderboardScreen.jsx";
import { getTopic } from "./content/index.js";

export default function App() {
  const [avatar, setAvatar] = useState(() => loadJSON(KEYS.AVATAR, AVATARS[0]));
  const [playerName, setPlayerName] = useState(() => loadJSON(KEYS.NAME, ""));
  const [screen, setScreen] = useState(() => (loadJSON(KEYS.NAME, "") ? "skillmap" : "onboarding"));
  const [currentTopicId, setCurrentTopicId] = useState(null);
  const [soundOn, setSoundOn] = useState(true);

  function changeAvatar(a) { setAvatar(a); saveJSON(KEYS.AVATAR, a); }
  function changeName(n) { setPlayerName(n); saveJSON(KEYS.NAME, n); }
  function finishOnboarding() { setScreen("skillmap"); }
  function openTopic(id) { setCurrentTopicId(id); setScreen("topic"); }
  function backToMap() { setScreen("skillmap"); }

  return (
    <div className="app">
      <div className="ambient a1" /><div className="ambient a2" />

      {screen === "onboarding" && (
        <main className="home">
          <AvatarPicker avatar={avatar} playerName={playerName} onChangeAvatar={changeAvatar} onChangeName={changeName} />
          <button className="startBtn" onClick={finishOnboarding} disabled={!playerName.trim()}>Start learning!</button>
        </main>
      )}

      {screen === "skillmap" && (
        <SkillMap
          progress={loadProgress()}
          avatar={avatar}
          onOpenTopic={openTopic}
          onOpenMixedPractice={() => setScreen("mixedPractice")}
          onOpenMockTest={() => setScreen("mockTest")}
          onOpenProgress={() => setScreen("progress")}
          onOpenLeaderboard={() => setScreen("leaderboard")}
        />
      )}

      {screen === "topic" && (
        <TopicView topic={getTopic(currentTopicId)} soundOn={soundOn} avatar={avatar} onExit={backToMap} />
      )}

      {screen === "mixedPractice" && <MixedPractice soundOn={soundOn} avatar={avatar} onExit={backToMap} />}

      {screen === "mockTest" && <MockTest avatar={avatar} playerName={playerName} onExit={backToMap} />}

      {screen === "progress" && <ProgressScreen progress={loadProgress()} avatar={avatar} onBack={backToMap} />}

      {screen === "leaderboard" && <LeaderboardScreen entries={loadLeaderboard()} avatar={avatar} onBack={backToMap} />}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/App.test.jsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Run the full unit test suite**

Run: `npm test`
Expected: all tests across every task pass.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "Wire all screens together in App.jsx"
```

---

### Task 35: End-to-end smoke verification (Playwright, matching india-capital-quest's approach)

**Files:**
- Create: `scripts/smoke.js` (not part of the shipped app — a one-off verification script, same pattern used for india-capital-quest)

**Interfaces:**
- Consumes: the running dev server at `http://localhost:5173`; `playwright-core` + a system Chrome install (`/usr/bin/google-chrome-stable`, or whatever this machine has — check with `which google-chrome-stable || which chromium`).
- Produces: screenshots under `scripts/screenshots/` and console assertions proving: onboarding → skill map works, a full Teach → Try Together → Your Turn loop completes for one topic with a spoken explanation actually triggered on a wrong answer, Mixed Practice completes, a full Mock Test run completes and reaches the review screen, Progress and Leaderboard screens render, and the skill map/topic/quiz screens look correct at mobile (375×667), tablet (820×1180), and desktop (1280×900) widths.

- [ ] **Step 1: Confirm tooling (same as india-capital-quest)**

Run: `node --version` (needs 20+; use `nvm use 22` if this machine's default is older, and `npm install --no-save playwright-core` in a scratch dir if not already available) and `which google-chrome-stable || which chromium`.

- [ ] **Step 2: Write `scripts/smoke.js`**

```js
const { chromium } = require("playwright-core");

async function shot(page, path) { await page.screenshot({ path, fullPage: true }); }

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome-stable", args: ["--no-sandbox"] });
  const errors = [];

  // Spy on speechSynthesis.speak before the page's own script runs, so we can prove
  // a spoken explanation actually fires on a wrong answer.
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => {
    window.__speakCalls = [];
    window.speechSynthesis = {
      getVoices: () => [{ name: "Test Voice", lang: "en-US" }],
      cancel: () => {},
      speak: (utterance) => { window.__speakCalls.push(utterance.text); },
    };
    window.SpeechSynthesisUtterance = function (text) { this.text = text; };
  });
  const page = await ctx.newPage();
  page.on("pageerror", e => errors.push(String(e)));

  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForSelector("text=Who's playing?");
  await page.fill(".nameInput", "Aanya");
  await page.click("button:has-text('🦁')");
  await page.click("text=Start learning!");
  await page.waitForSelector("text=Analytical Thinking");
  await shot(page, "scripts/screenshots/desktop-skillmap.png");

  // Full Teach -> Try Together -> Your Turn loop for Series Completion, forcing a wrong answer.
  await page.click("text=Series Completion");
  await page.waitForSelector("text=Let's practice!");
  await shot(page, "scripts/screenshots/desktop-teach.png");
  await page.click("text=Let's practice!");
  await page.waitForSelector(".questionCard");

  for (let i = 0; i < 6; i++) { // 2 tryTogether + 4 yourTurn
    const options = page.locator(".option");
    await options.first().click(); // deliberately often wrong, to exercise the explanation path
    await page.waitForSelector(".explanationCard");
    const continueBtn = page.locator("button:has-text('Continue')");
    if (await continueBtn.count()) { await continueBtn.click(); }
    await page.waitForTimeout(150);
  }
  await page.waitForSelector("text=/Topic mastered|Nice practice/");
  await shot(page, "scripts/screenshots/desktop-topic-done.png");
  const speakCallCount = await page.evaluate(() => window.__speakCalls.length);
  console.log("speechSynthesis.speak call count (expect > 0):", speakCallCount);

  await page.click("button[aria-label='Home']");
  await page.waitForSelector("text=Analytical Thinking");

  // Mixed Practice
  await page.click("text=Mixed Practice");
  await page.click("text=Mixed");
  for (let i = 0; i < 10; i++) {
    const stillGoing = await page.locator(".option").count();
    if (!stillGoing) break;
    await page.locator(".option").first().click();
    await page.waitForSelector(".explanationCard");
    await page.click("button:has-text('Continue')");
    await page.waitForTimeout(120);
  }
  await page.waitForSelector("text=Practice complete!");
  await page.click("button[aria-label='Home']");

  // Mock Test — full run
  await page.click("text=Mock Test");
  await page.click("text=Start Test");
  for (let i = 0; i < 35; i++) {
    const done = await page.locator("text=Test Complete!").count();
    if (done) break;
    await page.locator(".option").first().click();
    await page.waitForTimeout(100);
  }
  await page.waitForSelector("text=Test Complete!");
  await shot(page, "scripts/screenshots/desktop-mocktest-result.png");
  await page.click("text=Review Answers");
  await page.waitForSelector("text=Question-Wise Review");
  await shot(page, "scripts/screenshots/desktop-mocktest-review.png");

  await page.click("button[aria-label='Home']");
  await page.click("text=My Progress");
  await shot(page, "scripts/screenshots/desktop-progress.png");
  await page.click("button[aria-label='Home']");
  await page.click("text=Leaderboard");
  await shot(page, "scripts/screenshots/desktop-leaderboard.png");

  console.log("Page errors:", JSON.stringify(errors));
  await ctx.close();

  // Mobile + tablet viewport checks on the skill map and a topic screen
  for (const [label, viewport] of [["mobile", { width: 375, height: 667 }], ["tablet", { width: 820, height: 1180 }]]) {
    const c = await browser.newContext({ viewport });
    const p = await c.newPage();
    await p.goto("http://localhost:5173", { waitUntil: "networkidle" });
    await p.waitForSelector("text=Who's playing?");
    await p.fill(".nameInput", "Aanya");
    await p.click("text=Start learning!");
    await p.waitForSelector("text=Analytical Thinking");
    await shot(p, `scripts/screenshots/${label}-skillmap.png`);
    await p.click("text=Series Completion");
    await shot(p, `scripts/screenshots/${label}-teach.png`);
    await c.close();
  }

  await browser.close();
})();
```

- [ ] **Step 3: Start the dev server and run the script**

Run:
```bash
(npm run dev > /tmp/lq-vite.log 2>&1 &)
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done'
mkdir -p scripts/screenshots
node scripts/smoke.js
```
Expected: script completes with no thrown errors, `speechSynthesis.speak call count (expect > 0)` prints a number greater than 0, `Page errors: []`.

- [ ] **Step 4: Look at the screenshots**

Read each PNG under `scripts/screenshots/` and visually confirm: the skill map shows all 5 categories with readable topic nodes at all 3 viewport widths, the teach card and question card are legible on mobile (no horizontal overflow, tap targets look big enough), the mock test result/review screens are readable.

- [ ] **Step 5: Stop the dev server and commit**

```bash
lsof -ti:5173 -sTCP:LISTEN | xargs -r kill
git add scripts/smoke.js
git commit -m "Add end-to-end smoke verification script"
```

---

### Task 36: Deploy — GitHub + Vercel

**Files:** none (operational task only)

**Interfaces:** none — this task publishes the repo built by Tasks 1–35.

- [ ] **Step 1: Check GitHub auth**

Run: `gh auth status`. If the authenticated account is not `sushiljain07`, ask the user for a personal access token (repo scope) for `sushiljain07` and use it only in-memory for this task, exactly as was done for india-capital-quest — never write it into `.git/config` or any file.

- [ ] **Step 2: Create the GitHub repo**

```bash
curl -s -X POST -H "Authorization: token $GH_PAT" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"logiqids-quest","description":"A teach-first learning app to help a class 3 student build LogiQids reasoning skills","private":false}'
```
Expected: JSON response with `"full_name": "sushiljain07/logiqids-quest"`.

- [ ] **Step 3: Push**

```bash
git remote add origin https://github.com/sushiljain07/logiqids-quest.git
AUTH=$(printf 'x-access-token:%s' "$GH_PAT" | base64 -w0)
git -c http.extraheader="AUTHORIZATION: basic $AUTH" push -u origin main
```
Expected: `main -> main` pushed successfully. Confirm `git remote -v` and `.git/config` contain no token afterward.

- [ ] **Step 4: Deploy to Vercel**

Run: `npx vercel whoami`. If logged in, run `npx vercel --prod --yes` from the project root (auto-detects the Vite React app, no config needed) and capture the deployment URL. If not logged in, ask the user to run `vercel login` themselves (same as was done for india-capital-quest), then either deploy via CLI or have them import the GitHub repo through the Vercel dashboard.

- [ ] **Step 5: Verify the live deployment**

Run the mobile/tablet/desktop viewport checks from Task 35's `scripts/smoke.js` against the live URL instead of `localhost:5173` (temporarily edit the `page.goto` URLs, or pass the URL as an argument), confirming the same onboarding → skill map → topic loop → mock test flow works in production with no console errors.

---

## Self-review notes

- **Spec coverage:** teach-first loop (Tasks 27–28), 15 v1 topics across all 5 categories (Tasks 8–22), spoken mistake-specific explanations with a general fallback (Tasks 5, 26, all content tasks), skill map with unlocking (Task 29), avatar/name (Tasks 25, 34), Mixed Practice (Task 31), Mock Test with negative marking + LQ Champ (Tasks 4, 32), Progress + Leaderboard (Tasks 3, 30), mobile/desktop responsiveness (Task 33 + verified in Task 35), deployment (Task 36). No spec section is without a task.
- **Placeholder scan:** every step contains real, runnable code; no `TODO`/`TBD`/"add appropriate X" phrasing anywhere above.
- **Type consistency:** `Question.explanation` is `{correct, howTo, mistakes}` everywhere (Tasks 8–22 all follow it); `QuestionCard.onAnswered(isCorrect, optionId)` signature is used consistently by `TopicView`, `MixedPractice`, and `MockTest`; `isTopicMastered({attempts, correct})` and `scoreMockTest(answers)` signatures from Task 4 are used unchanged in Tasks 28–30 and 32; `TOPICS`/`TOPICS_BY_CATEGORY`/`getTopic` from Task 23 are used unchanged in Tasks 29–32 and 34.
