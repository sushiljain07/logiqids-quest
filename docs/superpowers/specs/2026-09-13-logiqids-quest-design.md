# LogiQids Quest — Design Spec

## Purpose

A local, browser-based learning app to help a class 3 student build the
reasoning skills tested by the LogiQids assessment, in a way she wants
to spend time in — not a raw quiz bank. Teaching comes first; questions
reinforce what was just taught, and every mistake gets a spoken,
mistake-specific explanation.

Modeled on the real LogiQids Class 3 test structure (confirmed from her
own practice-test screenshots): 5 skill categories — **Analytical
Thinking, Verbal, Visual, Numerical Ability, Memory & Concentration** —
Easy/Medium/Hard difficulty, and a real exam shape of 35 questions /
60 minutes / 25% negative marking / bonus "LQ Champ" questions worth
double.

## Goals

- Primary experience is **learning a concept**, not answering cold questions.
- Every wrong answer gets an explanation that is specific to *that*
  mistake, read aloud (auto-playing), not just "the right answer is X."
- Feels like a place worth exploring: a skill map with topics to
  unlock and badges to collect, not a "Start Quiz" button.
- Fully local: no backend, no accounts, no paid services. Runs the
  same way as india-capital-quest (React + Vite, static build, Vercel).
- Covers all 5 official categories so practice matches the real test's
  shape and vocabulary.

## Non-goals (v1)

- Not attempting to reproduce LogiQids' actual copyrighted question
  bank — all content here is original, modeled on the same *subtypes*
  seen in her practice screenshots.
- Not building all ~30-40 possible topics up front — v1 ships 3 topics
  per category (15 total); more can be added the same way later.
- No server-recorded progress, no multi-device sync, no real TTS
  service — browser `speechSynthesis` only.

## Tech stack

Same as india-capital-quest: React 18 + Vite, plain CSS (no framework),
`lucide-react` for icons, all state in `localStorage`. New repo
`logiqids-quest`, new Vercel project, new GitHub repo under
`sushiljain07`.

## Content model

```
CATEGORIES = [
  { id: "analytical", name: "Analytical Thinking", icon, color },
  { id: "verbal", name: "Verbal", icon, color },
  { id: "visual", name: "Visual", icon, color },
  { id: "numerical", name: "Numerical Ability", icon, color },
  { id: "memory", name: "Memory & Concentration", icon, color },
]

TOPIC = {
  id, categoryId, title,
  teach: { steps: [ {caption, visual} ] },      // animated walkthrough
  tryTogether: [ QUESTION ],                     // 2-3, hints always visible
  yourTurn: [ QUESTION ],                        // 4-6, scored for mastery
}

QUESTION = {
  id, prompt, render: "text" | "svg",
  options: [ { id, label/svg } ],
  answer: optionId,
  explanation: { correct: text, mistakes: { [wrongOptionId]: text } },
  difficulty: "easy" | "medium" | "hard",
}
```

- **Text categories** (Analytical, Verbal, Numerical, Memory): each
  topic is backed by a small set of parameterized templates (numbers,
  words, letters randomized per instance), the same pattern
  `buildQuestion()` used in india-capital-quest — a little code,
  a lot of effective variety.
- **Visual category**: hand-authored SVG puzzles per topic (curated,
  not generated) — correctness matters more than infinite variety, and
  auto-generating e.g. an unambiguous "count the triangles" figure is
  unreliable.
- Every question carries a `mistakes` map keyed by wrong option id, so
  feedback is specific ("you picked B — that double-counts the small
  triangle") rather than generic.

## The learning loop

Home screen = **skill map**: 5 category zones (color-coded), each
showing its 3 topic nodes as locked/unlocked/mastered. No quiz button
on the home screen.

Opening a topic:
1. **Teach** — a short step-by-step animated/illustrated explainer
   (captions + a visual that builds up, e.g. a triangle splitting into
   labelled sub-triangles one at a time). Purely instructional, no
   scoring.
2. **Try Together** — 2-3 questions with hints visible from the start
   (not gated behind a wrong answer), framed as "let's figure this out
   together."
3. **Your Turn** — 4-6 questions, each answer (right or wrong) shows a
   "Why?" card with text + a speaker icon; on a **wrong** answer the
   mistake-specific explanation **auto-plays** via `speechSynthesis`
   (replay button + a global sound toggle still apply). Getting most
   of these right awards a star/badge for the topic and unlocks the
   next one on the map.

## Audio explanations

Uses the browser's built-in `window.speechSynthesis` —
`SpeechSynthesisUtterance` per explanation string, no external API,
no audio files, works offline. Rate slightly slowed for clarity, picks
a female/child-friendly voice if the browser exposes one, else default.
A global sound toggle (reused from india-capital-quest) mutes it; a
per-card replay button lets her hear it again.

## Secondary modes (reached from the skill map, not the home screen)

- **Mixed Practice**: untimed, pick a category (or Mixed) + difficulty,
  pulls from the same question templates/bank, same "Why?" cards.
- **Mock Test**: 35 questions assembled to mirror the real paper's mix
  of categories/difficulties, ~7 flagged "LQ Champ" (double marks),
  60-minute countdown, scoring: correct +4 (LQ Champ +8), wrong −1
  (LQ Champ −2), unanswered 0. Explanations are withheld until the
  post-test review screen, matching real exam conditions.

## Gamification (reused patterns from india-capital-quest)

- Avatar + name picker on first visit (new localStorage namespace,
  e.g. `lq-avatar`, `lq-player-name`).
- Points/streak during Try Together/Your Turn, sound effects,
  confetti on topic mastery / high mock-test scores.
- **Progress**: per-category mastery (not per-state) — how many of
  the 3 v1 topics in each category are mastered.
- **Leaderboard**: local top-5 mock-test scores with name/avatar.

## v1 topic list (15 topics)

| Category | Topics |
|---|---|
| Analytical Thinking | Series Completion · Odd One Out · Analogies |
| Verbal | Compound Word Matching · Which Letter Am I? · Spelling Detective |
| Numerical Ability | Balance the Equation · Greatest/Smallest Number · Word Problems |
| Memory & Concentration | Coded Language · Who's Fastest? · Spot the Pattern |
| Visual | Count the Shapes · Hidden Figure Hunt · Spot the Difference |

## Persistence (localStorage keys)

`lq-avatar`, `lq-player-name`, `lq-progress` (per-topic mastery),
`lq-leaderboard` (mock test top 5), `lq-best-streak`.

## Verification approach

Same as india-capital-quest: build with `vite build`, then drive the
app with a headless-browser smoke script (playwright-core + system
Chrome) exercising the Teach→Try Together→Your Turn loop for at least
one topic per category, a full mock test run, and mobile/tablet/desktop
viewport screenshots — before calling anything done.

## Deployment

Same flow as india-capital-quest: git repo → GitHub
(`sushiljain07/logiqids-quest`, public) → Vercel (auto-deploy from
GitHub).

## Future phases (explicitly out of scope for v1)

- More topics per category (paper folding, image completion,
  word-in-grid, logic-grid deduction, day/date reasoning, anagrams,
  sequencing events).
- Daily-challenge / spaced-repetition review of previously mastered
  topics.
- Difficulty auto-adjustment based on performance.
