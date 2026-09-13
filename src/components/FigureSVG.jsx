import React from "react";

export default function FigureSVG({ spec, size = 160 }) {
  if (!spec) return null;
  const { width, height, shapes } = spec;
  const displayHeight = size * (height / width);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={size} height={displayHeight} role="img" aria-label="puzzle figure">
      {shapes.map((s, i) => {
        if (s.type === "rect") return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.fill || "none"} stroke={s.stroke || "none"} strokeWidth={s.strokeWidth || 2} />;
        if (s.type === "line") return <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.stroke || "#25233a"} strokeWidth={s.strokeWidth || 2} />;
        if (s.type === "polygon") return <polygon key={i} points={s.points} fill={s.fill || "none"} stroke={s.stroke || "none"} strokeWidth={s.strokeWidth || 2} />;
        if (s.type === "circle") return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill || "none"} stroke={s.stroke || "none"} strokeWidth={s.strokeWidth || 2} />;
        if (s.type === "text") return <text key={i} x={s.x} y={s.y} fontSize={s.fontSize || 14} fill={s.fill || "#25233a"}>{s.text}</text>;
        return null;
      })}
    </svg>
  );
}
