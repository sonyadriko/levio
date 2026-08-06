export interface ProgramExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
}

export interface ProgramWorkout {
  id: string;
  titleKey: string;
  durationMin: number;
  exercises: ProgramExercise[];
}

export interface GymProgram {
  id: string;
  nameKey: string;
  descriptionKey: string;
  weeks: number;
  workouts: ProgramWorkout[];
}

export const GYM_PROGRAMS: GymProgram[] = [
  {
    id: "ppl-4w",
    nameKey: "gym.program.ppl.name",
    descriptionKey: "gym.program.ppl.desc",
    weeks: 4,
    workouts: [
      {
        id: "push",
        titleKey: "gym.program.ppl.push",
        durationMin: 50,
        exercises: [
          { exerciseId: "bench-press", targetSets: 4, targetReps: 8 },
          { exerciseId: "incline-press", targetSets: 3, targetReps: 10 },
          { exerciseId: "shoulder-press", targetSets: 3, targetReps: 10 },
          { exerciseId: "lateral-raise", targetSets: 3, targetReps: 12 },
          { exerciseId: "triceps-extension", targetSets: 3, targetReps: 12 },
        ],
      },
      {
        id: "pull",
        titleKey: "gym.program.ppl.pull",
        durationMin: 50,
        exercises: [
          { exerciseId: "deadlift", targetSets: 3, targetReps: 5 },
          { exerciseId: "lat-pulldown", targetSets: 4, targetReps: 10 },
          { exerciseId: "barbell-rows", targetSets: 3, targetReps: 10 },
          { exerciseId: "face-pull", targetSets: 3, targetReps: 15 },
          { exerciseId: "biceps-curl", targetSets: 3, targetReps: 12 },
        ],
      },
      {
        id: "legs",
        titleKey: "gym.program.ppl.legs",
        durationMin: 55,
        exercises: [
          { exerciseId: "squat", targetSets: 4, targetReps: 6 },
          { exerciseId: "romanian-deadlift", targetSets: 3, targetReps: 8 },
          { exerciseId: "leg-press", targetSets: 3, targetReps: 10 },
          { exerciseId: "lunges", targetSets: 3, targetReps: 12 },
          { exerciseId: "calf-raise", targetSets: 3, targetReps: 15 },
        ],
      },
    ],
  },
  {
    id: "ul-4w",
    nameKey: "gym.program.ul.name",
    descriptionKey: "gym.program.ul.desc",
    weeks: 4,
    workouts: [
      {
        id: "upper-a",
        titleKey: "gym.program.ul.upperA",
        durationMin: 50,
        exercises: [
          { exerciseId: "bench-press", targetSets: 4, targetReps: 8 },
          { exerciseId: "lat-pulldown", targetSets: 4, targetReps: 10 },
          { exerciseId: "seated-row", targetSets: 3, targetReps: 10 },
          { exerciseId: "arnold-press", targetSets: 3, targetReps: 10 },
          { exerciseId: "biceps-curl", targetSets: 3, targetReps: 12 },
          { exerciseId: "triceps-pushdown", targetSets: 3, targetReps: 12 },
        ],
      },
      {
        id: "lower-a",
        titleKey: "gym.program.ul.lowerA",
        durationMin: 50,
        exercises: [
          { exerciseId: "squat", targetSets: 4, targetReps: 6 },
          { exerciseId: "romanian-deadlift", targetSets: 3, targetReps: 8 },
          { exerciseId: "leg-press", targetSets: 3, targetReps: 10 },
          { exerciseId: "leg-extension", targetSets: 3, targetReps: 12 },
          { exerciseId: "leg-curl", targetSets: 3, targetReps: 12 },
          { exerciseId: "calf-raise", targetSets: 4, targetReps: 15 },
        ],
      },
      {
        id: "upper-b",
        titleKey: "gym.program.ul.upperB",
        durationMin: 45,
        exercises: [
          { exerciseId: "incline-press", targetSets: 4, targetReps: 8 },
          { exerciseId: "one-arm-row", targetSets: 3, targetReps: 12 },
          { exerciseId: "shoulder-press", targetSets: 3, targetReps: 8 },
          { exerciseId: "cable-fly", targetSets: 3, targetReps: 12 },
          { exerciseId: "hammer-curl", targetSets: 3, targetReps: 12 },
          { exerciseId: "skull-crusher", targetSets: 3, targetReps: 12 },
        ],
      },
      {
        id: "lower-b",
        titleKey: "gym.program.ul.lowerB",
        durationMin: 50,
        exercises: [
          { exerciseId: "deadlift", targetSets: 3, targetReps: 5 },
          { exerciseId: "lunges", targetSets: 3, targetReps: 12 },
          { exerciseId: "hip-thrust", targetSets: 3, targetReps: 10 },
          { exerciseId: "leg-curl", targetSets: 3, targetReps: 12 },
          { exerciseId: "calf-raise", targetSets: 4, targetReps: 12 },
          { exerciseId: "side-plank", targetSets: 3, targetReps: 40 },
        ],
      },
    ],
  },
  {
    id: "fb-3d",
    nameKey: "gym.program.fb.name",
    descriptionKey: "gym.program.fb.desc",
    weeks: 4,
    workouts: [
      {
        id: "full-a",
        titleKey: "gym.program.fb.a",
        durationMin: 45,
        exercises: [
          { exerciseId: "squat", targetSets: 3, targetReps: 8 },
          { exerciseId: "bench-press", targetSets: 3, targetReps: 10 },
          { exerciseId: "lat-pulldown", targetSets: 3, targetReps: 10 },
          { exerciseId: "shoulder-press", targetSets: 2, targetReps: 10 },
          { exerciseId: "plank", targetSets: 3, targetReps: 45 },
        ],
      },
      {
        id: "full-b",
        titleKey: "gym.program.fb.b",
        durationMin: 45,
        exercises: [
          { exerciseId: "deadlift", targetSets: 3, targetReps: 5 },
          { exerciseId: "incline-press", targetSets: 3, targetReps: 8 },
          { exerciseId: "seated-row", targetSets: 3, targetReps: 10 },
          { exerciseId: "leg-press", targetSets: 3, targetReps: 10 },
          { exerciseId: "russian-twist", targetSets: 3, targetReps: 20 },
        ],
      },
      {
        id: "full-c",
        titleKey: "gym.program.fb.c",
        durationMin: 45,
        exercises: [
          { exerciseId: "goblet-squat", targetSets: 3, targetReps: 12 },
          { exerciseId: "shoulder-press", targetSets: 3, targetReps: 10 },
          { exerciseId: "one-arm-row", targetSets: 3, targetReps: 12 },
          { exerciseId: "chest-dip", targetSets: 3, targetReps: 10 },
          { exerciseId: "side-plank", targetSets: 3, targetReps: 40 },
        ],
      },
    ],
  },
];

export function getProgram(id: string): GymProgram | undefined {
  return GYM_PROGRAMS.find((program) => program.id === id);
}

export function programTotalWorkouts(program: GymProgram): number {
  return program.weeks * program.workouts.length;
}
