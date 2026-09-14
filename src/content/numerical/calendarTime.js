import { shuffle, randomInt, pick } from "../../lib/utils.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function randomDate() {
  return new Date(randomInt(1985, 2022), randomInt(0, 11), randomInt(1, 28));
}
function fmtDate(d) {
  return `${d.getDate()}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}
function fmtTime(totalMinutes) {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60), m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function ordinal(n) {
  if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
  if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
  if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
  return `${n}th`;
}

function dateOrderingVariant() {
  let dates;
  do { dates = [randomDate(), randomDate(), randomDate()]; } while (new Set(dates.map(d => d.getTime())).size < 3);
  const labels = ["A", "B", "C"];
  const entries = labels.map((lab, i) => ({ lab, date: dates[i] }));
  const sorted = [...entries].sort((x, y) => x.date - y.date);
  const correctStr = sorted.map(e => e.lab).join("");
  const allPerms = [["A","B","C"],["A","C","B"],["B","A","C"],["B","C","A"],["C","A","B"],["C","B","A"]].map(p => p.join(""));
  const wrongPerms = shuffle(allPerms.filter(p => p !== correctStr)).slice(0, 3);
  const dateList = entries.map(e => `${e.lab}. ${fmtDate(e.date)}`).join("; ");
  const howTo = `Sorting oldest to newest: ${sorted.map(e => `${e.lab} (${fmtDate(e.date)})`).join(" → ")}. That's ${correctStr}.`;
  const candidates = shuffle([
    { label: correctStr, isAnswer: true, reason: null },
    ...wrongPerms.map(p => ({ label: p, isAnswer: false, reason: `doesn't put the dates oldest-to-newest` })),
  ]);
  return { prompt: `Which of the following options represents these dates in ascending order (oldest first, latest last)? ${dateList}`, candidates, howTo };
}

function dayOfWeekVariant() {
  const anchor = randomDate();
  const anchorDayName = DAY_NAMES[anchor.getDay()];
  const offsetDays = pick([-14, -10, -7, -5, -3, 3, 5, 7, 10, 14, 17, 21]);
  const target = new Date(anchor);
  target.setDate(anchor.getDate() + offsetDays);
  const targetDayName = DAY_NAMES[target.getDay()];
  const howTo = `${fmtDate(anchor)} is a ${anchorDayName}. ${offsetDays > 0 ? `${offsetDays} days later` : `${-offsetDays} days earlier`} is ${fmtDate(target)}, which is a ${targetDayName}.`;
  const decoyDays = shuffle(DAY_NAMES.filter(d => d !== targetDayName)).slice(0, 3);
  const candidates = shuffle([
    { label: targetDayName, isAnswer: true, reason: null },
    ...decoyDays.map(d => ({ label: d, isAnswer: false, reason: `counting the days carefully from ${anchorDayName} doesn't land on ${d}` })),
  ]);
  return { prompt: `If ${fmtDate(anchor)} is a ${anchorDayName}, what day of the week is ${fmtDate(target)}?`, candidates, howTo };
}

function scheduleVariant(difficulty) {
  const startH = randomInt(6, 9);
  const startM = pick([0, 15, 30, 45]);
  const tripMin = randomInt(20, 50);
  const breakMin = randomInt(5, 15);
  const round = difficulty === "hard" ? randomInt(6, 9) : randomInt(3, 5);
  const cycleMin = tripMin + breakMin;
  const startTotal = startH * 60 + startM;
  const targetTotal = startTotal + cycleMin * (round - 1);
  const roundLabel = ordinal(round);
  const howTo = `Each round trip plus its break takes ${tripMin} + ${breakMin} = ${cycleMin} minutes. The ${roundLabel} round starts after ${round - 1} full cycles from ${fmtTime(startTotal)}: that's ${fmtTime(targetTotal)}.`;
  const distractorPool = [...new Set([targetTotal - cycleMin, targetTotal + cycleMin, targetTotal + tripMin].map(fmtTime))].filter(v => v !== fmtTime(targetTotal));
  while (distractorPool.length < 3) distractorPool.push(fmtTime(targetTotal + 10 * (distractorPool.length + 1)));
  const candidates = shuffle([
    { label: fmtTime(targetTotal), isAnswer: true, reason: null },
    ...distractorPool.slice(0, 3).map(v => ({ label: v, isAnswer: false, reason: `doesn't account for every round-trip-plus-break cycle correctly` })),
  ]);
  return {
    prompt: `A bus takes ${tripMin} minutes to make a complete round trip, with a ${breakMin} minute break between each round trip. The bus starts at ${fmtTime(startTotal)}. What time will the bus start its ${roundLabel} round?`,
    candidates, howTo,
  };
}

export function generateCalendarTimeQuestion(difficulty = "medium", index = 0) {
  const built = pick([dateOrderingVariant, dayOfWeekVariant, () => scheduleVariant(difficulty)])();
  const { prompt, candidates, howTo } = built;
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.reason}. ${howTo}`;
  });

  return {
    id: `calendar-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "numerical",
    topicId: "calendarTime",
    difficulty,
    prompt,
    figure: null,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const calendarTimeTopic = {
  id: "calendarTime",
  categoryId: "numerical",
  title: "Calendar & Time Reasoning",
  teach: {
    steps: [
      { caption: "Dates can be sorted oldest to newest by comparing year first, then month, then day." },
      { caption: "The days of the week repeat every 7 days — count forward or backward in groups of 7 to find a far-off day quickly." },
      { caption: "Schedules repeat in cycles — figure out how long ONE cycle takes, then multiply by how many cycles have passed." },
      { caption: "Always double-check whether you're counting FROM the start or counting how many have already happened." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateCalendarTimeQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateCalendarTimeQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
