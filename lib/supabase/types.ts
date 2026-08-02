export interface ProfileRow {
  user_id: string;
  name: string;
  daily_targets: { vocab: number; reviews: number; xp: number };
  xp: number;
  streak: number;
  last_active_date: string | null;
  completed_reviews: number;
  completed_tests: number;
  unlocked_up_to: number;
  imported_at: string | null;
  updated_at: string;
}

export interface ActivityRow {
  user_id: string;
  date: string;
  xp: number;
  reviews: number;
  tests: number;
  new_words: number;
}

export interface WordRow {
  user_id: string;
  word_id: string;
  reviews: number;
  correct: number;
  mastered: boolean;
  next_review: string | null;
  ease: number;
  repetitions: number;
}

export interface LastTestRow {
  user_id: string;
  correct: number;
  total: number;
  date: string | null;
  updated_at: string;
}

export interface GymSessionRow {
  user_id: string;
  session_id: string;
  title: string;
  template_id: string | null;
  program_id: string | null;
  program_week: number | null;
  program_day: number | null;
  date: string;
  started_at: number;
  completed_at: number | null;
  exercises: unknown;
  updated_at: string;
}

export interface GymXpByDateRow {
  user_id: string;
  date: string;
  xp: number;
}
