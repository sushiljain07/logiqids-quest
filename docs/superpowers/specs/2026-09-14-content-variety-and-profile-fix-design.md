# Content Variety & Profile Fix — Design Spec

## Purpose

Three issues reported after real use:

1. Visual-category questions repeat constantly.
2. Once a name/avatar is set on first visit, there's no way to change it —
   the onboarding screen is unreachable again.
3. Across every category, questions "feel" repeated: same sentence/logic
   template, only the numbers or letters change.

Root cause for (1) and (3) is the same: each of the 15 v1 topics is backed
by exactly **one** narrow template. `wordProblems` only ever produces one
of 3 arithmetic sentence shapes; `countTheShapes` has 2 figure families
with 3 size configs each (~6 distinct figures, period); `spotTheDifference`
draws from a single hardcoded scene with 5 possible edits; `codedLanguage`
cycles through 3 canned word groups. Randomizing numbers inside one
template was never going to read as variety.

13 sample LogiQids worksheets (provided by the user, `Skill: Numerical
Ability` / `Verbal` / `Memory and Concentration` headers) were reviewed to
ground this fix in what the real test actually asks, rather than guessing.

## Scope decisions (confirmed with user)

- Profile: **single mutable profile** — rename/re-pick avatar any time,
  same progress carries over. Not multi-profile/multi-save-slot.
- Content: **broaden every existing topic with new variants AND add new
  topics** for subtypes the samples show that aren't covered at all.

## Part A — Profile switching

**Files:** `src/App.jsx`, `src/components/SkillMap.jsx`,
`src/components/AvatarPicker.jsx` (+ their `.test.jsx`).

- `App.jsx` gains an `editingProfile` boolean (default `false`).
- New `openEditProfile()`: `setEditingProfile(true); setScreen("onboarding")`.
- `finishOnboarding()`: `setEditingProfile(false); setScreen("skillmap")`
  (same destination either way — first-run and edit both land on the skill
  map).
- `AvatarPicker` takes an `editing` prop:
  - heading: `"Who's playing?"` (first run) vs `"Edit your profile"` (editing)
  - the primary button (rendered by `App.jsx`, not `AvatarPicker`) reads
    `"Start learning!"` vs `"Save"`, same disabled-when-empty rule.
- `SkillMap` gains an `onEditProfile` prop and a new footer `navChip`
  (Edit icon from `lucide-react`, label "Edit Profile"), placed before the
  sound toggle.
- No Cancel button: name/avatar already save to `localStorage` live as you
  type/click (pre-existing behavior on first run) — editing reuses that,
  it doesn't need a draft/commit system for a local single-player app.
- Existing progress/leaderboard keys (`lq-progress`, `lq-leaderboard`,
  `lq-best-streak`) are untouched by an edit.

## Part B — Content variety

### B.0 Shared approach

Every generator below keeps returning the same `QUESTION` shape the app
already uses (see `src/content/index.js` header comment / existing topic
files) — `{ id, categoryId, topicId, difficulty, prompt, figure,
options, answerId, explanation: { correct, howTo, mistakes } }`. No
change to `QuestionCard`, `FigureSVG`, `scoring.js`, or the mock
test/mixed-practice assembly logic — this is purely a content-layer
change plus the two figure-library additions noted in B.2.

Pattern for adding variety to an existing topic: replace the single
`buildX()`/`xInstance()` helper with 3-5 independent variant builders,
and have `generateXQuestion(difficulty, index)` pick one at random
(`pick(VARIANT_BUILDERS)` or weighted by difficulty where a variant is
inherently harder). Each variant keeps its own `howTo` and per-option
`mistakes` text, matching the existing mistake-specificity requirement.

### B.1 Broadened variants per existing topic

**`analytical/seriesCompletion.js`**
- Existing: arithmetic `+step` sequence.
- Add: geometric (`×2`/`÷2`, e.g. `720, 360, 180, ?, 45`), alternating
  add/subtract (`+a,-b,+a,-b…`), alphanumeric hybrid where digit and
  letter both step together (`1z, 3y, 5x, ?` → digit +2, letter −1).

**`analytical/oddOneOut.js`**
- Existing: word-category variant, multiples-of-N variant.
- Add: place-value variant (`4 hundreds` / `40 tens` / `400 ones` /
  `400 tens` — three phrasings of 400, one that isn't).

**`analytical/analogies.js`**
- Existing: opposites, baby-animals.
- Add: function/action pairs (`bulb:glow :: fan:rotate`), category/role
  pairs (`dog:pet :: housefly:pest`), tool-use pairs (`pen:write ::
  scissors:cut`).

**`verbal/compoundWords.js`**
- Existing: join two full words into one real word.
- Add: stem-completion variant — given a word missing its first letters
  (`_AT`), which set of candidate letters *each* produce a real word when
  prepended (`C,D,E,F` → CAT/DAT?/EAT/FAT — only sets where every letter
  works are valid distractors/answer). Broadens "combining word parts"
  without inventing an unrelated topic.

**`verbal/whichLetterAmI.js`**
- Existing: letter appearing once in word A, twice in word B.
- Add: letter-midway-between-two-letters in a *shuffled* custom alphabet
  order (matches sample worksheet's `Y A C B E D F I J H K M N O Q P R U
  V X T Z` style) — generate a random derangement-ish shuffle of A-Z,
  ask for the letter exactly midway between two given letters by index.

**`verbal/spellingDetective.js`**
- Existing: spot the one misspelled word among 4.
- Add: hidden-word-in-letter-grid (a short run-on string like
  `DIWNDLETTUCEFIGERATOR` conceals one real word — build by concatenating
  2-3 decoy fragments around a real word from a small word bank, ask
  which word is hidden); "odd family" variant (3 words share a rhyme/
  suffix family from a real word, e.g. GOLD/OLD/SOLD/SCOLD, one option
  set doesn't rhyme the same way).

**`numerical/balanceEquation.js`**
- Existing: which of +,−,×,÷ makes an equation true.
- Add: column-addition digit-solve (`2A + B6 = 89`, solve for one
  labeled digit — reuse the existing "try each digit" explanation style),
  digit-extraction variant (`30 × 4 = A_B_C`, find one specific digit of
  the product, matching the sample's "find B" phrasing).

**`numerical/greatestSmallest.js`**
- Existing: arrange digits for greatest/smallest, with ordered/near-miss/
  random distractors. Kept as-is — this one already has good structural
  variety (order matters, 3 distinct wrong-reason categories); no changes
  planned here.

**`numerical/wordProblems.js`**
- Existing: add/sub/mul story problems (one sentence shape each).
- Add: comparison-deduction (3 named people/things, 2-3 relative clues,
  solve for one value — mirrors the P/Q/R exam-marks sample), table-
  lookup ("who studied the longest" from a small generated
  name→duration table), two-step transform ("find the difference of X
  and Y, then swap the tens and units digits — what's the result?").

**`memory/codedLanguage.js`**
- Existing: 3 hardcoded word groups, cycled by `index % 3`.
- Expand `GROUPS` pool to ~12 entries (still small hand-authored sets,
  since the *logic* is what needs to vary, not word-bank size) and pick
  randomly rather than cycling by index.
- Add chain-relabeling variant: a chain of N (3-5) words where each is
  "called" the next (`lead called stick, stick called nib, nib called
  needle, needle called rope, rope called lead`), ask what fills a role
  that maps back through the chain (matches the "fitted in a pen" sample).
- Add combination-chart variant: a small lookup table of `A + B = C`
  style combination rules (reusing the color-mixing chart idea generically
  — could be colors, or any two small named sets combined pairwise), ask
  for the result of a 1-2 step chained lookup.
- All three variants share the topic's existing teach concept ("things get
  renamed/transformed by a rule — track the rule, don't use the original
  name/value"), so one `teach.steps` update covers all three plus a line
  introducing the chain/chart flavors.

**`memory/whosFastest.js`**
- Existing: 2 clues chaining exactly 3 named things, ask fastest/slowest.
- Add: 4-item chains (3 clues), and a "who's NOT mentioned" trap variant
  reusing the existing decoy-animal mechanism but asking a question the
  decoy itself answers (tests whether the reader notices an unmentioned
  name can't be reasoned about).

**`memory/spotThePattern.js`**
- Existing: repeating emoji-cycle pattern, offset-varied.
- Pools widened (`SYMBOL_SETS`/`EXTRA_SYMBOLS` grow from 4/4 to ~8/8
  entries) for more surface variety; no structural change — this topic's
  underlying mechanic already varies meaningfully via cycle length/offset.

Topics not listed above (`greatestSmallest`, `spotThePattern` pool-only)
get no structural changes beyond what's noted.

### B.2 Visual repetition fix

**`content/visual/countTheShapes.js`**
- Existing: grid-rectangles family (3 size configs), fan-triangles family
  (3 size configs) — chosen 50/50.
- Add one more figure family: **overlapping-circles Venn count** (2 or 3
  circles of fixed radius arranged so intersections are countable;
  `countVennRegions(n)` in `figures.js`, easy=2 circles, hard=3), and
  widen existing families' size ranges per difficulty so there are more
  than 3 configs each (e.g. grid supports 1x2 up to 3x3, not just 3 fixed
  shapes).

**`content/visual/hiddenFigureHunt.js`**
- Existing: `SHAPE_POOL` of 6 shapes, always rendered at the same 3 fixed
  screen positions regardless of which 3 are chosen — so the "master
  figure" always looks nearly identical.
- Expand `SHAPE_POOL` to ~12 shapes (add hexagon, arrow, cross, heart,
  crescent, trapezoid).
- Randomize each chosen shape's position/offset within the master
  figure's canvas per question (small random jitter on `cx/cy`/`x/y`
  within safe bounds) so the same 3-shape combination doesn't always
  render identically.

**`content/visual/spotTheDifference.js`**
- Existing: one hardcoded `BASE_SCENE` (a house), one `CHANGE_POOL` of 5
  possible edits.
- Add 3 more distinct base scenes (e.g. a fruit bowl, a garden, a fish
  bowl — each 5-6 simple shapes) each with its own `CHANGE_POOL` of 5-6
  edits (color/size/position tweaks, matching the existing `patch`
  format). `generateSpotDifferenceQuestion` picks a random scene, then
  proceeds exactly as today.

No new "recently shown" persistence/tracking layer — broadening the
combinatorial space (dozens of distinct figures per topic instead of ~6)
is the fix; a dedupe cache would be extra state for a problem that
widened pools already solve, and MixedPractice/MockTest already draw
across many topics per session so a single topic's pool doesn't need to
defeat determinism entirely on its own.

### B.3 New topics

Each ships with 2-3 internal variants from day one (per the lesson of
this whole fix — no new single-template topic). Added to the `TOPICS`
array in `src/content/index.js` after the existing 3 topics of their
category (keeps existing unlock order intact; new topics unlock after
the category's original 3 are mastered, consistent with `SkillMap`'s
sequential-lock behavior).

**`numerical/symbolSubstitution.js`** — *Symbol Substitution*
- Variant 1: operator remap-and-evaluate (`+ means −, × means +` then
  evaluate a short expression) — the most common single subtype across
  the samples.
- Variant 2: remap-and-compare (given the same remapping, which of 4
  expressions gives the lowest/highest result).
- Variant 3: icon/letter-code simple simultaneous equations (2 unknowns,
  3 short equations using small pictorial/letter stand-ins, solve by
  substitution — matches the "Iron Man + Spiderman" sample). Keep
  numbers small (0-20) so a class-3 reader can solve by trial.

**`numerical/calendarTime.js`** — *Calendar & Time Reasoning*
- Variant 1: date ordering (sort 2-3 given dates oldest→newest).
- Variant 2: day-of-week from an anchor (`if 3rd March 2020 was a
  Monday, which date(s) fall on the same day`) — implement with real
  `Date` arithmetic (mod 7 day-of-week diff), no hardcoded calendars.
- Variant 3: time/schedule arithmetic (start time + duration [+ breaks],
  what time does event N start/end) — again real time-of-day arithmetic,
  minutes-based.

**`memory/familyRelations.js`** — *Family Relations*
- Variant 1: direct relation chain (`Amanda is Jack's daughter, Jack has
  a brother Paul — who is Paul to Amanda?`) over a small fixed relation
  graph (parent/sibling/child), 2-3 hops.
- Variant 2: logical-constraint variant (`I am elder than some family
  members and younger than others — which relation can NEVER be
  younger than me?`) — reasoned from relation type, not a specific tree
  (age-invariant relations like "parent"/"grandparent" vs
  variable-order ones like "sibling").
- Variant 3: "only child" / self-reference trick (`what is Sanjiv's
  father's only child's name?` → Sanjiv), built from a tiny templated
  family fact set.

**`memory/positionInSequence.js`** — *Position in a Sequence*
- Variant 1: Nth-from-an-end among a row of emoji/items (`which item is
  2nd to the right of the 6th item from the left?`) — no SVG needed, an
  emoji row rendered directly in the prompt, same pattern already used
  by `spotThePattern`.
- Variant 2: letter-midway-between-two-letters in a shuffled custom
  alphabet (shares the generator helper introduced for
  `whichLetterAmI`'s new variant in B.1 — factor the shuffled-alphabet +
  midpoint-index logic into a small shared helper in `lib/utils.js`
  rather than duplicating it, since both topics need identical logic).

### B.4 Explicitly descoped

The numeric grid/wheel puzzles with colored-line relationships (values
in cells connected by colored lines that "mean" a themed rule, or
numbers on a circle where same-colored connections sum to a fixed
total) are **not** included in this pass. Auto-generating them reliably
means deriving a consistent underlying rule *and* rendering it
unambiguously — the same "unreliable to auto-generate" concern the
original design doc already raised for visual content. Worth a
follow-up, not bundled here.

## Testing / verification

Same conventions as the rest of the codebase:
- Every new/changed generator file keeps (or gains) a co-located
  `.test.js` — assert the returned question shape is well-formed
  (exactly one correct option, `mistakes` covers every wrong option,
  numbers/dates are internally consistent) and, where feasible, run each
  variant many times (e.g. 200 iterations) asserting no exception and
  answer-option-letter distribution isn't degenerate — matching the
  existing test style in e.g. `seriesCompletion.test.js`.
- `App.test.jsx` / `SkillMap.test.jsx` / `AvatarPicker.test.jsx` updated
  for the edit-profile flow.
- `vite build` + the existing Playwright smoke script
  (`scripts/smoke.js`) run before calling this done, per the original
  design doc's verification approach — specifically re-check the
  Teach→Try Together→Your Turn loop for at least one *new* topic per
  touched category, plus the profile-edit flow.

## Non-goals (this pass)

- No new persistence/schema changes (no multi-profile, no server sync).
- No changes to scoring, mock test assembly, or mixed practice beyond
  automatically picking up new topics via `TOPICS`/`TOPICS_BY_CATEGORY`.
- No grid/wheel-style auto-generated numeric figures (B.4).
