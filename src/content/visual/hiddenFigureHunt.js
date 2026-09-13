import { shuffle, pick } from "../../lib/utils.js";

function thumb(shape) {
  return { width: 60, height: 60, shapes: [shape] };
}

const PRIMITIVES = {
  circle: { type: "circle", cx: 30, cy: 30, r: 25, fill: "#ffb38f", stroke: "#25233a" },
  square: { type: "rect", x: 8, y: 8, w: 44, h: 44, fill: "#a7d9ff", stroke: "#25233a" },
  triangle: { type: "polygon", points: "30,6 54,54 6,54", fill: "#c9f5c9", stroke: "#25233a" },
  star: { type: "star", points: "30,4 37,22 56,22 41,34 47,53 30,41 13,53 19,34 4,22 23,22", fill: "#ffe08a", stroke: "#25233a" },
  pentagon: { type: "pentagon", points: "30,4 54,22 45,52 15,52 6,22", fill: "#e6c9ff", stroke: "#25233a" },
};

function masterFigure() {
  return {
    width: 220, height: 220,
    shapes: [
      { type: "circle", cx: 80, cy: 80, r: 55, fill: "#ffb38f88", stroke: "#25233a" },
      { type: "rect", x: 90, y: 60, w: 100, h: 100, fill: "#a7d9ff88", stroke: "#25233a" },
      { type: "polygon", points: "60,190 160,190 110,110", fill: "#c9f5c988", stroke: "#25233a" },
    ],
  };
}

export function generateHiddenFigureQuestion(difficulty = "medium", index = 0) {
  const master = masterFigure();
  const memberTypes = ["circle", "square", "triangle"];
  const foreignType = pick(["star", "pentagon"]);
  const howTo = `The figure is made of a circle, a square, and a triangle overlapping. The ${foreignType} is never one of them, so it's the one NOT hidden in the figure.`;

  const candidates = shuffle([
    { type: foreignType, isAnswer: true },
    ...memberTypes.map(t => ({ type: t, isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], figure: thumb(PRIMITIVES[c.type]) }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `The ${c.type} really is one of the overlapping shapes in the figure. ${howTo}`;
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
