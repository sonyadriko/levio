import type { MuscleGroup } from "./gym";

export interface ExerciseDef {
  id: string;
  nameKey: string;
  muscles: MuscleGroup[];
  restSeconds: number;
}

export const DEFAULT_REST_SECONDS = 90;

export const EXERCISE_DB: ExerciseDef[] = [
  // Dada
  { id: "bench-press", nameKey: "gym.exercise.benchPress", muscles: ["chest"], restSeconds: 150 },
  { id: "incline-press", nameKey: "gym.exercise.inclinePress", muscles: ["chest"], restSeconds: 120 },
  { id: "decline-press", nameKey: "gym.exercise.declinePress", muscles: ["chest"], restSeconds: 120 },
  { id: "dumbbell-press", nameKey: "gym.exercise.dumbbellPress", muscles: ["chest"], restSeconds: 120 },
  { id: "dumbbell-fly", nameKey: "gym.exercise.dumbbellFly", muscles: ["chest"], restSeconds: 90 },
  { id: "cable-fly", nameKey: "gym.exercise.cableFly", muscles: ["chest"], restSeconds: 90 },
  { id: "push-up", nameKey: "gym.exercise.pushUp", muscles: ["chest"], restSeconds: 60 },
  { id: "chest-dip", nameKey: "gym.exercise.chestDip", muscles: ["chest"], restSeconds: 90 },
  { id: "pec-deck", nameKey: "gym.exercise.pecDeck", muscles: ["chest"], restSeconds: 90 },

  // Punggung
  { id: "deadlift", nameKey: "gym.exercise.deadlift", muscles: ["back"], restSeconds: 180 },
  { id: "lat-pulldown", nameKey: "gym.exercise.latPulldown", muscles: ["back"], restSeconds: 120 },
  { id: "barbell-rows", nameKey: "gym.exercise.rows", muscles: ["back"], restSeconds: 150 },
  { id: "pull-up", nameKey: "gym.exercise.pullUp", muscles: ["back"], restSeconds: 120 },
  { id: "seated-row", nameKey: "gym.exercise.seatedRow", muscles: ["back"], restSeconds: 90 },
  { id: "one-arm-row", nameKey: "gym.exercise.oneArmRow", muscles: ["back"], restSeconds: 90 },
  { id: "chest-supported-row", nameKey: "gym.exercise.chestSupportedRow", muscles: ["back"], restSeconds: 90 },
  { id: "straight-arm-pulldown", nameKey: "gym.exercise.straightArmPulldown", muscles: ["back"], restSeconds: 60 },
  { id: "back-extension", nameKey: "gym.exercise.backExtension", muscles: ["back"], restSeconds: 60 },

  // Bahu
  { id: "shoulder-press", nameKey: "gym.exercise.shoulderPress", muscles: ["shoulders"], restSeconds: 150 },
  { id: "arnold-press", nameKey: "gym.exercise.arnoldPress", muscles: ["shoulders"], restSeconds: 120 },
  { id: "lateral-raise", nameKey: "gym.exercise.lateralRaise", muscles: ["shoulders"], restSeconds: 60 },
  { id: "front-raise", nameKey: "gym.exercise.frontRaise", muscles: ["shoulders"], restSeconds: 60 },
  { id: "rear-delt-fly", nameKey: "gym.exercise.rearDeltFly", muscles: ["shoulders"], restSeconds: 60 },
  { id: "upright-row", nameKey: "gym.exercise.uprightRow", muscles: ["shoulders"], restSeconds: 90 },
  { id: "face-pull", nameKey: "gym.exercise.facePull", muscles: ["shoulders"], restSeconds: 60 },
  { id: "cable-lateral-raise", nameKey: "gym.exercise.cableLateralRaise", muscles: ["shoulders"], restSeconds: 60 },

  // Lengan
  { id: "biceps-curl", nameKey: "gym.exercise.bicepsCurl", muscles: ["arms"], restSeconds: 60 },
  { id: "hammer-curl", nameKey: "gym.exercise.hammerCurl", muscles: ["arms"], restSeconds: 60 },
  { id: "preacher-curl", nameKey: "gym.exercise.preacherCurl", muscles: ["arms"], restSeconds: 60 },
  { id: "concentration-curl", nameKey: "gym.exercise.concentrationCurl", muscles: ["arms"], restSeconds: 60 },
  { id: "triceps-extension", nameKey: "gym.exercise.tricepsExtension", muscles: ["arms"], restSeconds: 60 },
  { id: "triceps-pushdown", nameKey: "gym.exercise.tricepsPushdown", muscles: ["arms"], restSeconds: 60 },
  { id: "skull-crusher", nameKey: "gym.exercise.skullCrusher", muscles: ["arms"], restSeconds: 60 },
  { id: "triceps-dip", nameKey: "gym.exercise.tricepsDip", muscles: ["arms"], restSeconds: 90 },
  { id: "wrist-curl", nameKey: "gym.exercise.wristCurl", muscles: ["arms"], restSeconds: 45 },

  // Kaki
  { id: "squat", nameKey: "gym.exercise.squat", muscles: ["legs"], restSeconds: 180 },
  { id: "leg-press", nameKey: "gym.exercise.legPress", muscles: ["legs"], restSeconds: 150 },
  { id: "romanian-deadlift", nameKey: "gym.exercise.romanianDeadlift", muscles: ["legs"], restSeconds: 150 },
  { id: "goblet-squat", nameKey: "gym.exercise.gobletSquat", muscles: ["legs"], restSeconds: 120 },
  { id: "lunges", nameKey: "gym.exercise.lunges", muscles: ["legs"], restSeconds: 120 },
  { id: "bulgarian-split-squat", nameKey: "gym.exercise.bulgarianSplitSquat", muscles: ["legs"], restSeconds: 120 },
  { id: "hip-thrust", nameKey: "gym.exercise.hipThrust", muscles: ["legs"], restSeconds: 150 },
  { id: "leg-extension", nameKey: "gym.exercise.legExtension", muscles: ["legs"], restSeconds: 60 },
  { id: "leg-curl", nameKey: "gym.exercise.legCurl", muscles: ["legs"], restSeconds: 60 },
  { id: "calf-raise", nameKey: "gym.exercise.calfRaise", muscles: ["legs"], restSeconds: 60 },
  { id: "step-up", nameKey: "gym.exercise.stepUp", muscles: ["legs"], restSeconds: 90 },
  { id: "glute-kickback", nameKey: "gym.exercise.gluteKickback", muscles: ["legs"], restSeconds: 60 },

  // Perut
  { id: "plank", nameKey: "gym.exercise.plank", muscles: ["core"], restSeconds: 45 },
  { id: "crunch", nameKey: "gym.exercise.crunch", muscles: ["core"], restSeconds: 45 },
  { id: "leg-raise", nameKey: "gym.exercise.legRaise", muscles: ["core"], restSeconds: 45 },
  { id: "russian-twist", nameKey: "gym.exercise.russianTwist", muscles: ["core"], restSeconds: 45 },
  { id: "mountain-climber", nameKey: "gym.exercise.mountainClimber", muscles: ["core"], restSeconds: 45 },
  { id: "side-plank", nameKey: "gym.exercise.sidePlank", muscles: ["core"], restSeconds: 45 },
  { id: "hanging-leg-raise", nameKey: "gym.exercise.hangingLegRaise", muscles: ["core"], restSeconds: 60 },
  { id: "ab-wheel", nameKey: "gym.exercise.abWheel", muscles: ["core"], restSeconds: 60 },
  { id: "bicycle-crunch", nameKey: "gym.exercise.bicycleCrunch", muscles: ["core"], restSeconds: 45 },
];

const BY_ID = new Map(EXERCISE_DB.map((def) => [def.id, def]));

export function getExerciseDef(id: string | undefined): ExerciseDef | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function defaultRestSeconds(def?: ExerciseDef | null): number {
  return def?.restSeconds ?? DEFAULT_REST_SECONDS;
}
