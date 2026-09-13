import { shuffle } from "../../lib/utils.js";
import { buildGridFigure, buildFanFigure, countGridRectangles, countFanTriangles } from "../../lib/figures.js";

function gridInstance(difficulty) {
  const [rows, cols] = difficulty === "hard" ? [2, 2] : difficulty === "medium" ? [1, 3] : [1, 2];
  const answer = countGridRectangles(rows, cols);
  return { figure: buildGridFigure(rows, cols), answer, shapeWord: "rectangles", howTo: `This is a ${rows + 1}x${cols + 1}-line grid. Counting every small AND combined rectangle gives ${answer} in total.` };
}

function fanInstance(difficulty) {
  const n = difficulty === "hard" ? 4 : difficulty === "medium" ? 3 : 2;
  const answer = countFanTriangles(n);
  return { figure: buildFanFigure(n), answer, shapeWord: "triangles", howTo: `The big triangle is split into ${n} equal slices from the top point. Counting each small triangle AND every combination of neighboring slices gives ${answer} in total.` };
}

export function generateCountShapesQuestion(difficulty = "medium", index = 0) {
  const built = Math.random() < 0.5 ? gridInstance(difficulty) : fanInstance(difficulty);
  const { answer, howTo, shapeWord } = built;
  const nearby = new Set([answer - 3, answer - 2, answer - 1, answer + 1, answer + 2, answer + 3].filter(v => v > 0));
  const distractors = shuffle([...nearby]).slice(0, 3);
  while (distractors.length < 3) distractors.push(answer + distractors.length + 4);

  const candidates = shuffle([
    { label: String(answer), isAnswer: true },
    ...distractors.map(d => ({ label: String(d), isAnswer: false })),
  ]);
  const letters = ["A", "B", "C", "D"];
  const options = candidates.map((c, i) => ({ id: letters[i], label: c.label }));
  const answerId = letters[candidates.findIndex(c => c.isAnswer)];
  const mistakes = {};
  candidates.forEach((c, i) => {
    if (!c.isAnswer) mistakes[letters[i]] = `${c.label} misses some of the combined shapes. Remember to count the small ${shapeWord} AND every bigger one made from combining them. ${howTo}`;
  });

  return {
    id: `count-${difficulty}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    categoryId: "visual",
    topicId: "countTheShapes",
    difficulty,
    prompt: `Count the total number of ${shapeWord} in the figure below (including bigger ones made of smaller ones).`,
    figure: built.figure,
    options,
    answerId,
    explanation: { correct: `Yes! ${howTo}`, howTo, mistakes },
  };
}

export const countTheShapesTopic = {
  id: "countTheShapes",
  categoryId: "visual",
  title: "Count the Shapes",
  teach: {
    steps: [
      { caption: "Some figures hide MORE shapes than you first see." },
      { caption: "A square split by both diagonals hides small triangles AND bigger ones made by combining them." },
      { caption: "Count every small shape first, then look for pairs or groups that form a bigger version of the same shape." },
      { caption: "Add the small count and the combined count together for the total." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateCountShapesQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateCountShapesQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
