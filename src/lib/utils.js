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
