-- Levio: tambah field SRS (SM-2) ke word_progress.
-- Jalankan di Supabase Dashboard → SQL Editor setelah 0001_init.sql.

alter table public.word_progress
  add column if not exists ease real not null default 2.5,
  add column if not exists repetitions integer not null default 0;
