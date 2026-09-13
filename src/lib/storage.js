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
