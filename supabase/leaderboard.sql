-- AI Spring Training: shared leaderboard.
--
-- One table, reached only through three functions. Row level security is on
-- with no policies, so the browser's public key cannot read or write the
-- table directly; in particular it can never list player ids, which are the
-- only thing that says a row is yours.
--
-- There is no login. A player id is a random UUID made in each person's
-- browser, and scores are whatever that browser reports, so this is an
-- honour-system board: fine for a team, not for prizes.

create table public.training_leaderboard (
  player_id  uuid primary key,
  name       text not null check (char_length(name) between 1 and 24),
  xp         integer not null default 0 check (xp between 0 and 1000000),
  modules    smallint not null default 0 check (modules between 0 and 10),
  badges     smallint not null default 0 check (badges between 0 and 13),
  tryout     smallint check (tryout between 0 and 20),
  streak     integer not null default 0 check (streak >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.training_leaderboard enable row level security;
revoke all on public.training_leaderboard from anon, authenticated;

-- Create or update the caller's own row.
create function public.training_submit(
  p_id uuid, p_name text, p_xp integer, p_modules integer, p_badges integer,
  p_tryout integer default null, p_streak integer default 0
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  -- A ceiling on new rows, so a script cannot fill the database.
  if not exists (select 1 from public.training_leaderboard where player_id = p_id)
     and (select count(*) from public.training_leaderboard) >= 5000 then
    raise exception 'leaderboard is full';
  end if;

  insert into public.training_leaderboard (player_id, name, xp, modules, badges, tryout, streak)
  values (
    p_id,
    left(btrim(p_name), 24),
    least(greatest(coalesce(p_xp, 0), 0), 1000000),
    least(greatest(coalesce(p_modules, 0), 0), 10),
    least(greatest(coalesce(p_badges, 0), 0), 13),
    least(greatest(p_tryout, 0), 20),
    greatest(coalesce(p_streak, 0), 0)
  )
  on conflict (player_id) do update set
    name = excluded.name, xp = excluded.xp, modules = excluded.modules,
    badges = excluded.badges, tryout = excluded.tryout, streak = excluded.streak,
    updated_at = now();
end;
$$;

-- The standings: the top 100 by XP, plus the caller's own row wherever it
-- ranks. Player ids never leave the database; `me` marks the caller's row.
create function public.training_board(p_id uuid default null)
returns table (rank bigint, name text, xp integer, modules smallint, badges smallint,
               tryout smallint, me boolean, total bigint)
language sql stable security definer set search_path = ''
as $$
  with ranked as (
    select t.*, rank() over (order by t.xp desc) as rnk, count(*) over () as total
    from public.training_leaderboard t
  )
  select r.rnk, r.name, r.xp, r.modules, r.badges, r.tryout,
         coalesce(r.player_id = p_id, false), r.total
  from ranked r
  where r.rnk <= 100 or r.player_id = p_id
  order by r.rnk, r.updated_at;
$$;

-- Take the caller off the board (name cleared, or progress reset).
create function public.training_remove(p_id uuid) returns void
language sql security definer set search_path = ''
as $$
  delete from public.training_leaderboard where player_id = p_id;
$$;

revoke execute on function public.training_submit(uuid, text, integer, integer, integer, integer, integer) from public;
revoke execute on function public.training_board(uuid) from public;
revoke execute on function public.training_remove(uuid) from public;
grant execute on function public.training_submit(uuid, text, integer, integer, integer, integer, integer) to anon, authenticated;
grant execute on function public.training_board(uuid) to anon, authenticated;
grant execute on function public.training_remove(uuid) to anon, authenticated;
