import React from "react";
import Header from "./Header.jsx";

export default function LeaderboardScreen({ entries, avatar, onBack }) {
  const medals = ["🥇", "🥈", "🥉", "4", "5"];
  return (
    <main className="result">
      <Header onBack={onBack} avatar={avatar} />
      <section className="panel listPanel">
        <h2>Top Mock Test Scores</h2>
        {entries.length === 0 && <div className="emptyState">Take a mock test to get on the leaderboard!</div>}
        {entries.map((e, i) => (
          <div className="leaderRow" key={i}>
            <span className="leaderRank">{medals[i]}</span>
            <span className="leaderAvatar">{e.avatar}</span>
            <div className="leaderInfo"><b>{e.name}</b><small>{e.raw} pts</small></div>
            <span className="leaderPct">{e.pct}%</span>
          </div>
        ))}
      </section>
    </main>
  );
}
