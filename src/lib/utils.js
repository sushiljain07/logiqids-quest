// Fisher-Yates. A comparator sort with a random comparator (the previous implementation) is
// not a uniform shuffle: it left elements at index 0/3 of a 4-element array far too often,
// which biased answer-letter placement and mock-test category composition.
export function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
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
