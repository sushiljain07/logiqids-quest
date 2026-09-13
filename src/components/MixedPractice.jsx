import React, { useState, useMemo } from "react";
import Header from "./Header.jsx";
import QuestionCard from "./QuestionCard.jsx";
import { CATEGORIES } from "../content/categories.js";
import { TOPICS_BY_CATEGORY } from "../content/index.js";
import { shuffle, randomInt } from "../lib/utils.js";

const QUESTION_COUNT = 10;

function buildSet(categoryId) {
  const topics = categoryId === "mixed"
    ? shuffle(CATEGORIES.flatMap(c => TOPICS_BY_CATEGORY[c.id]))
    : shuffle(TOPICS_BY_CATEGORY[categoryId]);
  const pool = [];
  while (pool.length < QUESTION_COUNT) {
    const topic = topics[pool.length % topics.length];
    const candidates = topic.getYourTurn();
    pool.push(candidates[randomInt(0, candidates.length - 1)]);
  }
  return pool;
}

export default function MixedPractice({ soundOn, avatar, onExit }) {
  const [categoryId, setCategoryId] = useState(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const questions = useMemo(() => (categoryId ? buildSet(categoryId) : []), [categoryId]);

  if (!categoryId) {
    return (
      <main className="result">
        <Header onBack={onExit} avatar={avatar} />
        <section className="panel listPanel">
          <h2>Mixed Practice</h2>
          <p>Pick a category to practice, untimed, no lives.</p>
          <div className="modes">
            <button className="modeBtn" onClick={() => setCategoryId("mixed")}><span className="levelIcon">🎲</span><span><b>Mixed</b><small>A bit of everything</small></span></button>
            {CATEGORIES.map(c => (
              <button key={c.id} className="modeBtn" onClick={() => setCategoryId(c.id)}>
                <span className="levelIcon">{c.icon}</span><span><b>{c.name}</b></span>
              </button>
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (index >= questions.length) {
    return (
      <main className="result">
        <Header onBack={onExit} avatar={avatar} />
        <section className="resultHero">
          <h1>Practice complete!</h1>
          <p>You got {score} out of {questions.length} right.</p>
          <button className="startBtn" onClick={onExit}>Back to map</button>
        </section>
      </main>
    );
  }

  return (
    <main className="quiz">
      <Header onBack={onExit} avatar={avatar} />
      <p className="phaseLabel">Question {index + 1} of {questions.length}</p>
      <QuestionCard key={questions[index].id} question={questions[index]} soundOn={soundOn}
        onAnswered={(isCorrect) => { if (isCorrect) setScore(s => s + 1); setIndex(i => i + 1); }} />
    </main>
  );
}
