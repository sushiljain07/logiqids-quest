import { shuffle, randomInt } from "../../lib/utils.js";

function thumb(shape) {
  return { width: 60, height: 60, shapes: [shape] };
}

const SHAPE_POOL = [
  { name: "circle", shape: { type: "circle", cx: 70, cy: 70, r: 50, fill: "#ffb38f88", stroke: "#25233a" } },
  { name: "square", shape: { type: "rect", x: 90, y: 50, w: 90, h: 90, fill: "#a7d9ff88", stroke: "#25233a" } },
  { name: "triangle", shape: { type: "polygon", points: "50,180 150,180 100,90", fill: "#c9f5c988", stroke: "#25233a" } },
  { name: "star", shape: { type: "polygon", points: "140,15 146,32 164,32 150,43 155,61 140,50 125,61 130,43 116,32 134,32", fill: "#ffe08a88", stroke: "#25233a" } },
  { name: "pentagon", shape: { type: "polygon", points: "60,105 88,124 77,157 43,157 32,124", fill: "#e6c9ff88", stroke: "#25233a" } },
  { name: "diamond", shape: { type: "polygon", points: "110,115 145,150 110,185 75,150", fill: "#ffb3d988", stroke: "#25233a" } },
  { name: "hexagon", shape: { type: "polygon", points: "130,60 155,75 155,105 130,120 105,105 105,75", fill: "#ffd0d088", stroke: "#25233a" } },
  { name: "trapezoid", shape: { type: "polygon", points: "70,140 130,140 115,190 85,190", fill: "#d0ffe888", stroke: "#25233a" } },
  { name: "arrow", shape: { type: "polygon", points: "40,100 90,100 90,80 130,110 90,140 90,120 40,120", fill: "#c9e0ff88", stroke: "#25233a" } },
  { name: "cross", shape: { type: "polygon", points: "80,50 110,50 110,80 140,80 140,110 110,110 110,140 80,140 80,110 50,110 50,80 80,80", fill: "#fff0b388", stroke: "#25233a" } },
  { name: "parallelogram", shape: { type: "polygon", points: "60,150 130,150 150,110 80,110", fill: "#e0d0ff88", stroke: "#25233a" } },
  { name: "kite", shape: { type: "polygon", points: "120,40 150,90 120,180 90,90", fill: "#ffcfa388", stroke: "#25233a" } },
];

function jitterShape(shape, amount = 12) {
  const dx = randomInt(-amount, amount);
  const dy = randomInt(-amount, amount);
  if (shape.type === "circle") return { ...shape, cx: shape.cx + dx, cy: shape.cy + dy };
  if (shape.type === "rect") return { ...shape, x: shape.x + dx, y: shape.y + dy };
  if (shape.type === "polygon") {
    const points = shape.points.split(" ").map(pair => {
      const [x, y] = pair.split(",").map(Number);
      return `${x + dx},${y + dy}`;
    }).join(" ");
    return { ...shape, points };
  }
  return shape;
}

function masterFigure() {
  const chosen = shuffle(SHAPE_POOL).slice(0, 4); // 3 members + 1 held out as the foreign/answer
  const members = chosen.slice(0, 3);
  const foreign = chosen[3];
  return {
    master: { width: 200, height: 200, shapes: members.map(m => jitterShape(m.shape)) },
    memberNames: members.map(m => m.name),
    foreign,
  };
}

export function generateHiddenFigureQuestion(difficulty = "medium", index = 0) {
  const { master, memberNames, foreign } = masterFigure();
  const memberEntries = SHAPE_POOL.filter(s => memberNames.includes(s.name));
  const howTo = `The figure is made of a ${memberNames.join(", ")} overlapping. The ${foreign.name} is never one of them, so it's the one NOT hidden in the figure.`;

  const candidates = shuffle([
    { name: foreign.name, shape: foreign.shape, isAnswer: true },
    ...memberEntries.map(m => ({ name: m.name, shape: m.shape, isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], figure: thumb(c.shape) }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `The ${c.name} really is one of the overlapping shapes in the figure. ${howTo}`;
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
