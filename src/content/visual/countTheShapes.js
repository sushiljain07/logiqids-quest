import { shuffle, randomInt, pick } from "../../lib/utils.js";
import { buildGridFigure, buildFanFigure, countGridRectangles, countFanTriangles, buildVennFigure, countVennRegions } from "../../lib/figures.js";

function gridInstance(difficulty) {
  const [rows, cols] = difficulty === "hard" ? [randomInt(2, 3), randomInt(2, 3)]
    : difficulty === "medium" ? [randomInt(1, 2), randomInt(2, 3)]
    : [1, randomInt(1, 2)];
  const answer = countGridRectangles(rows, cols);
  return { figure: buildGridFigure(rows, cols), answer, shapeWord: "rectangles", howTo: `This is a ${rows + 1}x${cols + 1}-line grid. Counting every small AND combined rectangle gives ${answer} in total.` };
}

function fanInstance(difficulty) {
  const n = difficulty === "hard" ? randomInt(4, 6) : difficulty === "medium" ? randomInt(3, 4) : randomInt(2, 3);
  const answer = countFanTriangles(n);
  return { figure: buildFanFigure(n), answer, shapeWord: "triangles", howTo: `The big triangle is split into ${n} equal slices from the top point. Counting each small triangle AND every combination of neighboring slices gives ${answer} in total.` };
}

function vennInstance(difficulty) {
  const n = difficulty === "hard" ? 3 : 2;
  const answer = countVennRegions(n);
  return { figure: buildVennFigure(n), answer, shapeWord: "regions", howTo: `${n} overlapping circles divide the picture into ${answer} separate regions, including every spot where circles cross over each other.` };
}

export function generateCountShapesQuestion(difficulty = "medium", index = 0) {
  const built = pick([gridInstance, fanInstance, vennInstance])(difficulty);
  const { answer, howTo, shapeWord } = built;
  const nearby = new Set([answer - 3, answer - 2, answer - 1, answer + 1, answer + 2, answer + 3].filter(v => v >= 0));
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
      { caption: "Overlapping circles also hide extra regions wherever they cross — count those too." },
      { caption: "Count every small shape first, then look for pairs or groups that form a bigger version of the same shape." },
      { caption: "Add the small count and the combined count together for the total." },
    ],
  },
  getTryTogether: () => [0, 1].map(i => generateCountShapesQuestion("easy", i)),
  getYourTurn: () => [0, 1, 2, 3].map(i => generateCountShapesQuestion(["easy", "medium", "medium", "hard"][i], i)),
};
