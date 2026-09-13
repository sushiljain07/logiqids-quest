import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import FigureSVG from "./FigureSVG.jsx";

export default function TeachSteps({ steps, onDone }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  function next() {
    if (isLast) onDone();
    else setIndex(i => i + 1);
  }

  return (
    <div className="teachCard">
      <div className="teachProgress">Step {index + 1} of {steps.length}</div>
      {step.visual && <div className="teachVisual"><FigureSVG spec={step.visual} size={180} /></div>}
      <p className="teachCaption">{step.caption}</p>
      <button className="nextBtn" onClick={next}>
        {isLast ? "Let's practice!" : "Next"} <ArrowRight size={19} />
      </button>
    </div>
  );
}
