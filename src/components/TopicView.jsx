import React, { useState, useMemo } from "react";
import Header from "./Header.jsx";
import TeachSteps from "./TeachSteps.jsx";
import QuestionCard from "./QuestionCard.jsx";
import Confetti from "./Confetti.jsx";
import { recordTopicAttempt } from "../lib/storage.js";
import { isTopicMastered } from "../lib/scoring.js";

export default function TopicView({ topic, soundOn, avatar, onExit }) {
  const [phase, setPhase] = useState("teach");
  const [index, setIndex] = useState(0);
  const [yourTurnScore, setYourTurnScore] = useState(0);
  const tryTogether = useMemo(() => topic.getTryTogether(), [topic]);
  const yourTurn = useMemo(() => topic.getYourTurn(), [topic]);

  function handleTeachDone() {
    setPhase("tryTogether");
    setIndex(0);
  }

  function handleTryTogetherAnswered() {
    if (index === tryTogether.length - 1) {
      setPhase("yourTurn");
      setIndex(0);
    } else {
      setIndex(i => i + 1);
    }
  }

  function handleYourTurnAnswered(isCorrect) {
    const rec = recordTopicAttempt(topic.id, isCorrect);
    if (isCorrect) setYourTurnScore(s => s + 1);
    if (index === yourTurn.length - 1) {
      setPhase("done");
    } else {
      setIndex(i => i + 1);
    }
  }

  const mastered = phase === "done" && isTopicMastered({ attempts: yourTurn.length, correct: yourTurnScore });

  return (
    <main className="topicView">
      {mastered && <Confetti />}
      <Header onBack={onExit} avatar={avatar} />
      <div className="topicHeaderRow"><h1>{topic.title}</h1></div>
      {phase === "teach" && <TeachSteps steps={topic.teach.steps} onDone={handleTeachDone} />}
      {phase === "tryTogether" && (
        <div>
          <p className="phaseLabel">Let's try together ({index + 1} of {tryTogether.length})</p>
          <QuestionCard key={tryTogether[index].id} question={tryTogether[index]} soundOn={soundOn} onAnswered={handleTryTogetherAnswered} />
        </div>
      )}
      {phase === "yourTurn" && (
        <div>
          <p className="phaseLabel">Your turn ({index + 1} of {yourTurn.length})</p>
          <QuestionCard key={yourTurn[index].id} question={yourTurn[index]} soundOn={soundOn} onAnswered={handleYourTurnAnswered} />
        </div>
      )}
      {phase === "done" && (
        <div className="topicDoneCard">
          <div className="topicDoneIcon">{mastered ? "⭐" : "👍"}</div>
          <h2>{mastered ? "Topic mastered!" : "Nice practice!"}</h2>
          <p>You got {yourTurnScore} out of {yourTurn.length} right.</p>
          {!mastered && <p>Try this topic again any time to earn your star.</p>}
          <button className="startBtn" onClick={onExit}>Back to map</button>
        </div>
      )}
    </main>
  );
}
