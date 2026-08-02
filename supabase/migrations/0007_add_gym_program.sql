-- ==================== 0007_add_gym_program.sql ====================
-- Levio: penanda program multi-minggu pada sesi gym.
-- Kolom baru opsional; sesi lama yang tanpa program tidak terpengaruh.

alter table public.gym_sessions
  add column if not exists program_id   text,
  add column if not exists program_week integer,
  add column if not exists program_day  integer;

create index if not exists gym_sessions_program_idx
  on public.gym_sessions (user_id, program_id);
