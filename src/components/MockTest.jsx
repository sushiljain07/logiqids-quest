import React, { useState, useEffect, useMemo, useRef } from "react";
import Header from "./Header.jsx";
import QuestionCard from "./QuestionCard.jsx";
import { TOPICS } from "../content/index.js";
import { scoreMockTest } from "../lib/scoring.js";
import { addLeaderboardEntry } from "../lib/storage.js";

const TOTAL_QUESTIONS = 35;
const LQ_CHAMP_COUNT = 7;
const DIFFICULTY_RANK = { hard: 2, medium: 1, easy: 0 };

export function buildMockTestQuestions() {
  const pool = [];
  TOPICS.forEach(topic => {
    pool.push(...topic.getTryTogether(), ...topic.getYourTurn(), ...topic.getYourTurn());
  });
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS);
  const byDifficulty = [...shuffled].sort((a, b) => DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty]);
  const champIds = new Set(byDifficulty.slice(0, LQ_CHAMP_COUNT).map(q => q.id));
  return shuffled.map(q => ({ ...q, isLQChamp: champIds.has(q.id) }));
}

export default function MockTest({ avatar, playerName, onExit }) {
  const [stage, setStage] = useState("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // [{question, chosenId, isAnswered, isCorrect, isLQChamp}]
  const [secondsLeft, setSecondsLeft] = useState(60 * 60);
  const questions = useMemo(() => (stage !== "intro" ? buildMockTestQuestions() : []), [stage === "intro"]);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (stage !== "inProgress") return;
    if (secondsLeft <= 0) { finishTest(); return; }
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [stage, secondsLeft]);

  function start() {
    setStage("inProgress");
    setIndex(0);
    setAnswers([]);
    setSecondsLeft(60 * 60);
  }

  function handleAnswered(isCorrect, optionId) {
    const q = questions[index];
    setAnswers(a => [...a, { question: q, chosenId: optionId, isAnswered: true, isCorrect, isLQChamp: q.isLQChamp }]);
    advance();
  }

  function skip() {
    const q = questions[index];
    setAnswers(a => [...a, { question: q, chosenId: null, isAnswered: false, isCorrect: false, isLQChamp: q.isLQChamp }]);
    advance();
  }

  function advance() {
    if (index === questions.length - 1) finishTest();
    else setIndex(i => i + 1);
  }

  function finishTest() {
    if (!recordedRef.current) {
      recordedRef.current = true;
      const result = scoreMockTest(answers);
      addLeaderboardEntry({ name: playerName || "Explorer", avatar, raw: result.raw, pct: result.pct, date: new Date().toISOString() });
    }
    setStage("results");
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  if (stage === "intro") {
    return (
      <main className="result">
        <Header onBack={onExit} avatar={avatar} />
        <section className="resultHero">
          <h1>Mock Test</h1>
          <p>35 questions, 60 minutes. Correct answers earn 4 points (8 for LQ Champ questions); wrong answers lose 1 point (2 for LQ Champ). Explanations are shown at the end, just like the real test.</p>
          <button className="startBtn" onClick={start}>Start Test</button>
        </section>
      </main>
    );
  }

  if (stage === "inProgress") {
    const q = questions[index];
    return (
      <main className="quiz">
        <Header onBack={onExit} avatar={avatar} />
        <div className="quizTop">
          <span className="eyebrow">QUESTION {index + 1} OF {questions.length}{q.isLQChamp ? " · LQ CHAMP" : ""}</span>
          <div className="timer">{mm}:{ss}</div>
        </div>
        <QuestionCard key={q.id} question={q} soundOn={false} withholdExplanation onAnswered={handleAnswered} />
        <button className="hintBtn" onClick={skip}>Skip this question</button>
      </main>
    );
  }

  if (stage === "results") {
    const result = scoreMockTest(answers);
    return (
      <main className="result">
        <Header onBack={onExit} avatar={avatar} />
        <section className="resultHero">
          <h1>Test Complete!</h1>
          <div className="scoreCircle"><strong>{result.raw}</strong><span>/ {result.maxRaw}</span><small>{result.pct}%</small></div>
          <div className="resultStats">
            <div><b>{result.correctCount}</b><span>Correct</span></div>
            <div><b>{result.wrongCount}</b><span>Wrong</span></div>
            <div><b>{result.unansweredCount}</b><span>Skipped</span></div>
          </div>
          <button className="startBtn" onClick={() => setStage("review")}>Review Answers</button>
        </section>
      </main>
    );
  }

  return (
    <main className="result">
      <Header onBack={onExit} avatar={avatar} />
      <section className="panel listPanel">
        <h2>Question-Wise Review</h2>
        {answers.map((a, i) => (
          <div className="reviewRow" key={a.question.id}>
            <span className={a.isCorrect ? "miniRight" : "miniWrong"}>{a.isCorrect ? "✓" : "!"}</span>
            <div>
              <b>{i + 1}. {a.question.prompt}</b>
              <small>{a.isAnswered ? (a.isCorrect ? a.question.explanation.correct : (a.question.explanation.mistakes[a.chosenId] || a.question.explanation.howTo)) : `Skipped. ${a.question.explanation.howTo}`}</small>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
