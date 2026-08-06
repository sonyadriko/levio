import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatsDashboard } from "@/components/stats-dashboard";
import { T } from "@/components/translate";

export default function StatsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="chart"
        accent="bg-teal-600"
        title={<T id="stats.title" />}
        subtitle={<T id="stats.subtitle" />}
      />

      <Link
        href="/leaderboard"
        className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:border-amber-400 dark:border-amber-800 dark:bg-amber-500/10 dark:hover:border-amber-600"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white">
          <Icon name="trophy" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            <T id="leaderboard.title" />
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-500">
            <T id="leaderboard.subtitle" />
          </p>
        </div>
        <span className="text-amber-300 dark:text-amber-700">→</span>
      </Link>

      <StatsDashboard />
    </div>
  );
}