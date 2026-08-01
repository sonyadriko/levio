// Lingkaran progress berbasis SVG (stroke-dashoffset), tanpa dependensi.
// `value` 0–100; animasi memakai keyframe `ring-fill` (700ms, easeOutBack).

export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  className = "text-teal-600",
  trackClassName = "text-stone-200 dark:text-stone-800",
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${clamped}%`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        className={trackClassName}
        stroke="currentColor"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        stroke="currentColor"
        strokeLinecap="round"
        strokeDasharray={circumference}
        className={`animate-ring-fill ${className}`}
        style={
          {
            "--ring-circumference": circumference,
            "--ring-offset": offset,
          } as React.CSSProperties
        }
      />
    </svg>
  );
}
