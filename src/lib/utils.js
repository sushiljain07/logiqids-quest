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

// A shuffled A-Z order plus two reference letters with an even index gap, so
// "the letter exactly midway between them" always lands on a real letter.
export function pickMidpointPuzzle() {
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const sequence = shuffle(letters);
  const gap = pick([4, 6, 8]);
  const iA = randomInt(0, 25 - gap);
  const iB = iA + gap;
  const midIndex = (iA + iB) / 2;
  return { sequence, letterA: sequence[iA], letterB: sequence[iB], midpointLetter: sequence[midIndex] };
}
