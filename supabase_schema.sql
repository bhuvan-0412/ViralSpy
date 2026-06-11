-- ============================================================
-- ViralSpy — Complete Supabase Schema (Run this in SQL Editor)
-- Drop existing tables first if re-running from scratch:
-- DROP TABLE IF EXISTS trend_snapshots CASCADE;
-- DROP TABLE IF EXISTS briefs CASCADE;
-- DROP TABLE IF EXISTS user_niches CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TABLE IF EXISTS trends CASCADE;
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. TRENDS TABLE
-- ────────────────────────────────────────────────────────────
create table if not exists public.trends (
    id              uuid default gen_random_uuid() primary key,
    name            text not null,
    niche           text not null,
    platform        text not null,
    post_count      integer not null default 0,
    posts_per_hour  integer not null default 0,
    avg_posts_24h   integer not null default 1,
    velocity_score  numeric not null default 0,
    momentum_status text not null default 'RISING'
        check (momentum_status in ('EXPLODING', 'RISING', 'PEAKED', 'DEAD')),
    confidence_score numeric not null default 0.5,
    peak_velocity   numeric,
    peaked_at       timestamp with time zone,
    expires_at      timestamp with time zone,
    raw_data        jsonb,
    detected_at     timestamp with time zone default timezone('utc', now()) not null,
    updated_at      timestamp with time zone default timezone('utc', now()),
    created_at      timestamp with time zone default timezone('utc', now())
);

-- Unique constraint for upsert (name + platform)
alter table public.trends
    drop constraint if exists trends_name_platform_unique;
alter table public.trends
    add constraint trends_name_platform_unique unique (name, platform);

create index if not exists trends_niche_idx      on public.trends(niche);
create index if not exists trends_platform_idx   on public.trends(platform);
create index if not exists trends_momentum_idx   on public.trends(momentum_status);
create index if not exists trends_velocity_idx   on public.trends(velocity_score desc);

-- RLS
alter table public.trends enable row level security;
drop policy if exists "Allow public read access to trends" on public.trends;
create policy "Allow public read access to trends" on public.trends
    for select using (true);
drop policy if exists "Allow service role insert trends" on public.trends;
create policy "Allow service role insert trends" on public.trends
    for insert with check (true);
drop policy if exists "Allow service role update trends" on public.trends;
create policy "Allow service role update trends" on public.trends
    for update using (true);

-- ────────────────────────────────────────────────────────────
-- 2. TREND_SNAPSHOTS TABLE
-- ────────────────────────────────────────────────────────────
create table if not exists public.trend_snapshots (
    id              uuid default gen_random_uuid() primary key,
    trend_id        uuid references public.trends(id) on delete cascade,
    post_count      integer not null default 0,
    posts_per_hour  integer not null default 0,
    velocity_score  numeric not null default 0,
    snapped_at      timestamp with time zone default timezone('utc', now()) not null
);

create index if not exists snapshots_trend_id_idx on public.trend_snapshots(trend_id);
create index if not exists snapshots_snapped_at_idx on public.trend_snapshots(snapped_at desc);

alter table public.trend_snapshots enable row level security;
drop policy if exists "Allow public read snapshots" on public.trend_snapshots;
create policy "Allow public read snapshots" on public.trend_snapshots
    for select using (true);
drop policy if exists "Allow service role insert snapshots" on public.trend_snapshots;
create policy "Allow service role insert snapshots" on public.trend_snapshots
    for insert with check (true);

-- ────────────────────────────────────────────────────────────
-- 3. BRIEFS TABLE
-- ────────────────────────────────────────────────────────────
create table if not exists public.briefs (
    id                uuid default gen_random_uuid() primary key,
    trend_id          uuid references public.trends(id) on delete cascade not null,
    user_id           uuid,
    hook              text not null,
    angles            jsonb not null default '[]',
    format            text not null default 'TALKING_HEAD',
    hashtags          jsonb not null default '[]',
    best_post_time    text not null default '6–8 PM weekdays',
    estimated_reach   text not null default '50K–200K views',
    script_outline    text not null default '',
    model_used        text,
    prompt_version    integer default 1,
    rating            integer,
    created_at        timestamp with time zone default timezone('utc', now()) not null
);

create index if not exists briefs_trend_id_idx on public.briefs(trend_id);
create index if not exists briefs_user_id_idx  on public.briefs(user_id);

alter table public.briefs enable row level security;
drop policy if exists "Allow public read access to briefs" on public.briefs;
create policy "Allow public read access to briefs" on public.briefs
    for select using (true);
drop policy if exists "Allow public insert access to briefs" on public.briefs;
create policy "Allow public insert access to briefs" on public.briefs
    for insert with check (true);

-- ────────────────────────────────────────────────────────────
-- 4. USER_PROFILES TABLE
-- ────────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
    id                uuid primary key references auth.users(id) on delete cascade,
    display_name      text,
    avatar_url        text,
    niches            text[] default '{}',
    platforms         text[] default '{"YOUTUBE","INSTAGRAM","REDDIT"}',
    subscriber_count  integer default 0,
    onboarded         boolean default false,
    created_at        timestamp with time zone default timezone('utc', now()) not null,
    updated_at        timestamp with time zone default timezone('utc', now()) not null
);

alter table public.user_profiles enable row level security;
drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile" on public.user_profiles
    for select using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile" on public.user_profiles
    for insert with check (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile" on public.user_profiles
    for update using (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- 5. USER_NICHES TABLE (legacy, kept for compatibility)
-- ────────────────────────────────────────────────────────────
create table if not exists public.user_niches (
    id          uuid default gen_random_uuid() primary key,
    user_id     uuid not null,
    niche       text not null,
    created_at  timestamp with time zone default timezone('utc', now()) not null,
    unique(user_id, niche)
);

alter table public.user_niches enable row level security;
drop policy if exists "Users can select their own niches" on public.user_niches;
create policy "Users can select their own niches" on public.user_niches
    for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own niches" on public.user_niches;
create policy "Users can insert their own niches" on public.user_niches
    for insert with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own niches" on public.user_niches;
create policy "Users can delete their own niches" on public.user_niches
    for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 6. AUTO-UPDATE updated_at TRIGGER
-- ────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_trends_updated on public.trends;
create trigger on_trends_updated
  before update on public.trends
  for each row execute procedure public.handle_updated_at();

drop trigger if exists on_user_profiles_updated on public.user_profiles;
create trigger on_user_profiles_updated
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

-- ────────────────────────────────────────────────────────────
-- 7. REALTIME PUBLICATION
-- ────────────────────────────────────────────────────────────
drop publication if exists supabase_realtime;
create publication supabase_realtime for table public.trends, public.briefs;
