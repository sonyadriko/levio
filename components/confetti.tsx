"use client";

import { useMemo } from "react";

const COLORS = [
  "#14b8a6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#3b82f6",
  "#ec4899",
];

interface Piece {
  left: number;
  delay: number;
  duration: number;
  color: string;
  width: number;
  height: number;
  round: boolean;
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 2 + Math.random() * 1.2,
    color: COLORS[i % COLORS.length],
    width: 6 + Math.random() * 6,
    height: 8 + Math.random() * 8,
    round: Math.random() > 0.5,
  }));
}

// Confetti ringan (CSS keyframe `confetti-fall`, tanpa dependensi eksternal).
export function Confetti({ count = 24 }: { count?: number }) {
  const pieces = useMemo(() => makePieces(count), [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
