export function ProgressBar({
  value,
  barClassName = "bg-teal-700",
}: {
  value: number;
  barClassName?: string;
}) {
  const width = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), 100)
    : 0;
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
      <div
        className={`h-full rounded-full transition-all ${barClassName}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
