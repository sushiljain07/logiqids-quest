import React from "react";
import { Home } from "lucide-react";

export default function Header({ onBack, avatar, title = "LogiQids Quest" }) {
  return (
    <header className="header">
      <button className="iconBtn" onClick={onBack} aria-label="Home"><Home size={19} /></button>
      <div className="brand"><span className="brandMark">🧩</span><div><b>{title}</b><small>Learn • Play • Master</small></div></div>
      {avatar && <div className="avatarChip">{avatar}</div>}
    </header>
  );
}
