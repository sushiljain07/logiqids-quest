import React, { useState, useEffect } from "react";
import { Check, X, Volume2 } from "lucide-react";
import FigureSVG from "./FigureSVG.jsx";
import { speak, stopSpeech } from "../lib/speech.js";

export default function QuestionCard({ question, onAnswered, soundOn = true, withholdExplanation = false }) {
  const [selected, setSelected] = useState(null);
  useEffect(() => () => stopSpeech(), []);

  const answered = selected !== null;
  const isCorrect = selected === question.answerId;

  function choose(optionId) {
    if (answered) return;
    if (withholdExplanation) {
      onAnswered(optionId === question.answerId, optionId);
      return;
    }
    setSelected(optionId);
    const isRight = optionId === question.answerId;
    if (!isRight && soundOn) {
      const text = question.explanation.mistakes[optionId] || question.explanation.howTo;
      speak(text);
    }
  }

  function replay() {
    const text = isCorrect ? question.explanation.correct : (question.explanation.mistakes[selected] || question.explanation.howTo);
    speak(text);
  }

  function continueOn() {
    stopSpeech();
    onAnswered(isCorrect, selected);
  }

  const explanationText = answered
    ? (isCorrect ? question.explanation.correct : (question.explanation.mistakes[selected] || question.explanation.howTo))
    : null;

  return (
    <div className="questionCard">
      {question.figure && <div className="questionFigure"><FigureSVG spec={question.figure} size={200} /></div>}
      {question.secondFigure && <div className="questionFigure"><FigureSVG spec={question.secondFigure} size={200} /></div>}
      <h2>{question.prompt}</h2>
      <div className="options">
        {question.options.map(opt => {
          let cls = "option";
          if (answered && opt.id === question.answerId) cls += " right";
          else if (answered && opt.id === selected) cls += " wrong";
          return (
            <button key={opt.id} className={cls} onClick={() => choose(opt.id)}>
              <span className="letter">{opt.id}</span>
              {opt.figure ? <FigureSVG spec={opt.figure} size={56} /> : <span>{opt.label}</span>}
              {answered && opt.id === question.answerId && <Check size={19} />}
              {answered && opt.id === selected && opt.id !== question.answerId && <X size={19} />}
            </button>
          );
        })}
      </div>
      {answered && !withholdExplanation && (
        <div className={"explanationCard " + (isCorrect ? "good" : "bad")}>
          <div className="explanationIcon">{isCorrect ? "🎉" : "💡"}</div>
          <div><span>{explanationText}</span></div>
          <button className="replayBtn" onClick={replay} aria-label="Replay explanation"><Volume2 size={17} /></button>
        </div>
      )}
      {answered && !withholdExplanation && (
        <button className="nextBtn" onClick={continueOn}>Continue</button>
      )}
    </div>
  );
}
