-- Levio: tambah kolom unlocked_up_to di profiles.
-- Level HSK tertinggi yang terbuka (1..6, default 1); dinaikkan saat lulus
-- tes kelulusan. Jalankan di Supabase Dashboard → SQL Editor setelah 0003.

alter table public.profiles
  add column if not exists unlocked_up_to integer not null default 1;
