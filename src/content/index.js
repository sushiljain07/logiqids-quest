import { CATEGORIES } from "./categories.js";
import { seriesCompletionTopic } from "./analytical/seriesCompletion.js";
import { oddOneOutTopic } from "./analytical/oddOneOut.js";
import { analogiesTopic } from "./analytical/analogies.js";
import { compoundWordsTopic } from "./verbal/compoundWords.js";
import { whichLetterAmITopic } from "./verbal/whichLetterAmI.js";
import { spellingDetectiveTopic } from "./verbal/spellingDetective.js";
import { balanceEquationTopic } from "./numerical/balanceEquation.js";
import { greatestSmallestTopic } from "./numerical/greatestSmallest.js";
import { wordProblemsTopic } from "./numerical/wordProblems.js";
import { codedLanguageTopic } from "./memory/codedLanguage.js";
import { whosFastestTopic } from "./memory/whosFastest.js";
import { spotThePatternTopic } from "./memory/spotThePattern.js";
import { countTheShapesTopic } from "./visual/countTheShapes.js";
import { hiddenFigureHuntTopic } from "./visual/hiddenFigureHunt.js";
import { spotTheDifferenceTopic } from "./visual/spotTheDifference.js";

export const TOPICS = [
  seriesCompletionTopic, oddOneOutTopic, analogiesTopic,
  compoundWordsTopic, whichLetterAmITopic, spellingDetectiveTopic,
  balanceEquationTopic, greatestSmallestTopic, wordProblemsTopic,
  codedLanguageTopic, whosFastestTopic, spotThePatternTopic,
  countTheShapesTopic, hiddenFigureHuntTopic, spotTheDifferenceTopic,
];

export const TOPICS_BY_CATEGORY = Object.fromEntries(
  CATEGORIES.map(cat => [cat.id, TOPICS.filter(t => t.categoryId === cat.id)])
);

export function getTopic(topicId) {
  return TOPICS.find(t => t.id === topicId);
}
