"use client";

import { useId } from "react";

export interface ChartPoint {
  label: string;
  value: number;
}

function toPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
}

function pickLabels(count: number, limit: number): number[] {
  if (count <= limit) return Array.from({ length: count }, (_, i) => i);
  const result = new Set<number>([0, count - 1]);
  for (let i = 1; i < limit - 1; i += 1) {
    result.add(Math.round((i / (limit - 1)) * (count - 1)));
  }
  return Array.from(result).sort((a, b) => a - b);
}

export function LineChart({
  data,
  height = 140,
  formatValue,
}: {
  data: ChartPoint[];
  height?: number;
  formatValue: (value: number) => string;
}) {
  const gradientId = useId();
  const width = 320;
  const padL = 36;
  const padR = 10;
  const padT = 12;
  const padB = 22;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const values = data.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = rawMax - rawMin;
  const pad = spread === 0 ? Math.max(rawMax * 0.1, 1) : spread * 0.15;
  const min = Math.max(0, rawMin - pad);
  const max = rawMax + pad;
  const range = max - min || 1;

  const points = data.map((d, i) => ({
    x: data.length > 1 ? padL + (i / (data.length - 1)) * innerW : padL + innerW / 2,
    y: padT + innerH * (1 - (d.value - min) / range),
    label: d.label,
    value: d.value,
  }));

  const labelIndices = pickLabels(data.length, 5);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="chart"
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-teal-500)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-teal-500)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((fraction) => {
        const y = padT + innerH * (1 - fraction);
        const value = min + fraction * range;
        return (
          <g key={fraction}>
            <line
              x1={padL}
              y1={y}
              x2={width - padR}
              y2={y}
              className="stroke-stone-200 dark:stroke-stone-800"
              strokeWidth={1}
            />
            <text
              x={padL - 4}
              y={y + 3}
              textAnchor="end"
              className="fill-stone-400 text-[9px]"
            >
              {formatValue(value)}
            </text>
          </g>
        );
      })}

      {labelIndices.map((i) => (
        <text
          key={i}
          x={points[i].x}
          y={height - 6}
          textAnchor="middle"
          className="fill-stone-400 text-[9px]"
        >
          {points[i].label}
        </text>
      ))}

      <polygon
        points={[
          `${padL},${padT + innerH}`,
          ...points.map((p) => `${p.x},${p.y}`),
          `${width - padR},${padT + innerH}`,
        ].join(" ")}
        fill={`url(#${gradientId})`}
      />

      <path
        d={toPath(points)}
        className="stroke-teal-600 dark:stroke-teal-500"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {points.map((p) => (
        <circle
          key={p.label}
          cx={p.x}
          cy={p.y}
          r={2.5}
          className="fill-teal-600 dark:fill-teal-500"
        />
      ))}

      {points.length > 0 ? (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={5}
          className="fill-none stroke-teal-500"
          strokeWidth={2}
        />
      ) : null}
    </svg>
  );
}
