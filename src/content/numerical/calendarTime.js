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

function backwardScheduleVariant() {
  const deadlineH = randomInt(17, 20);
  const deadlineM = pick([0, 15, 30, 45]);
  const bufferMin = pick([10, 15, 20]);
  const task1 = randomInt(20, 70);
  const breakMin = randomInt(10, 20);
  const task2 = randomInt(15, 40);
  const deadlineTotal = deadlineH * 60 + deadlineM;
  const totalNeeded = task1 + breakMin + task2 + bufferMin;
  const latestStartTotal = deadlineTotal - totalNeeded;
  const howTo = `Working backward from the deadline: must join ${bufferMin} minutes before ${fmtTime(deadlineTotal)}, so must finish by ${fmtTime(deadlineTotal - bufferMin)}. Before that comes task 2 (${task2} min), a ${breakMin} minute break, and task 1 (${task1} min) — ${totalNeeded} minutes total — so the latest start is ${fmtTime(latestStartTotal)}.`;
  const pool = [...new Set([latestStartTotal + breakMin, latestStartTotal - task1, latestStartTotal + bufferMin].map(fmtTime))].filter(v => v !== fmtTime(latestStartTotal));
  while (pool.length < 3) pool.push(fmtTime(latestStartTotal + 15 * (pool.length + 1)));
  const candidates = shuffle([
    { label: fmtTime(latestStartTotal), isAnswer: true, reason: null },
    ...pool.slice(0, 3).map(v => ({ label: v, isAnswer: false, reason: `doesn't leave enough time for both tasks, the break, and the buffer before the deadline` })),
  ]);
  return {
    prompt: `Two tasks must be done back to back: the first takes ${task1} minutes, then a ${breakMin} minute break, then the second takes ${task2} minutes. Right after, there's a commitment at ${fmtTime(deadlineTotal)} that must be joined at least ${bufferMin} minutes early. What is the latest time the first task can start?`,
    candidates, howTo,
  };
}

function monthEndDayOfWeekVariant() {
  const year = randomInt(2000, 2030);
  const month = randomInt(0, 10);
  const anchorDay = randomInt(1, 25);
  const anchor = new Date(year, month, anchorDay);
  const anchorDayName = DAY_NAMES[anchor.getDay()];
  const nextMonthLastDay = new Date(year, month + 2, 0);
  const targetDayName = DAY_NAMES[nextMonthLastDay.getDay()];
  const monthName = new Date(year, month, 1).toLocaleString("en-US", { month: "long" });
  const nextMonthName = new Date(year, month + 1, 1).toLocaleString("en-US", { month: "long" });
  const howTo = `${fmtDate(anchor)} is a ${anchorDayName}. Counting forward to the last day of ${nextMonthName} (${fmtDate(nextMonthLastDay)}) lands on a ${targetDayName}.`;
  const decoyDays = shuffle(DAY_NAMES.filter(d => d !== targetDayName)).slice(0, 3);
  const candidates = shuffle([
    { label: targetDayName, isAnswer: true, reason: null },
    ...decoyDays.map(d => ({ label: d, isAnswer: false, reason: `counting the days carefully from ${anchorDayName} doesn't land on ${d}` })),
  ]);
  return { prompt: `If ${ordinal(anchorDay)} ${monthName} is a ${anchorDayName}, what day of the week will be the last day of ${nextMonthName}?`, candidates, howTo };
}

function monthStepSequenceVariant() {
  const step = pick([2, 3, 4]);
  const startMonth = randomInt(0, 11);
  const idxs = [0, 1, 2, 3].map(i => (startMonth + step * i) % 12);
  const answerIdx = (startMonth + step * 4) % 12;
  const monthNames = idxs.map(i => MONTHS[i]);
  const answer = MONTHS[answerIdx];
  const howTo = `Each month in the pattern is ${step} months after the last one (wrapping from December back to January). ${monthNames.join(", ")} → ${answer}.`;
  const decoyIdx = shuffle(Array.from({ length: 12 }, (_, i) => i).filter(i => i !== answerIdx)).slice(0, 3);
  const candidates = shuffle([
    { label: answer, isAnswer: true, reason: null },
    ...decoyIdx.map(i => ({ label: MONTHS[i], isAnswer: false, reason: `isn't ${step} months after ${monthNames[3]}` })),
  ]);
  return { prompt: `What comes next in this pattern? ${monthNames.join(", ")}, ?`, candidates, howTo };
}

function everyNthDayCountVariant() {
  const year = randomInt(2000, 2030);
  const month = randomInt(0, 11);
  const interval = pick([2, 3]);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const count = Math.ceil(daysInMonth / interval);
  const monthName = new Date(year, month, 1).toLocaleString("en-US", { month: "long" });
  const intervalWord = interval === 2 ? "every alternate day" : "every 3rd day";
  const howTo = `${monthName} ${year} has ${daysInMonth} days. Starting from day 1 and repeating ${intervalWord}, that lands on ${count} separate days.`;
  const pool = [...new Set([count - 1, count + 1, Math.floor(daysInMonth / interval)].filter(v => v > 0 && v !== count))];
  while (pool.length < 3) pool.push(count + pool.length + 2);
  const candidates = shuffle([
    { label: String(count), isAnswer: true, reason: null },
    ...pool.slice(0, 3).map(v => ({ label: String(v), isAnswer: false, reason: `doesn't match counting from day 1 through all ${daysInMonth} days of ${monthName}` })),
  ]);
  return { prompt: `Someone practices ${intervalWord} of ${monthName} ${year}, starting from the 1st. How many days in ${monthName} will they practice?`, candidates, howTo };
}

export function generateCalendarTimeQuestion(difficulty = "medium", index = 0) {
  const built = pick([
    dateOrderingVariant, dayOfWeekVariant, () => scheduleVariant(difficulty),
    backwardScheduleVariant, monthEndDayOfWeekVariant, monthStepSequenceVariant, everyNthDayCountVariant,
  ])();
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
