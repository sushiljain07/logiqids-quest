import React from "react";
import Header from "./Header.jsx";
import { CATEGORIES } from "../content/categories.js";
import { TOPICS_BY_CATEGORY } from "../content/index.js";
import { isTopicEverMastered } from "../lib/scoring.js";

export default function ProgressScreen({ progress, avatar, onBack }) {
  return (
    <main className="result">
      <Header onBack={onBack} avatar={avatar} />
      <section className="panel listPanel">
        <h2>My Progress</h2>
        {CATEGORIES.map(cat => {
          const topics = TOPICS_BY_CATEGORY[cat.id];
          const masteredCount = topics.filter(t => isTopicEverMastered(progress[t.id])).length;
          return (
            <div key={cat.id} className="progressCategory">
              <h3>{cat.icon} {cat.name} <span className="progressCount">{masteredCount} / {topics.length}</span></h3>
              <div className="stateGrid">
                {topics.map(t => (
                  <div key={t.id} className={"stateChip " + (isTopicEverMastered(progress[t.id]) ? "mastered" : (progress[t.id]?.attempts ? "tried" : ""))}>
                    <span>{isTopicEverMastered(progress[t.id]) ? "⭐" : progress[t.id]?.attempts ? "🌱" : "⚪"}</span> {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
