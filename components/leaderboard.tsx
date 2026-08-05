"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import {
  leaderName,
  rankMedal,
  type LeaderboardRow,
} from "@/lib/leaderboard";

const MEDAL_COLORS: Record<string, string> = {
  gold: "bg-amber-500",
  silver: "bg-stone-400",
  bronze: "bg-orange-700",
};

function RankCell({ rank }: { rank: number }) {
  const medal = rankMedal(rank);
  if (medal) {
    return (
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${MEDAL_COLORS[medal]}`}
      >
        <Icon name="trophy" className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span className="w-7 shrink-0 text-center text-sm font-semibold tabular-nums text-stone-500 dark:text-stone-400">
      {rank}
    </span>
  );
}

export function Leaderboard() {
  const { t } = useLanguage();
  const { configured, user } = useAuth();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data: { rows?: LeaderboardRow[]; error?: boolean }) => {
        if (cancelled) return;
        if (data && data.error) {
          setError(true);
          return;
        }
        setRows(Array.isArray(data.rows) ? data.rows : []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [configured]);

  if (error) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">
        {t("leaderboard.error")}
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400">
        {t("leaderboard.disabled")}
      </div>
    );
  }

  if (rows === null) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">
        {t("leaderboard.loading")}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400">
        {user ? t("leaderboard.empty") : t("leaderboard.signIn")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={row.rank}
            className={`flex items-center gap-3 rounded-xl border p-3 ${
              row.is_me
                ? "border-teal-400 bg-teal-50 dark:border-teal-700 dark:bg-teal-500/10"
                : "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950"
            }`}
          >
            <RankCell rank={row.rank} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {leaderName(row.name, t("leaderboard.player"))}
              </p>
            </div>
            {row.is_me && (
              <span className="rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                {t("leaderboard.you")}
              </span>
            )}
            <span className="shrink-0 text-sm font-bold tabular-nums">
              {row.xp} {t("common.xp")}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-xs leading-relaxed text-stone-400">
        {t("leaderboard.hint")}
      </p>
    </div>
  );
}
