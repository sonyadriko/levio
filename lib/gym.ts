import { dateKeyOf, mondayOf, todayKey } from "./date";
import { defaultRestSeconds, getExerciseDef } from "./gym-exercises";

export const GYM_STORAGE_KEY = "levio.gym.v2";
export const GYM_XP_PER_SESSION = 10;
export const MAX_GYM_XP_PER_DAY = 30;

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core";

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "core",
];

export interface GymSet {
  weightKg: number;
  reps: number;
  done: boolean;
}

export interface GymExerciseLog {
  id: string;
  name: string;
  muscles: MuscleGroup[];
  sets: GymSet[];
  notes: string;
  exerciseId?: string;
  restSeconds?: number;
}

export interface GymSession {
  id: string;
  title: string;
  templateId?: string;
  date: string;
  startedAt: number;
  completedAt: number | null;
  exercises: GymExerciseLog[];
}

export interface GymState {
  activeSession: GymSession | null;
  sessions: GymSession[];
  xpByDate: Record<string, number>;
}

export interface MuscleVolume {
  muscleGroup: MuscleGroup;
  volume: number;
}

export interface RoutineExercise {
  exerciseKey: string;
  exerciseId: string;
  muscles: MuscleGroup[];
  defaultSets: number;
}

export interface RoutineTemplate {
  id: string;
  nameKey: string;
  exercises: RoutineExercise[];
}

export interface SessionDraft {
  templateId?: string;
  title: string;
  exercises: GymExerciseLog[];
}

export function emptyGym(): GymState {
  return { activeSession: null, sessions: [], xpByDate: {} };
}

export function makeId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function emptySet(): GymSet {
  return { weightKg: 0, reps: 0, done: false };
}

function emptyExercise(): GymExerciseLog {
  return { id: makeId(), name: "", muscles: [], sets: [], notes: "" };
}

function normalizeSet(raw: Partial<GymSet>): GymSet {
  return {
    weightKg: Math.max(0, toNumber(raw.weightKg)),
    reps: Math.max(0, Math.round(toNumber(raw.reps))),
    done: raw.done === true,
  };
}

function normalizeExercise(raw: Partial<GymExerciseLog>): GymExerciseLog {
  const sets = Array.isArray(raw.sets)
    ? raw.sets.filter((s) => !!s && typeof s === "object").map(normalizeSet)
    : [];
  const muscles = Array.isArray(raw.muscles)
    ? raw.muscles.filter((m): m is MuscleGroup =>
        MUSCLE_GROUPS.includes(m as MuscleGroup),
      )
    : [];
  const restSeconds = toNumber(raw.restSeconds);
  return {
    id: typeof raw.id === "string" ? raw.id : makeId(),
    name: typeof raw.name === "string" ? raw.name : "",
    muscles: Array.from(new Set(muscles)),
    sets,
    notes: typeof raw.notes === "string" ? raw.notes : "",
    exerciseId: typeof raw.exerciseId === "string" ? raw.exerciseId : undefined,
    restSeconds: restSeconds > 0 ? restSeconds : undefined,
  };
}

function normalizeSession(raw: Partial<GymSession>): GymSession {
  const exercises = Array.isArray(raw.exercises)
    ? raw.exercises
        .filter((e) => !!e && typeof e === "object")
        .map(normalizeExercise)
    : [];
  const date =
    typeof raw.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)
      ? raw.date
      : todayKey();
  return {
    id: typeof raw.id === "string" ? raw.id : makeId(),
    title: typeof raw.title === "string" ? raw.title : "",
    templateId:
      typeof raw.templateId === "string" ? raw.templateId : undefined,
    date,
    startedAt: Math.max(0, toNumber(raw.startedAt)),
    completedAt:
      typeof raw.completedAt === "number" && Number.isFinite(raw.completedAt)
        ? raw.completedAt
        : null,
    exercises,
  };
}

export function loadGym(): GymState {
  if (typeof window === "undefined") return emptyGym();
  try {
    const raw = window.localStorage.getItem(GYM_STORAGE_KEY);
    if (!raw) return emptyGym();
    const parsed = JSON.parse(raw) as Partial<GymState>;

    const sessions = Array.isArray(parsed.sessions)
      ? parsed.sessions
          .filter((s) => !!s && typeof s === "object")
          .map(normalizeSession)
      : [];

    const activeSession =
      parsed.activeSession && typeof parsed.activeSession === "object"
        ? normalizeSession(parsed.activeSession as Partial<GymSession>)
        : null;

    const xpByDate: Record<string, number> = {};
    if (parsed.xpByDate && typeof parsed.xpByDate === "object") {
      for (const [date, xp] of Object.entries(parsed.xpByDate)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          xpByDate[date] = Math.max(0, toNumber(xp));
        }
      }
    }

    return { activeSession, sessions, xpByDate };
  } catch {
    return emptyGym();
  }
}

export function saveGym(state: GymState): void {
  try {
    window.localStorage.setItem(GYM_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage penuh / tidak tersedia — abaikan.
  }
}

function updateActive(
  state: GymState,
  updater: (session: GymSession) => GymSession,
): GymState {
  if (!state.activeSession) return state;
  return { ...state, activeSession: updater(state.activeSession) };
}

function updateExercise(
  state: GymState,
  exerciseId: string,
  updater: (exercise: GymExerciseLog) => GymExerciseLog,
): GymState {
  return updateActive(state, (session) => ({
    ...session,
    exercises: session.exercises.map((ex) =>
      ex.id === exerciseId ? updater(ex) : ex,
    ),
  }));
}

// Bangun draf sesi dari template. `nameOf` menerjemahkan kunci i18n latihan.
export function templateSessionDraft(
  templateId: string | undefined,
  nameOf: (key: string) => string,
): SessionDraft {
  const template = ROUTINE_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return { title: "", exercises: [] };
  return {
    templateId: template.id,
    title: nameOf(template.nameKey),
    exercises: template.exercises.map((ex) => ({
      id: makeId(),
      name: nameOf(ex.exerciseKey),
      muscles: [...ex.muscles],
      sets: Array.from({ length: ex.defaultSets }, emptySet),
      notes: "",
      exerciseId: ex.exerciseId,
      restSeconds: defaultRestSeconds(getExerciseDef(ex.exerciseId)),
    })),
  };
}

export function startSession(state: GymState, draft: SessionDraft): GymState {
  return {
    ...state,
    activeSession: {
      id: makeId(),
      templateId: draft.templateId,
      title: draft.title,
      date: todayKey(),
      startedAt: Date.now(),
      completedAt: null,
      exercises: draft.exercises,
    },
  };
}

export function setActiveSessionTitle(
  state: GymState,
  title: string,
): GymState {
  return updateActive(state, (session) => ({ ...session, title }));
}

export function addExercise(state: GymState): GymState {
  return updateActive(state, (session) => ({
    ...session,
    exercises: [...session.exercises, emptyExercise()],
  }));
}

export function addExerciseFromDb(
  state: GymState,
  exerciseId: string,
  name: string,
  muscles: MuscleGroup[],
  restSeconds: number,
): GymState {
  return updateActive(state, (session) => ({
    ...session,
    exercises: [
      ...session.exercises,
      {
        id: makeId(),
        name,
        muscles: Array.from(new Set(muscles)),
        sets: [emptySet()],
        notes: "",
        exerciseId,
        restSeconds: restSeconds > 0 ? restSeconds : undefined,
      },
    ],
  }));
}

export function setExerciseRest(
  state: GymState,
  exerciseId: string,
  restSeconds: number,
): GymState {
  return updateExercise(state, exerciseId, (ex) => ({
    ...ex,
    restSeconds: restSeconds > 0 ? restSeconds : undefined,
  }));
}

export function removeExercise(
  state: GymState,
  exerciseId: string,
): GymState {
  return updateActive(state, (session) => ({
    ...session,
    exercises: session.exercises.filter((ex) => ex.id !== exerciseId),
  }));
}

export function setExerciseName(
  state: GymState,
  exerciseId: string,
  name: string,
): GymState {
  return updateExercise(state, exerciseId, (ex) => ({ ...ex, name }));
}

export function setExerciseMuscles(
  state: GymState,
  exerciseId: string,
  muscles: MuscleGroup[],
): GymState {
  const unique = Array.from(new Set(muscles));
  return updateExercise(state, exerciseId, (ex) => ({ ...ex, muscles: unique }));
}

export function toggleMuscle(
  state: GymState,
  exerciseId: string,
  muscle: MuscleGroup,
): GymState {
  return updateExercise(state, exerciseId, (ex) => ({
    ...ex,
    muscles: ex.muscles.includes(muscle)
      ? ex.muscles.filter((m) => m !== muscle)
      : [...ex.muscles, muscle],
  }));
}

export function addSet(state: GymState, exerciseId: string): GymState {
  return updateExercise(state, exerciseId, (ex) => ({
    ...ex,
    sets: [...ex.sets, emptySet()],
  }));
}

export function updateSet(
  state: GymState,
  exerciseId: string,
  setIndex: number,
  patch: Partial<GymSet>,
): GymState {
  return updateExercise(state, exerciseId, (ex) => ({
    ...ex,
    sets: ex.sets.map((set, index) =>
      index === setIndex ? normalizeSet({ ...set, ...patch }) : set,
    ),
  }));
}

export function removeSet(
  state: GymState,
  exerciseId: string,
  setIndex: number,
): GymState {
  return updateExercise(state, exerciseId, (ex) => ({
    ...ex,
    sets: ex.sets.filter((_, index) => index !== setIndex),
  }));
}

export function cancelSession(state: GymState): GymState {
  return { ...state, activeSession: null };
}

// Akhiri sesi aktif: pindah ke riwayat, set tanggal & completedAt, lalu beri
// XP (dibatasi per hari). Sesi tanpa latihan bernama dianggap batal.
export function completeSession(
  state: GymState,
): { state: GymState; awarded: number } {
  const active = state.activeSession;
  if (!active) return { state, awarded: 0 };

  const kept = active.exercises.filter((ex) => ex.name.trim() !== "");
  if (kept.length === 0) {
    return { state: { ...state, activeSession: null }, awarded: 0 };
  }

  const today = todayKey();
  const spent = state.xpByDate[today] ?? 0;
  const awarded = Math.max(
    0,
    Math.min(GYM_XP_PER_SESSION, MAX_GYM_XP_PER_DAY - spent),
  );

  const completed: GymSession = {
    ...active,
    exercises: kept,
    date: today,
    completedAt: Date.now(),
  };

  return {
    state: {
      ...state,
      activeSession: null,
      sessions: [completed, ...state.sessions],
      xpByDate:
        awarded > 0
          ? { ...state.xpByDate, [today]: spent + awarded }
          : state.xpByDate,
    },
    awarded,
  };
}

export function deleteSession(state: GymState, sessionId: string): GymState {
  return {
    ...state,
    sessions: state.sessions.filter((s) => s.id !== sessionId),
  };
}

export function exerciseVolume(exercise: GymExerciseLog): number {
  return exercise.sets.reduce(
    (sum, set) => sum + set.weightKg * set.reps,
    0,
  );
}

// Estimasi 1RM (Epley: beban × (1 + reps/30)). Reps dibatasi agar stabil di
// rentang repetisi tinggi. Kembali 0 bila set tidak valid/berat nol.
export function estOneRepMax(set: GymSet): number {
  const reps = Math.min(Math.max(0, set.reps), 30);
  if (reps <= 0 || set.weightKg <= 0) return 0;
  return set.weightKg * (1 + reps / 30);
}

export interface ExerciseProgressPoint {
  date: string;
  topWeight: number;
  est1RM: number;
  volume: number;
  sets: number;
}

function matchesExercise(exercise: GymExerciseLog, key: string): boolean {
  if (exercise.exerciseId) return exercise.exerciseId === key;
  return exercise.name.trim().toLowerCase() === key.trim().toLowerCase();
}

// Poin progress per tanggal sesi untuk satu latihan. `key` = exerciseId atau
// nama bebas-text (case-insensitive). Set kosong diabaikan.
export function exerciseProgressPoints(
  state: GymState,
  key: string,
): ExerciseProgressPoint[] {
  const trimmed = key.trim();
  if (!trimmed) return [];

  const byDate = new Map<string, ExerciseProgressPoint>();
  for (const session of state.sessions) {
    const matched = session.exercises.filter((ex) => matchesExercise(ex, trimmed));
    if (matched.length === 0) continue;

    let topWeight = 0;
    let best1RM = 0;
    let volume = 0;
    let sets = 0;

    for (const exercise of matched) {
      for (const set of exercise.sets) {
        if (set.weightKg > 0 || set.reps > 0 || set.done) {
          volume += set.weightKg * set.reps;
          sets += 1;
        }
        const oneRM = estOneRepMax(set);
        if (oneRM > best1RM) best1RM = oneRM;
        if (set.reps > 0 && set.weightKg > topWeight) topWeight = set.weightKg;
      }
    }

    const previous = byDate.get(session.date);
    if (previous) {
      topWeight = Math.max(previous.topWeight, topWeight);
      best1RM = Math.max(previous.est1RM, best1RM);
      volume += previous.volume;
      sets += previous.sets;
    }
    byDate.set(session.date, { date: session.date, topWeight, est1RM: best1RM, volume, sets });
  }

  return Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function sessionVolume(session: GymSession): number {
  return session.exercises.reduce(
    (sum, ex) => sum + exerciseVolume(ex),
    0,
  );
}

export function sessionSetCount(session: GymSession): number {
  return session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

export interface SessionGroup {
  date: string;
  sessions: GymSession[];
}

export function groupSessionsByDate(state: GymState): SessionGroup[] {
  const byDate = new Map<string, GymSession[]>();
  for (const session of state.sessions) {
    const list = byDate.get(session.date) ?? [];
    list.push(session);
    byDate.set(session.date, list);
  }
  return Array.from(byDate.entries())
    .map(([date, sessions]) => ({ date, sessions }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function gymStreak(state: GymState): number {
  const active = new Set(state.sessions.map((s) => s.date));
  const today = todayKey();
  const parts = today.split("-");
  const cursor = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (!active.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (true) {
    const key = dateKeyOf(cursor);
    if (!active.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function weeklyVolume(state: GymState): MuscleVolume[] {
  const startKey = dateKeyOf(mondayOf(new Date()));
  const totals = new Map<MuscleGroup, number>();
  for (const session of state.sessions) {
    if (session.date < startKey) continue;
    for (const exercise of session.exercises) {
      const volume = exerciseVolume(exercise);
      if (volume <= 0) continue;
      for (const muscle of exercise.muscles) {
        totals.set(muscle, (totals.get(muscle) ?? 0) + volume);
      }
    }
  }
  return MUSCLE_GROUPS.filter((g) => (totals.get(g) ?? 0) > 0).map((g) => ({
    muscleGroup: g,
    volume: totals.get(g) ?? 0,
  }));
}

export function sessionsThisWeek(state: GymState): number {
  const startKey = dateKeyOf(mondayOf(new Date()));
  return state.sessions.filter((s) => s.date >= startKey).length;
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: "push",
    nameKey: "gym.template.push",
    exercises: [
      { exerciseKey: "gym.exercise.benchPress", exerciseId: "bench-press", muscles: ["chest"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.shoulderPress", exerciseId: "shoulder-press", muscles: ["shoulders"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.inclinePress", exerciseId: "incline-press", muscles: ["chest"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.tricepsExtension", exerciseId: "triceps-extension", muscles: ["arms"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.lateralRaise", exerciseId: "lateral-raise", muscles: ["shoulders"], defaultSets: 3 },
    ],
  },
  {
    id: "pull",
    nameKey: "gym.template.pull",
    exercises: [
      { exerciseKey: "gym.exercise.deadlift", exerciseId: "deadlift", muscles: ["back"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.latPulldown", exerciseId: "lat-pulldown", muscles: ["back"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.rows", exerciseId: "barbell-rows", muscles: ["back"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.bicepsCurl", exerciseId: "biceps-curl", muscles: ["arms"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.facePull", exerciseId: "face-pull", muscles: ["shoulders"], defaultSets: 3 },
    ],
  },
  {
    id: "legs",
    nameKey: "gym.template.legs",
    exercises: [
      { exerciseKey: "gym.exercise.squat", exerciseId: "squat", muscles: ["legs"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.legPress", exerciseId: "leg-press", muscles: ["legs"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.romanianDeadlift", exerciseId: "romanian-deadlift", muscles: ["legs"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.lunges", exerciseId: "lunges", muscles: ["legs"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.calfRaise", exerciseId: "calf-raise", muscles: ["legs"], defaultSets: 3 },
    ],
  },
  {
    id: "upper",
    nameKey: "gym.template.upper",
    exercises: [
      { exerciseKey: "gym.exercise.benchPress", exerciseId: "bench-press", muscles: ["chest"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.latPulldown", exerciseId: "lat-pulldown", muscles: ["back"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.shoulderPress", exerciseId: "shoulder-press", muscles: ["shoulders"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.bicepsCurl", exerciseId: "biceps-curl", muscles: ["arms"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.tricepsExtension", exerciseId: "triceps-extension", muscles: ["arms"], defaultSets: 3 },
    ],
  },
  {
    id: "lower",
    nameKey: "gym.template.lower",
    exercises: [
      { exerciseKey: "gym.exercise.squat", exerciseId: "squat", muscles: ["legs"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.romanianDeadlift", exerciseId: "romanian-deadlift", muscles: ["legs"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.lunges", exerciseId: "lunges", muscles: ["legs"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.calfRaise", exerciseId: "calf-raise", muscles: ["legs"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.plank", exerciseId: "plank", muscles: ["core"], defaultSets: 3 },
    ],
  },
  {
    id: "full",
    nameKey: "gym.template.full",
    exercises: [
      { exerciseKey: "gym.exercise.squat", exerciseId: "squat", muscles: ["legs"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.benchPress", exerciseId: "bench-press", muscles: ["chest"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.rows", exerciseId: "barbell-rows", muscles: ["back"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.shoulderPress", exerciseId: "shoulder-press", muscles: ["shoulders"], defaultSets: 3 },
      { exerciseKey: "gym.exercise.plank", exerciseId: "plank", muscles: ["core"], defaultSets: 3 },
    ],
  },
];
