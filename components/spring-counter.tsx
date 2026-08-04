"use client";

import { useEffect, useRef, useState } from "react";
import { useCountUp } from "@/lib/use-count-up";

// Angka dengan count-up + bump pegas saat nilai berubah (lihat docs/motion.md).
// Bump hanya sekali per perubahan nilai, tidak saat mount pertama.
export function SpringCounter({
  value,
  duration = 700,
  className = "",
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const shown = useCountUp(value, duration);
  const [bump, setBump] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    prev.current = value;
    setBump(true);
    const id = window.setTimeout(() => setBump(false), 400);
    return () => window.clearTimeout(id);
  }, [value]);

  return (
    <span
      className={`inline-block tabular-nums ${bump ? "animate-count-bump" : ""} ${className}`}
    >
      {shown}
    </span>
  );
}
