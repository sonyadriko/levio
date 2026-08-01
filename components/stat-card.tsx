import { Icon } from "@/components/icons";

export type StatCardIcon = "flame" | "check" | "chart" | "pen" | "book";

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: StatCardIcon;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3.5 dark:border-stone-800 dark:bg-stone-950">
      <div className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
        <Icon name={icon} className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
