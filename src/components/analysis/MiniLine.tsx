import React from "react";

export default function MiniLine({ points }: { points: number[] }) {
  const w = 280, h = 64, pad = 6;
  const min = Math.min(...points, 0);
  const max = Math.max(...points, 1);
  const dx = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const scaleY = (v: number) => {
    const norm = max === min ? 0 : (v - min) / (max - min);
    return h - pad - norm * (h - pad * 2);
  };
  const d = points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${pad + i * dx},${scaleY(v)}`)
    .join(" ");

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <path d={d} fill="none" stroke="rgb(79,70,229)" strokeWidth="2" />
    </svg>
  );
}
