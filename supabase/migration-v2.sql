-- ═══════════════════════════════════════════════════════
-- Migration: Add feedback table + email_reminders field
-- Run this in Supabase → SQL Editor IF you already ran schema.sql
-- If you haven't run schema.sql yet, skip this — it's already included
-- ═══════════════════════════════════════════════════════

-- Add email_reminders to profiles (safe to run even if column exists)
alter table profiles
  add column if not exists email_reminders boolean default false;

-- Create feedback table
create table if not exists feedback (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users(id) on delete set null,
  museum_id         uuid references museums(id) on delete set null,
  feeling           text not null,
  is_public_visitor boolean default false,
  created_at        timestamp with time zone default now()
);

-- Enable RLS
alter table feedback enable row level security;

-- Anyone can submit feedback (including anonymous public visitors)
create policy "Anyone can submit feedback"
  on feedback for insert with check (true);

-- Users can only read their own feedback
create policy "Users can view own feedback"
  on feedback for select using (auth.uid() = user_id);

-- Index for performance
create index if not exists feedback_museum_id_idx on feedback(museum_id);

-- ── To view all feedback as admin ──────────────────────
-- Run this in SQL Editor anytime to read your users' feelings:
--
-- select f.feeling, f.is_public_visitor, f.created_at,
--        m.selves[1] as first_self
-- from feedback f
-- left join museums m on m.id = f.museum_id
-- order by f.created_at desc;
