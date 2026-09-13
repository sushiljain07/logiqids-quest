import React from "react";
import { Star, ListOrdered, Timer, BarChart3, Volume2, VolumeX } from "lucide-react";
import { CATEGORIES } from "../content/categories.js";
import { TOPICS_BY_CATEGORY } from "../content/index.js";
import { isTopicEverMastered } from "../lib/scoring.js";

export default function SkillMap({ progress, avatar, onOpenTopic, onOpenMixedPractice, onOpenMockTest, onOpenProgress, onOpenLeaderboard, soundOn = true, onToggleSound = () => {} }) {
  return (
    <main className="skillMap">
      <div className="skillMapHero">
        <h1>Ready to learn something fun today, {avatar}?</h1>
        <p>Pick a topic below to start a lesson.</p>
      </div>
      {CATEGORIES.map(cat => (
        <section key={cat.id} className="categoryZone" style={{ "--zoneColor": cat.color }}>
          <h2><span className="categoryIcon">{cat.icon}</span> {cat.name}</h2>
          <div className="topicRow">
            {TOPICS_BY_CATEGORY[cat.id].map((topic, i) => {
              const rec = progress[topic.id];
              const mastered = isTopicEverMastered(rec);
              const prevTopic = TOPICS_BY_CATEGORY[cat.id][i - 1];
              const locked = i > 0 && !isTopicEverMastered(progress[prevTopic?.id]);
              return (
                <button key={topic.id} data-topic-id={topic.id}
                  className={"topicNode " + (mastered ? "mastered" : locked ? "locked" : "unlocked")}
                  disabled={locked} onClick={() => !locked && onOpenTopic(topic.id)}>
                  <span className="topicNodeIcon">{mastered ? "⭐" : locked ? "🔒" : "▶️"}</span>
                  <span className="topicNodeTitle">{topic.title}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <div className="skillMapFooter">
        <button className="navChip" onClick={onOpenMixedPractice}><Timer size={16} /> Mixed Practice</button>
        <button className="navChip" onClick={onOpenMockTest}><ListOrdered size={16} /> Mock Test</button>
        <button className="navChip" onClick={onOpenProgress}><BarChart3 size={16} /> My Progress</button>
        <button className="navChip" onClick={onOpenLeaderboard}><Star size={16} /> Leaderboard</button>
        {/* The only place to mute the spoken explanations; reachable from anywhere via Header's Home button. */}
        <button className="navChip" data-testid="soundToggle" aria-pressed={soundOn} onClick={onToggleSound}>
          {soundOn ? <><Volume2 size={16} /> Sound On</> : <><VolumeX size={16} /> Sound Off</>}
        </button>
      </div>
    </main>
  );
}
