-- ═══════════════════════════════════════════════════
-- Museum of Abandoned Selves — Supabase Schema
-- Run this entire file in: Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════

-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific fields
create table if not exists profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  email        text,
  is_paid      boolean default false,
  museum_count integer default 0,
  stripe_customer_id text,
  email_reminders boolean default false,   -- opted in to annual reminder emails
  created_at   timestamp with time zone default now()
);

-- Auto-create a profile when a user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- MUSEUMS TABLE
create table if not exists museums (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  slug       text unique not null,           -- used for share URL: /m/[slug]
  selves     text[] not null,                -- user's input (abandoned selves)
  exhibits   jsonb not null,                 -- AI-generated exhibit data
  is_public  boolean default true,           -- whether share link works
  created_at timestamp with time zone default now()
);

-- Row Level Security — users can only see their own museums
alter table profiles enable row level security;
alter table museums  enable row level security;

-- Profiles: users can read/update only their own
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Museums: users can CRUD their own
create policy "Users can view own museums"
  on museums for select using (auth.uid() = user_id);

create policy "Users can insert own museums"
  on museums for insert with check (auth.uid() = user_id);

create policy "Users can delete own museums"
  on museums for delete using (auth.uid() = user_id);

-- Public museums: anyone can view if is_public = true
create policy "Anyone can view public museums"
  on museums for select using (is_public = true);

-- FEEDBACK TABLE
-- Stores raw emotional responses — your most valuable Stage 1 data
create table if not exists feedback (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete set null,
  museum_id       uuid references museums(id) on delete set null,
  feeling         text not null,
  is_public_visitor boolean default false,  -- true if submitted from share page
  created_at      timestamp with time zone default now()
);

alter table feedback enable row level security;

-- Anyone can insert feedback (including public visitors)
create policy "Anyone can submit feedback"
  on feedback for insert with check (true);

-- Only the owner can read their own feedback
create policy "Users can view own feedback"
  on feedback for select using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists museums_user_id_idx on museums(user_id);
create index if not exists museums_slug_idx on museums(slug);
create index if not exists feedback_museum_id_idx on feedback(museum_id);
