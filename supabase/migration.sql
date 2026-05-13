-- ============================================================
-- The PlayGround — Full Database Migration
-- Paste this entire file into Supabase SQL Editor and run it.
-- ============================================================

-- ── 1. EVENTS ──────────────────────────────────────────────
create table if not exists events (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  starts_at               timestamptz,
  ends_at                 timestamptz,
  status                  text not null default 'draft' check (status in ('draft','live','finished')),
  timer_duration_seconds  int not null default 14400,
  created_at              timestamptz not null default now()
);

-- ── 2. TEAMS ───────────────────────────────────────────────
create table if not exists teams (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references events(id) on delete cascade,
  name             text not null,
  team_number      int not null,
  login_code       char(6) not null,
  score            int not null default 0,
  budget_remaining int not null default 100,
  photo_count      int not null default 0,
  war_cry          text,
  created_at       timestamptz not null default now(),
  unique (event_id, login_code),
  unique (event_id, team_number)
);

-- ── 3. TEAM_ZONES ──────────────────────────────────────────
create table if not exists team_zones (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references teams(id) on delete cascade,
  zone_id     text not null,
  unlocked_at timestamptz not null default now(),
  unique (team_id, zone_id)
);

-- ── 4. COMPLETIONS ─────────────────────────────────────────
create table if not exists completions (
  id             uuid primary key default gen_random_uuid(),
  team_id        uuid not null references teams(id) on delete cascade,
  game_id        int not null,
  submitted_at   timestamptz not null default now(),
  photo_url      text,
  points_awarded int not null default 0,
  status         text not null default 'pending' check (status in ('pending','approved','rejected')),
  unique (team_id, game_id)
);

-- ── 5. BROADCASTS ──────────────────────────────────────────
create table if not exists broadcasts (
  id        uuid primary key default gen_random_uuid(),
  event_id  uuid not null references events(id) on delete cascade,
  message   text not null,
  sent_by   text not null default 'GM',
  sent_at   timestamptz not null default now()
);

-- ── 6. ROW-LEVEL SECURITY ──────────────────────────────────
alter table events      enable row level security;
alter table teams       enable row level security;
alter table team_zones  enable row level security;
alter table completions enable row level security;
alter table broadcasts  enable row level security;

-- Public read on live events
create policy "public read live events"
  on events for select using (status = 'live');

-- Teams: anyone can read (leaderboard), team can update own row by login_code
create policy "public read teams"
  on teams for select using (true);

create policy "team update own row"
  on teams for update
  using (login_code = current_setting('app.team_login_code', true));

-- Team zones: read all, insert own
create policy "public read team_zones"
  on team_zones for select using (true);

create policy "team insert own zones"
  on team_zones for insert
  with check (
    team_id in (
      select id from teams
      where login_code = current_setting('app.team_login_code', true)
    )
  );

-- Completions: read all, insert own
create policy "public read completions"
  on completions for select using (true);

create policy "team insert own completions"
  on completions for insert
  with check (
    team_id in (
      select id from teams
      where login_code = current_setting('app.team_login_code', true)
    )
  );

-- Broadcasts: anyone can read
create policy "public read broadcasts"
  on broadcasts for select using (true);

-- ── 7. LIVE LEADERBOARD VIEW ───────────────────────────────
create or replace view live_leaderboard as
select
  t.id,
  t.event_id,
  t.name,
  t.team_number,
  t.score,
  t.budget_remaining,
  t.photo_count,
  count(c.id) filter (where c.status = 'approved') as approved_count,
  count(c.id) filter (where c.status = 'pending')  as pending_count,
  rank() over (partition by t.event_id order by t.score desc) as rank
from teams t
left join completions c on c.team_id = t.id
group by t.id
order by t.score desc;

-- ── 8. REALTIME ────────────────────────────────────────────
-- Run in Supabase Dashboard → Database → Replication, or:
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table completions;
alter publication supabase_realtime add table broadcasts;

-- ── 9. STORAGE BUCKET ──────────────────────────────────────
-- Run via Supabase Dashboard → Storage → New bucket
-- Name: submissions, Public: true, Max file size: 50MB, Allowed MIME: image/*
-- Or via SQL (requires pg_storage extension):
-- insert into storage.buckets (id, name, public) values ('submissions', 'submissions', true);

-- ── 10. INDEXES ────────────────────────────────────────────
create index if not exists idx_teams_event_id       on teams(event_id);
create index if not exists idx_teams_login_code     on teams(login_code);
create index if not exists idx_completions_team_id  on completions(team_id);
create index if not exists idx_completions_status   on completions(status);
create index if not exists idx_team_zones_team_id   on team_zones(team_id);
create index if not exists idx_broadcasts_event_id  on broadcasts(event_id);
