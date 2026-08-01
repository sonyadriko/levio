-- Levio: tambah kolom new_words di daily_activity.
-- Dipakai target harian "kosakata baru/hari" di checklist.
-- Jalankan di Supabase Dashboard → SQL Editor setelah 0001 & 0002.

alter table public.daily_activity
  add column if not exists new_words integer not null default 0;
