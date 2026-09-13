import React, { useState } from "react";
import { KEYS, loadJSON, saveJSON, loadProgress, loadLeaderboard } from "./lib/storage.js";
import AvatarPicker, { AVATARS } from "./components/AvatarPicker.jsx";
import SkillMap from "./components/SkillMap.jsx";
import TopicView from "./components/TopicView.jsx";
import MixedPractice from "./components/MixedPractice.jsx";
import MockTest from "./components/MockTest.jsx";
import ProgressScreen from "./components/ProgressScreen.jsx";
import LeaderboardScreen from "./components/LeaderboardScreen.jsx";
import { getTopic } from "./content/index.js";
import { stopSpeech } from "./lib/speech.js";

export default function App() {
  const [avatar, setAvatar] = useState(() => loadJSON(KEYS.AVATAR, AVATARS[0]));
  const [playerName, setPlayerName] = useState(() => loadJSON(KEYS.NAME, ""));
  const [screen, setScreen] = useState(() => (loadJSON(KEYS.NAME, "") ? "skillmap" : "onboarding"));
  const [currentTopicId, setCurrentTopicId] = useState(null);
  const [soundOn, setSoundOn] = useState(true);

  function changeAvatar(a) { setAvatar(a); saveJSON(KEYS.AVATAR, a); }
  function changeName(n) { setPlayerName(n); saveJSON(KEYS.NAME, n); }
  function finishOnboarding() { setScreen("skillmap"); }
  function openTopic(id) { setCurrentTopicId(id); setScreen("topic"); }
  function backToMap() { setScreen("skillmap"); }

  return (
    <div className="app">
      <div className="ambient a1" /><div className="ambient a2" />

      {screen === "onboarding" && (
        <main className="home">
          <AvatarPicker avatar={avatar} playerName={playerName} onChangeAvatar={changeAvatar} onChangeName={changeName} />
          <button className="startBtn" onClick={finishOnboarding} disabled={!playerName.trim()}>Start learning!</button>
        </main>
      )}

      {screen === "skillmap" && (
        <SkillMap
          progress={loadProgress()}
          avatar={avatar}
          playerName={playerName}
          onOpenTopic={openTopic}
          onOpenMixedPractice={() => setScreen("mixedPractice")}
          onOpenMockTest={() => setScreen("mockTest")}
          onOpenProgress={() => setScreen("progress")}
          onOpenLeaderboard={() => setScreen("leaderboard")}
          soundOn={soundOn}
          onToggleSound={() => { stopSpeech(); setSoundOn(s => !s); }}
        />
      )}

      {screen === "topic" && (
        <TopicView topic={getTopic(currentTopicId)} soundOn={soundOn} avatar={avatar} onExit={backToMap} />
      )}

      {screen === "mixedPractice" && <MixedPractice soundOn={soundOn} avatar={avatar} onExit={backToMap} />}

      {screen === "mockTest" && <MockTest avatar={avatar} playerName={playerName} onExit={backToMap} />}

      {screen === "progress" && <ProgressScreen progress={loadProgress()} avatar={avatar} onBack={backToMap} />}

      {screen === "leaderboard" && <LeaderboardScreen entries={loadLeaderboard()} avatar={avatar} onBack={backToMap} />}
    </div>
  );
}
