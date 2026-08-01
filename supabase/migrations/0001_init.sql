-- Levio: skema awal Supabase (Auth: email + password via tabel auth.users).
-- Jalankan di Supabase Dashboard → SQL Editor.
--
-- Setelah tabel dibuat, aktifkan Email provider di:
--   Authentication → Sign In / Up → Email.
--   (Opsional) matikan "Confirm email" supaya registrasi langsung aktif.

-- ============================================================
-- PROFILES — agregat progress + preferensi
-- ============================================================
create table if not exists public.profiles (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  name                text not null default '',
  daily_targets       jsonb not null default '{"vocab":10,"reviews":15}',
  xp                  integer not null default 0,
  streak              integer not null default 0,
  last_active_date    text,
  completed_reviews   integer not null default 0,
  completed_tests     integer not null default 0,
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- DAILY_ACTIVITY — satu baris per user per tanggal
-- ============================================================
create table if not exists public.daily_activity (
  user_id uuid not null references auth.users (id) on delete cascade,
  date    text not null, -- "YYYY-MM-DD"
  xp      integer not null default 0,
  reviews integer not null default 0,
  tests   integer not null default 0,
  primary key (user_id, date)
);

-- ============================================================
-- WORD_PROGRESS — status SRS per kata
-- ============================================================
create table if not exists public.word_progress (
  user_id     uuid not null references auth.users (id) on delete cascade,
  word_id     text not null,
  reviews     integer not null default 0,
  correct     integer not null default 0,
  mastered    boolean not null default false,
  next_review text,
  primary key (user_id, word_id)
);

-- ============================================================
-- LAST_TEST — hasil mock test terakhir
-- ============================================================
create table if not exists public.last_test (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  correct    integer not null default 0,
  total      integer not null default 0,
  date       text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — user hanya bisa akses datanya sendiri
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.daily_activity enable row level security;
alter table public.word_progress enable row level security;
alter table public.last_test     enable row level security;

create policy "profiles_own" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "daily_activity_own" on public.daily_activity
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "word_progress_own" on public.word_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "last_test_own" on public.last_test
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Trigger updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists last_test_set_updated_at on public.last_test;
create trigger last_test_set_updated_at
  before update on public.last_test
  for each row execute function public.set_updated_at();
