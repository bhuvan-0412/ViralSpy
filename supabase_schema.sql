-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create TRENDS Table
create table public.trends (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    niche text not null,
    platform text not null, -- 'tiktok', 'youtube', 'instagram'
    post_count integer not null,
    velocity_score numeric not null,
    momentum_status text not null check (momentum_status in ('EXPLODING', 'RISING', 'PEAKED')),
    detected_at timestamp with time zone default timezone('utc'::text, now()) not null,
    raw_data jsonb -- e.g., { "sparkline": [12, 15, 18, 30, 45, 60, 85, 125] }
);

create index trends_niche_idx on public.trends(niche);
create index trends_platform_idx on public.trends(platform);

-- Enable RLS on trends
alter table public.trends enable row level security;

-- Policy: Allow read access to anyone (public)
create policy "Allow public read access to trends" on public.trends
    for select using (true);


-- 2. Create BRIEFS Table
create table public.briefs (
    id uuid default gen_random_uuid() primary key,
    trend_id uuid references public.trends(id) on delete cascade not null,
    hook text not null,
    angles jsonb not null, -- Array of strings/objects representing the 3 video angle options
    format text not null, -- 'talking head', 'POV', 'duet', etc.
    hashtags jsonb not null, -- Array of strings
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index briefs_trend_id_idx on public.briefs(trend_id);

-- Enable RLS on briefs
alter table public.briefs enable row level security;

-- Policies for briefs
create policy "Allow public read access to briefs" on public.briefs
    for select using (true);

create policy "Allow public insert access to briefs" on public.briefs
    for insert with check (true);


-- 3. Create USER_NICHES Table
create table public.user_niches (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null, -- Maps to auth.users.id
    niche text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, niche)
);

create index user_niches_user_id_idx on public.user_niches(user_id);

-- Enable RLS on user_niches
alter table public.user_niches enable row level security;

-- Policies for user_niches
create policy "Users can select their own niches" on public.user_niches
    for select using (auth.uid() = user_id);

create policy "Users can insert their own niches" on public.user_niches
    for insert with check (auth.uid() = user_id);

create policy "Users can delete their own niches" on public.user_niches
    for delete using (auth.uid() = user_id);
