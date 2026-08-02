-- Levio: tandai akun yang pernah melakukan import data.
-- Kolom imported_at diisi saat user mengimpor file progress (untuk integritas
-- gamifikasi bila nanti ada leaderboard/peringkat). Jalankan setelah 0004.

alter table public.profiles
  add column if not exists imported_at timestamptz;
