import React from "react";

export const AVATARS = ["🦁", "🐯", "🦊", "🐼", "🦄", "🐵", "🐸", "🦋"];

export default function AvatarPicker({ avatar, playerName, onChangeAvatar, onChangeName }) {
  return (
    <div className="avatarPickerBlock">
      <h2>Who's playing?</h2>
      <input className="nameInput" value={playerName} maxLength={16} placeholder="Type your name"
        onChange={e => onChangeName(e.target.value)} />
      <div className="avatarPicker">
        {AVATARS.map(a => (
          <button key={a} className={"avatarBtn " + (avatar === a ? "active" : "")}
            onClick={() => onChangeAvatar(a)} aria-label={`Choose avatar ${a}`}>{a}</button>
        ))}
      </div>
    </div>
  );
}
