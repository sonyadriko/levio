-- ==================== 0009_add_leaderboard.sql ====================
-- Levio: papan peringkat mingguan (XP aplikasi + XP gym).
-- RLS hanya mengizinkan user membaca datanya sendiri, jadi peringkat dihitung
-- lewat fungsi SECURITY DEFINER (dijalankan sebagai pemilik tabel, melewati
-- RLS) yang hanya menampilkan nama + total XP minggu ini — bukan data mentah.

create or replace function public.get_weekly_leaderboard(max_results integer default 50)
returns table (
  rank bigint,
  name text,
  xp integer,
  is_me boolean
)
language sql
security definer
set search_path = public
as $$
  with week as (
    select
      date_trunc('week', current_date)::date as ws,
      (date_trunc('week', current_date)::date + 6) as we
  ),
  weekly as (
    select user_id, sum(xp) as xp
    from (
      select user_id, xp from public.daily_activity
        where date between (select ws::text from week) and (select we::text from week)
      union all
      select user_id, xp from public.gym_xp_by_date
        where date between (select ws::text from week) and (select we::text from week)
    ) all_xp
    group by user_id
    having sum(xp) > 0
  )
  select
    row_number() over (order by weekly.xp desc)::bigint as rank,
    coalesce(p.name, '') as name,
    weekly.xp as xp,
    (weekly.user_id = auth.uid()) as is_me
  from weekly
  left join public.profiles p on p.user_id = weekly.user_id
  order by weekly.xp desc
  limit max_results;
$$;

revoke execute on function public.get_weekly_leaderboard(integer) from public;
grant execute on function public.get_weekly_leaderboard(integer) to anon, authenticated;
