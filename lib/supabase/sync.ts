import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_EASE,
  emptyProgress,
  MAX_HSK_LEVEL,
  type ProgressState,
} from "@/lib/progress";
import { DEFAULT_SETTINGS, type UserSettings } from "@/lib/settings";
import {
  emptyGym,
  normalizeSession,
  type GymSession,
  type GymState,
} from "@/lib/gym";
import type {
  ActivityRow,
  GymSessionRow,
  GymXpByDateRow,
  LastTestRow,
  ProfileRow,
  WordRow,
} from "./types";

type Client = SupabaseClient;

export function hasLocalData(state: ProgressState): boolean {
  return (
    state.xp > 0 ||
    state.completedReviews > 0 ||
    state.completedTests > 0 ||
    Object.keys(state.words).length > 0 ||
    Object.keys(state.activityByDate).length > 0 ||
    state.lastTest !== null
  );
}

export function hasCloudData(profile: ProfileRow | null): boolean {
  return Boolean(
    profile &&
      (profile.xp > 0 ||
        profile.completed_reviews > 0 ||
        profile.completed_tests > 0 ||
        profile.last_active_date),
  );
}

const DELETE_CHUNK = 900;

// Hapus baris cloud milik user yang tidak ada lagi di state (mis. setelah
// import dataset lebih kecil atau reset kata). Dijalankan per-chunk agar tidak
// melebihi batas argumen PostgREST untuk `in`.
async function deleteStaleRows(
  client: Client,
  userId: string,
  table:
    | "daily_activity"
    | "word_progress"
    | "gym_sessions"
    | "gym_xp_by_date",
  idColumn: "date" | "word_id" | "session_id",
  keep: string[],
): Promise<boolean> {
  const { data, error } = await client
    .from(table)
    .select(idColumn)
    .eq("user_id", userId);
  if (error) return false;

  const keepSet = new Set(keep);
  const stale: string[][] = [[]];
  for (const row of data ?? []) {
    const id = (row as { [k: string]: string | null })[idColumn] as string;
    if (keepSet.has(id)) continue;
    const last = stale[stale.length - 1];
    if (last.length >= DELETE_CHUNK) stale.push([]);
    stale[stale.length - 1].push(id);
  }

  const results = await Promise.all(
    stale.map((ids) =>
      ids.length === 0
        ? Promise.resolve({ error: null })
        : client.from(table).delete().eq("user_id", userId).in(idColumn, ids),
    ),
  );
  return results.every((result) => !result.error);
}

export async function pushProgress(
  client: Client,
  userId: string,
  state: ProgressState,
): Promise<boolean> {
  const activityRows: ActivityRow[] = Object.entries(state.activityByDate).map(
    ([date, day]) => ({
      user_id: userId,
      date,
      xp: day.xp,
      reviews: day.reviews,
      tests: day.tests,
      new_words: day.newWords ?? 0,
    }),
  );

  const wordRows: WordRow[] = Object.entries(state.words).map(
    ([wordId, word]) => ({
      user_id: userId,
      word_id: wordId,
      reviews: word.reviews,
      correct: word.correct,
      mastered: word.mastered,
      next_review: word.nextReview,
      ease: word.ease,
      repetitions: word.repetitions,
    }),
  );

  const ops: PromiseLike<{ error: Error | null }>[] = [
    client.from("profiles").upsert({
      user_id: userId,
      xp: state.xp,
      streak: state.streak,
      last_active_date: state.lastActiveDate,
      completed_reviews: state.completedReviews,
      completed_tests: state.completedTests,
      unlocked_up_to: state.unlockedUpTo,
      updated_at: new Date().toISOString(),
    }),
    client.from("last_test").upsert({
      user_id: userId,
      correct: state.lastTest?.correct ?? 0,
      total: state.lastTest?.total ?? 0,
      date: state.lastTest?.date ?? null,
      updated_at: new Date().toISOString(),
    }),
  ];

  if (activityRows.length > 0) {
    ops.push(client.from("daily_activity").upsert(activityRows));
  }
  if (wordRows.length > 0) {
    ops.push(client.from("word_progress").upsert(wordRows));
  }

  // Bersihkan baris cloud yang sudah tidak ada di state agar tidak "bangkit
  // kembali" saat pull berikutnya (B4/B9).
  const [staleActivity, staleWords] = await Promise.all([
    deleteStaleRows(
      client,
      userId,
      "daily_activity",
      "date",
      Object.keys(state.activityByDate),
    ),
    deleteStaleRows(
      client,
      userId,
      "word_progress",
      "word_id",
      Object.keys(state.words),
    ),
  ]);

  const results = await Promise.all(ops);
  return results.every((result) => !result.error) && staleActivity && staleWords;
}

export async function deleteAllData(
  client: Client,
  userId: string,
): Promise<boolean> {
  const results = await Promise.all([
    client.from("profiles").delete().eq("user_id", userId),
    client.from("last_test").delete().eq("user_id", userId),
    client.from("daily_activity").delete().eq("user_id", userId),
    client.from("word_progress").delete().eq("user_id", userId),
  ]);
  return results.every((result) => !result.error);
}

export async function pullProfile(
  client: Client,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("pull_profile_failed");
  return (data as ProfileRow | null) ?? null;
}

export async function pullProgress(
  client: Client,
  userId: string,
): Promise<ProgressState | null> {
  const [profileRes, activityRes, wordsRes, testRes] = await Promise.all([
    client.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    client.from("daily_activity").select("*").eq("user_id", userId),
    client.from("word_progress").select("*").eq("user_id", userId),
    client.from("last_test").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  if (
    profileRes.error ||
    activityRes.error ||
    wordsRes.error ||
    testRes.error
  ) {
    throw new Error("pull_progress_failed");
  }

  const profile = profileRes.data as ProfileRow | null;
  if (!profile) return null;

  const state = emptyProgress();
  state.xp = profile.xp;
  state.streak = profile.streak;
  state.lastActiveDate = profile.last_active_date;
  state.completedReviews = profile.completed_reviews;
  state.completedTests = profile.completed_tests;
  if (typeof profile.unlocked_up_to === "number") {
    state.unlockedUpTo = Math.min(MAX_HSK_LEVEL, Math.max(1, profile.unlocked_up_to));
  }

  for (const row of (activityRes.data ?? []) as ActivityRow[]) {
    state.activityByDate[row.date] = {
      xp: row.xp,
      reviews: row.reviews,
      tests: row.tests,
      newWords: typeof row.new_words === "number" ? row.new_words : 0,
    };
  }
  for (const row of (wordsRes.data ?? []) as WordRow[]) {
    state.words[row.word_id] = {
      reviews: row.reviews,
      correct: row.correct,
      mastered: row.mastered,
      nextReview: row.next_review,
      ease: typeof row.ease === "number" ? row.ease : DEFAULT_EASE,
      repetitions:
        typeof row.repetitions === "number" ? row.repetitions : 0,
    };
  }

  const test = testRes.data as LastTestRow | null;
  if (test && test.total > 0) {
    state.lastTest = {
      correct: test.correct,
      total: test.total,
      date: test.date ?? "",
    };
  }

  return state;
}

export async function pushSettings(
  client: Client,
  userId: string,
  settings: UserSettings,
): Promise<boolean> {
  const { error } = await client.from("profiles").upsert({
    user_id: userId,
    name: settings.name,
    daily_targets: settings.dailyTargets,
    updated_at: new Date().toISOString(),
  });
  return !error;
}

const TARGET_MIN = 1;
const TARGET_MAX = 100;

// Settings dianggap "belum ada" bila nama kosong dan target masih default —
// baris yang dibuat pushProgress/pushSettings default tidak boleh menimpa
// pengaturan lokal yang sudah diisi pengguna.
function isEmptySettings(row: {
  name?: string | null;
  daily_targets?: { vocab?: number; reviews?: number; xp?: number } | null;
}): boolean {
  const name = typeof row.name === "string" ? row.name.trim() : "";
  const targets = row.daily_targets;
  return (
    name === "" &&
    (targets?.vocab ?? DEFAULT_SETTINGS.dailyTargets.vocab) ===
      DEFAULT_SETTINGS.dailyTargets.vocab &&
    (targets?.reviews ?? DEFAULT_SETTINGS.dailyTargets.reviews) ===
      DEFAULT_SETTINGS.dailyTargets.reviews &&
    (targets?.xp ?? DEFAULT_SETTINGS.dailyTargets.xp) ===
      DEFAULT_SETTINGS.dailyTargets.xp
  );
}

export async function pullSettings(
  client: Client,
  userId: string,
): Promise<UserSettings | null> {
  const { data, error } = await client
    .from("profiles")
    .select("name, daily_targets")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("pull_settings_failed");
  if (!data) return null;

  const row = data as {
    name?: string | null;
    daily_targets?: { vocab?: number; reviews?: number; xp?: number } | null;
  };
  // Baris cloud kosong (nama default/target default) → anggap tidak ada, biar
  // settings lokal yang di-upload.
  if (isEmptySettings(row)) return null;

  const clamp = (v: number) => Math.min(TARGET_MAX, Math.max(TARGET_MIN, v));
  const targets = row.daily_targets ?? {};
  return {
    name: typeof row.name === "string" ? row.name : DEFAULT_SETTINGS.name,
    dailyTargets: {
      vocab: clamp(
        typeof targets.vocab === "number"
          ? targets.vocab
          : DEFAULT_SETTINGS.dailyTargets.vocab,
      ),
      reviews: clamp(
        typeof targets.reviews === "number"
          ? targets.reviews
          : DEFAULT_SETTINGS.dailyTargets.reviews,
      ),
      xp: clamp(
        typeof targets.xp === "number"
          ? targets.xp
          : DEFAULT_SETTINGS.dailyTargets.xp,
      ),
    },
    theme: DEFAULT_SETTINGS.theme,
  };
}

// ==================== GYM ====================

export function hasLocalGymData(state: GymState): boolean {
  return state.sessions.length > 0 || Object.keys(state.xpByDate).length > 0;
}

export function hasCloudGymData(state: GymState): boolean {
  return state.sessions.length > 0 || Object.keys(state.xpByDate).length > 0;
}

function gymSessionToRow(userId: string, session: GymSession): GymSessionRow {
  return {
    user_id: userId,
    session_id: session.id,
    title: session.title,
    template_id: session.templateId ?? null,
    program_id: session.programId ?? null,
    program_week: session.programWeek ?? null,
    program_day: session.programDay ?? null,
    date: session.date,
    started_at: session.startedAt,
    completed_at: session.completedAt,
    exercises: session.exercises,
    updated_at: new Date().toISOString(),
  };
}

function gymRowToSession(row: GymSessionRow): GymSession {
  return normalizeSession({
    id: row.session_id,
    title: row.title,
    templateId: row.template_id ?? undefined,
    programId: row.program_id ?? undefined,
    programWeek: row.program_week ?? undefined,
    programDay: row.program_day ?? undefined,
    date: row.date,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    exercises: Array.isArray(row.exercises) ? (row.exercises as GymSession["exercises"]) : [],
  });
}

// Push gym lokal ke cloud: upsert semua sesi + XP harian, lalu hapus baris
// cloud yang tidak ada lagi di state (sesi yang dihapus / tanggal XP reset).
export async function pushGym(
  client: Client,
  userId: string,
  state: GymState,
): Promise<boolean> {
  const sessionRows = state.sessions.map((session) =>
    gymSessionToRow(userId, session),
  );
  const xpRows: GymXpByDateRow[] = Object.entries(state.xpByDate).map(
    ([date, xp]) => ({ user_id: userId, date, xp }),
  );

  const ops: PromiseLike<{ error: Error | null }>[] = [];
  if (sessionRows.length > 0) {
    ops.push(client.from("gym_sessions").upsert(sessionRows));
  }
  if (xpRows.length > 0) {
    ops.push(client.from("gym_xp_by_date").upsert(xpRows));
  }

  const [staleSessions, staleXp] = await Promise.all([
    deleteStaleRows(
      client,
      userId,
      "gym_sessions",
      "session_id",
      state.sessions.map((s) => s.id),
    ),
    deleteStaleRows(
      client,
      userId,
      "gym_xp_by_date",
      "date",
      Object.keys(state.xpByDate),
    ),
  ]);

  const results = await Promise.all(ops);
  return results.every((result) => !result.error) && staleSessions && staleXp;
}

export async function pullGym(
  client: Client,
  userId: string,
): Promise<GymState | null> {
  const [sessionsRes, xpRes] = await Promise.all([
    client.from("gym_sessions").select("*").eq("user_id", userId),
    client.from("gym_xp_by_date").select("*").eq("user_id", userId),
  ]);

  if (sessionsRes.error || xpRes.error) {
    throw new Error("pull_gym_failed");
  }

  const sessionRows = (sessionsRes.data ?? []) as GymSessionRow[];
  const xpRows = (xpRes.data ?? []) as GymXpByDateRow[];
  if (sessionRows.length === 0 && xpRows.length === 0) return null;

  const state = emptyGym();
  state.sessions = sessionRows.map(gymRowToSession);
  for (const row of xpRows) {
    state.xpByDate[row.date] = Math.max(0, row.xp);
  }
  return state;
}

export async function deleteGymData(
  client: Client,
  userId: string,
): Promise<boolean> {
  const results = await Promise.all([
    client.from("gym_sessions").delete().eq("user_id", userId),
    client.from("gym_xp_by_date").delete().eq("user_id", userId),
  ]);
  return results.every((result) => !result.error);
}
