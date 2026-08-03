-- Levio: tambah kolom unlocked_by_module di profiles.
-- Level terbuka per modul bahasa (jsonb, contoh {"hsk":3,"english":2}); hsk
-- tetap sejalan dengan unlocked_up_to (legacy). Kolom nullable agar baris lama
-- yang belum punya nilai tetap kompatibel. Jalankan setelah 0007.

alter table public.profiles
  add column if not exists unlocked_by_module jsonb;
