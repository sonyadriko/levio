import { describe, expect, it } from "vitest";
import {
  addExercise,
  addSet,
  cancelSession,
  completeSession,
  deleteSession,
  emptyGym,
  exerciseVolume,
  gymStreak,
  groupSessionsByDate,
  loadGym,
  makeId,
  removeExercise,
  removeSet,
  ROUTINE_TEMPLATES,
  sessionSetCount,
  sessionVolume,
  sessionsThisWeek,
  setActiveSessionTitle,
  setExerciseMuscles,
  startSession,
  templateSessionDraft,
  toggleMuscle,
  updateSet,
  weeklyVolume,
  type GymExerciseLog,
  type GymSet,
  type GymState,
} from "../lib/gym";
import { GYM_XP_PER_SESSION } from "../lib/gym";

function exercise(name: string, sets: Partial<GymSet>[] = []): GymExerciseLog {
  return {
    id: makeId(),
    name,
    muscles: ["chest"],
    sets: sets.map((s) => ({ weightKg: 0, reps: 0, done: false, ...s })),
    notes: "",
  };
}

function startedSession(
  overrides: Partial<Parameters<typeof startSession>[1]> = {},
): GymState {
  return startSession(emptyGym(), {
    title: "Push Day",
    templateId: "push",
    exercises: [
      exercise("Bench Press", [{ weightKg: 60, reps: 10 }, { weightKg: 60, reps: 8 }]),
      exercise("Shoulder Press"),
    ],
    ...overrides,
  });
}

const d = (offset: number): string => {
  const today = new Date();
  const copy = new Date(today);
  copy.setDate(copy.getDate() + offset);
  return `${copy.getFullYear()}-${String(copy.getMonth() + 1).padStart(2, "0")}-${String(copy.getDate()).padStart(2, "0")}`;
};

describe("startSession", () => {
  it("membuat sesi aktif dari template dengan set ter-prefill", () => {
    const state = startedSession();
    const session = state.activeSession!;
    expect(session.title).toBe("Push Day");
    expect(session.exercises).toHaveLength(2);
    expect(session.exercises[0].name).toBe("Bench Press");
    expect(session.exercises[0].sets).toHaveLength(2);
    expect(session.completedAt).toBeNull();
  });

  it("templateSessionDraft mem-prefill set sesuai defaultSets template", () => {
    const template = ROUTINE_TEMPLATES.find((t) => t.id === "push")!;
    const draft = templateSessionDraft(template.id, (key) => key);
    expect(draft.exercises).toHaveLength(template.exercises.length);
    for (const ex of draft.exercises) {
      expect(ex.sets).toHaveLength(3);
    }
  });

  it("templateSessionDraft tanpa template menghasilkan draf kosong", () => {
    const draft = templateSessionDraft(undefined, (key) => key);
    expect(draft.exercises).toEqual([]);
  });
});

describe("operasi sesi aktif", () => {
  it("mengatur judul sesi", () => {
    const state = setActiveSessionTitle(startedSession(), "Leg Day");
    expect(state.activeSession!.title).toBe("Leg Day");
  });

  it("menambah & menghapus latihan", () => {
    const withExtra = addExercise(startedSession());
    expect(withExtra.activeSession!.exercises).toHaveLength(3);
    const removed = removeExercise(withExtra, withExtra.activeSession!.exercises[2].id);
    expect(removed.activeSession!.exercises).toHaveLength(2);
  });

  it("menambah & memperbarui set per latihan", () => {
    const state = startedSession();
    const exId = state.activeSession!.exercises[1].id;
    const withSet = addSet(state, exId);
    const lastIndex = withSet.activeSession!.exercises[1].sets.length - 1;
    const updated = updateSet(withSet, exId, lastIndex, { weightKg: 100, reps: 5 });
    expect(updated.activeSession!.exercises[1].sets[lastIndex]).toMatchObject({
      weightKg: 100,
      reps: 5,
    });
  });

  it("menghapus set pada index tertentu", () => {
    const state = startedSession();
    const exId = state.activeSession!.exercises[0].id;
    const removed = removeSet(state, exId, 0);
    expect(removed.activeSession!.exercises[0].sets).toHaveLength(1);
  });

  it("meng-toggle muscle group", () => {
    const state = startedSession();
    const exId = state.activeSession!.exercises[0].id;
    const toggled = toggleMuscle(state, exId, "back");
    expect(toggled.activeSession!.exercises[0].muscles).toContain("back");
    const untoggled = toggleMuscle(toggled, exId, "back");
    expect(untoggled.activeSession!.exercises[0].muscles).not.toContain("back");
  });

  it("setExerciseMuscles menetapkan daftar muscle group", () => {
    const state = startedSession();
    const exId = state.activeSession!.exercises[0].id;
    const updated = setExerciseMuscles(state, exId, ["legs", "back"]);
    expect(updated.activeSession!.exercises[0].muscles).toEqual(["legs", "back"]);
  });

  it("cancelSession membuang sesi aktif", () => {
    const state = cancelSession(startedSession());
    expect(state.activeSession).toBeNull();
    expect(state.sessions).toHaveLength(0);
  });
});

describe("completeSession", () => {
  it("memindahkan sesi ke riwayat dengan tanggal & completedAt, lalu member X", () => {
    const state = startedSession();
    const { state: done, awarded } = completeSession(state);
    expect(done.activeSession).toBeNull();
    expect(done.sessions).toHaveLength(1);
    expect(done.sessions[0].completedAt).not.toBeNull();
    expect(done.sessions[0].date).toBe(d(0));
    expect(awarded).toBe(GYM_XP_PER_SESSION);
    expect(done.xpByDate[d(0)]).toBe(GYM_XP_PER_SESSION);
  });

  it("membuang latihan tanpa nama saat sesi diakhiri", () => {
    const state = addExercise(startedSession());
    const { state: done } = completeSession(state);
    expect(done.sessions[0].exercises).toHaveLength(2);
  });

  it("sesi tanpa latihan bernama dianggap batal (tanpa XP, tanpa riwayat)", () => {
    const state = addExercise(emptyGym());
    const { state: done, awarded } = completeSession(state);
    expect(awarded).toBe(0);
    expect(done.activeSession).toBeNull();
    expect(done.sessions).toHaveLength(0);
  });

  it("deleteSession menghapus dari riwayat tapi XP tetap", () => {
    const { state: done } = completeSession(startedSession());
    const removed = deleteSession(done, done.sessions[0].id);
    expect(removed.sessions).toHaveLength(0);
    expect(removed.xpByDate[d(0)]).toBe(GYM_XP_PER_SESSION);
  });

  it("membatasi XP gym per hari (cap 30)", () => {
    let state: GymState = emptyGym();
    for (let i = 0; i < 4; i += 1) {
      const { state: next, awarded } = completeSession(
        startSession(state, {
          title: `Sesi ${i}`,
          exercises: [exercise("Bench Press", [{ weightKg: 60, reps: 10 }])],
        }),
      );
      state = next;
      if (i < 3) {
        expect(awarded).toBe(GYM_XP_PER_SESSION);
      } else {
        expect(awarded).toBe(0);
      }
    }
    expect(state.sessions).toHaveLength(4);
    expect(state.xpByDate[d(0)]).toBe(30);
  });
});

describe("volume", () => {
  it("exerciseVolume menjumlahkan beban × reps per set", () => {
    const ex = exercise("Bench Press", [
      { weightKg: 60, reps: 10 },
      { weightKg: 60, reps: 8 },
    ]);
    expect(exerciseVolume(ex)).toBe(60 * 10 + 60 * 8);
  });

  it("sessionVolume menjumlahkan volume semua latihan", () => {
    const state = startedSession();
    const session = state.activeSession!;
    expect(sessionVolume(session)).toBe(60 * 10 + 60 * 8);
    expect(sessionSetCount(session)).toBe(2);
  });

  it("weeklyVolume menghitung volume per muscle group pada minggu berjalan", () => {
    const base = startedSession();
    const done = completeSession(base).state;
    const volumes = weeklyVolume(done);
    const chest = volumes.find((v) => v.muscleGroup === "chest");
    expect(chest?.volume).toBe(60 * 10 + 60 * 8);
  });
});

describe("gymStreak / sessionsThisWeek / groupSessionsByDate", () => {
  it("gymStreak menghitung hari beruntun dari sesi selesai", () => {
    const state: GymState = {
      activeSession: null,
      xpByDate: {},
      sessions: [d(0), d(-1), d(-2)].map((date) => ({
        id: makeId(),
        title: "A",
        date,
        startedAt: 0,
        completedAt: 0,
        exercises: [exercise("A")],
      })),
    };
    expect(gymStreak(state)).toBe(3);
  });

  it("sessionsThisWeek menghitung sesi pada minggu berjalan", () => {
    const { state: done } = completeSession(startedSession());
    expect(sessionsThisWeek(done)).toBe(1);
  });

  it("groupSessionsByDate mengelompokkan per tanggal, terbaru di depan", () => {
    const state: GymState = {
      activeSession: null,
      xpByDate: {},
      sessions: [
        {
          id: makeId(),
          title: "A",
          date: "2026-08-01",
          startedAt: 0,
          completedAt: 0,
          exercises: [exercise("A")],
        },
        {
          id: makeId(),
          title: "B",
          date: "2026-08-02",
          startedAt: 0,
          completedAt: 0,
          exercises: [exercise("B")],
        },
      ],
    };
    const groups = groupSessionsByDate(state);
    expect(groups[0].date).toBe("2026-08-02");
    expect(groups[0].sessions).toHaveLength(1);
  });
});

describe("loadGym", () => {
  it("mengembalikan kosong bila localStorage kosong", () => {
    expect(loadGym()).toEqual(emptyGym());
  });
});
