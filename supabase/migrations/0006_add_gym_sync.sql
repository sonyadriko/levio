-- ==================== 0006_add_gym_sync.sql ====================
-- Levio: sync modul gym ke cloud.
-- Satu baris per sesi gym selesai (exercises & sets disimpan sebagai JSONB
-- karena struktur ber-nesting; konsumsi hanya dari sisi klien).

create table if not exists public.gym_sessions (
  user_id      uuid not null references auth.users (id) on delete cascade,
  session_id   text not null,
  title        text not null default '',
  template_id  text,
  date         text not null, -- "YYYY-MM-DD"
  started_at   bigint not null default 0,
  completed_at bigint,
  exercises    jsonb not null default '[]',
  updated_at   timestamptz not null default now(),
  primary key (user_id, session_id)
);

-- XP gym per tanggal (anti-farming; cap 30/hari). Perlu disinkronkan agar
-- perangkat kedua tidak bisa "mengisi ulang" cap harian.
create table if not exists public.gym_xp_by_date (
  user_id uuid not null references auth.users (id) on delete cascade,
  date    text not null, -- "YYYY-MM-DD"
  xp      integer not null default 0,
  primary key (user_id, date)
);

alter table public.gym_sessions    enable row level security;
alter table public.gym_xp_by_date  enable row level security;

create policy "gym_sessions_own" on public.gym_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "gym_xp_by_date_own" on public.gym_xp_by_date
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists gym_sessions_set_updated_at on public.gym_sessions;
create trigger gym_sessions_set_updated_at
  before update on public.gym_sessions
  for each row execute function public.set_updated_at();
