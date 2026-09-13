export function isTopicMastered(record) {
  if (!record) return false;
  const { attempts, correct } = record;
  if (!attempts) return false;
  return correct >= 3 && correct / attempts >= 0.75;
}

// Sticky counterpart to isTopicMastered: reads the persisted flag set the first time the
// threshold was crossed, so unlocks and mastery stars never regress after more practice.
export function isTopicEverMastered(record) {
  return !!record?.everMastered;
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
