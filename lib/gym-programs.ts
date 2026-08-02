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
];

export function getProgram(id: string): GymProgram | undefined {
  return GYM_PROGRAMS.find((program) => program.id === id);
}

export function programTotalWorkouts(program: GymProgram): number {
  return program.weeks * program.workouts.length;
}
