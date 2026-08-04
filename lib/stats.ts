import {
  addDays,
  dateKeyOf,
  mondayOf,
  monthKeyOf,
  monthLabel,
  yearKeyOf,
} from "./date";
import type { ActivityDay, ProgressState } from "./progress";

export interface PeriodTotals {
  xp: number;
  reviews: number;
  tests: number;
  activeDays: number;
}

export interface SeriesPoint {
  label: string;
  totals: PeriodTotals;
}

export const emptyTotals = (): PeriodTotals => ({
  xp: 0,
  reviews: 0,
  tests: 0,
  activeDays: 0,
});

function activityTotals(activity: Record<string, ActivityDay>): PeriodTotals {
  const totals = emptyTotals();
  for (const key of Object.keys(activity)) {
    const day = activity[key];
    totals.xp += day.xp;
    totals.reviews += day.reviews;
    totals.tests += day.tests;
    totals.activeDays += 1;
  }
  return totals;
}

function totalsForRange(
  activity: Record<string, ActivityDay>,
  start: Date,
  end: Date,
): PeriodTotals {
  const startKey = dateKeyOf(start);
  const endKey = dateKeyOf(end);
  const totals = emptyTotals();
  for (const key of Object.keys(activity)) {
    if (key < startKey || key > endKey) continue;
    const day = activity[key];
    totals.xp += day.xp;
    totals.reviews += day.reviews;
    totals.tests += day.tests;
    totals.activeDays += 1;
  }
  return totals;
}

function dayToTotals(day: ActivityDay | undefined): PeriodTotals {
  if (!day) return emptyTotals();
  return { xp: day.xp, reviews: day.reviews, tests: day.tests, activeDays: 1 };
}

export function totalsToday(activity: Record<string, ActivityDay>): PeriodTotals {
  return dayToTotals(activity[dateKeyOf(new Date())]);
}

export function totalsThisWeek(activity: Record<string, ActivityDay>): PeriodTotals {
  const monday = mondayOf(new Date());
  return totalsForRange(activity, monday, new Date());
}

export function totalsThisMonth(activity: Record<string, ActivityDay>): PeriodTotals {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return totalsForRange(activity, start, now);
}

export function totalsThisYear(activity: Record<string, ActivityDay>): PeriodTotals {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return totalsForRange(activity, start, now);
}

export function dailySeries(
  activity: Record<string, ActivityDay>,
  days: number,
): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(new Date(), -i);
    points.push({
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      totals: dayToTotals(activity[dateKeyOf(d)]),
    });
  }
  return points;
}

export function weeklySeries(
  activity: Record<string, ActivityDay>,
  weeks: number,
): SeriesPoint[] {
  const thisMonday = mondayOf(new Date());
  const points: SeriesPoint[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const monday = addDays(thisMonday, -7 * i);
    const start = monday;
    const end = addDays(monday, 6);
    points.push({
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      totals: totalsForRange(activity, start, end),
    });
  }
  return points;
}

export function monthlySeries(
  activity: Record<string, ActivityDay>,
  months: number,
): SeriesPoint[] {
  const now = new Date();
  const points: SeriesPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d;
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    points.push({
      label: monthLabel(d),
      totals: totalsForRange(activity, start, end),
    });
  }
  return points;
}

export function yearlySeries(
  activity: Record<string, ActivityDay>,
  years: number,
): SeriesPoint[] {
  const now = new Date();
  const points: SeriesPoint[] = [];
  for (let i = years - 1; i >= 0; i--) {
    const year = now.getFullYear() - i;
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    points.push({
      label: String(year),
      totals: totalsForRange(activity, start, end),
    });
  }
  return points;
}

export function heatmap(
  activity: Record<string, ActivityDay>,
  weeks = 12,
): { date: Date; key: string; xp: number }[] {
  const today = new Date();
  const thisMonday = mondayOf(today);
  const start = addDays(thisMonday, -(weeks - 1) * 7);
  const cells: { date: Date; key: string; xp: number }[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i);
    const key = dateKeyOf(d);
    cells.push({
      date: d,
      key,
      xp: d > today ? 0 : activity[key]?.xp ?? 0,
    });
  }
  return cells;
}

export function heatmapLevel(xp: number): number {
  if (xp <= 0) return 0;
  if (xp < 20) return 1;
  if (xp < 50) return 2;
  if (xp < 100) return 3;
  return 4;
}

export function bestStreak(activity: Record<string, ActivityDay>): number {
  const dayNumber = (key: string): number => {
    const [y, m, d] = key.split("-").map(Number);
    return Math.round(Date.UTC(y, m - 1, d) / 86400000);
  };
  const days = Object.keys(activity).map(dayNumber).sort((a, b) => a - b);
  let best = 0;
  let current = 0;
  let prev: number | null = null;
  for (const day of days) {
    if (prev !== null && day - prev === 1) current += 1;
    else current = 1;
    prev = day;
    best = Math.max(best, current);
  }
  return best;
}

export function summarize(progress: ProgressState) {
  const words = progress.words;
  const mastered = Object.values(words).filter((w) => w.mastered).length;
  const reviewed = Object.keys(words).length;
  const totalActivity = activityTotals(progress.activityByDate);

  return {
    xp: progress.xp,
    streak: progress.streak,
    bestStreak: bestStreak(progress.activityByDate),
    mastered,
    reviewed,
    activeDays: totalActivity.activeDays,
    completedReviews: progress.completedReviews,
    completedTests: progress.completedTests,
    lastTest: progress.lastTest,
    lastMonthKey: monthKeyOf(new Date()),
    lastYear: yearKeyOf(new Date()),
  };
}

// Rata-rata kata baru per hari kalender dalam `days` hari terakhir —
// dasar proyeksi kapan sebuah level selesai. 0 bila tidak ada aktivitas.
export function avgNewWordsPerDay(
  activity: Record<string, ActivityDay>,
  days = 30,
): number {
  let sum = 0;
  const start = addDays(new Date(), -(days - 1));
  const startKey = dateKeyOf(start);
  for (const [key, day] of Object.entries(activity)) {
    if (key < startKey) continue;
    sum += day.newWords ?? 0;
  }
  return Math.round((sum / days) * 10) / 10;
}

export interface RetentionMetrics {
  reviewed: number;
  mastered: number;
  leeches: number;
  dueToday: number;
  remembered: number;
  retentionRate: number;
}

// Proksi retensi: dari semua kata yang pernah direview, berapa yang jadwal
// review berikutnya masih di masa depan (dianggap "diingat" hari ini).
export function retentionMetrics(progress: ProgressState): RetentionMetrics {
  const today = dateKeyOf(new Date());
  const words = Object.values(progress.words);
  const reviewed = words.length;
  const mastered = words.filter((w) => w.mastered).length;
  const leeches = words.filter((w) => w.reviews >= 4 && w.correct / w.reviews < 0.35).length;
  const dueToday = words.filter(
    (w) => w.nextReview && w.nextReview <= today,
  ).length;
  const remembered = Math.max(0, reviewed - dueToday);
  const retentionRate = reviewed > 0 ? Math.round((remembered / reviewed) * 100) : 0;
  return { reviewed, mastered, leeches, dueToday, remembered, retentionRate };
}

// Proyeksi selesai sebuah level: berapa hari lagi sampai seluruh kata
// dikuasai, berdasar kecepatan kata baru 30 hari terakhir. null = tak terhitung.
export function estimateDaysToMaster(
  progress: ProgressState,
  totalWords: number,
  mastered: number,
): number | null {
  const remaining = Math.max(0, totalWords - mastered);
  if (remaining === 0) return 0;
  const pace = avgNewWordsPerDay(progress.activityByDate);
  if (pace <= 0) return null;
  return Math.ceil(remaining / pace);
}
