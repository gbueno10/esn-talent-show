-- ============================================
-- ESN Talent Show - Database Schema Migration
-- ============================================
-- Run this SQL against your Supabase PostgreSQL instance.
-- Prerequisites: Anonymous Auth must be enabled in Supabase.

-- 1. Register the project
INSERT INTO public.projects (slug, name, description, access_level, allow_signup)
VALUES (
  'talent_show',
  'Talent Show',
  'ESN Talent Show - Live voting app for talent competitions',
  'public',
  false
);

-- 2. Create isolated schema
CREATE SCHEMA IF NOT EXISTS talent_show;

-- 3. Grant permissions (public app + anonymous auth)
GRANT USAGE ON SCHEMA talent_show TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA talent_show TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA talent_show TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA talent_show
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA talent_show
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 4. Create room status enum
CREATE TYPE talent_show.room_status AS ENUM ('waiting', 'intro', 'voting', 'closed');

-- 5. Create tables

-- Rooms: each room has a unique PIN for audience to join
CREATE TABLE talent_show.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin text UNIQUE NOT NULL,
  status talent_show.room_status DEFAULT 'waiting' NOT NULL,
  current_performer_id uuid,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Performers: the talent queue for each room
CREATE TABLE talent_show.performers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES talent_show.rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  act_description text,
  display_order integer NOT NULL DEFAULT 0,
  performed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add FK for current_performer_id now that performers table exists
ALTER TABLE talent_show.rooms
  ADD CONSTRAINT fk_current_performer
  FOREIGN KEY (current_performer_id) REFERENCES talent_show.performers(id)
  ON DELETE SET NULL;

-- Votes: one vote per user per performer
CREATE TABLE talent_show.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  performer_id uuid NOT NULL REFERENCES talent_show.performers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote boolean NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (performer_id, user_id)
);

-- 6. Enable Row Level Security

ALTER TABLE talent_show.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_show.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_show.votes ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- ROOMS --
CREATE POLICY "Anyone can view rooms"
  ON talent_show.rooms FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can create rooms"
  ON talent_show.rooms FOR INSERT
  TO authenticated
  WITH CHECK (public.is_project_admin('talent_show'));

CREATE POLICY "Admins can update rooms"
  ON talent_show.rooms FOR UPDATE
  TO authenticated
  USING (public.is_project_admin('talent_show'))
  WITH CHECK (public.is_project_admin('talent_show'));

CREATE POLICY "Admins can delete rooms"
  ON talent_show.rooms FOR DELETE
  TO authenticated
  USING (public.is_project_admin('talent_show'));

-- PERFORMERS --
CREATE POLICY "Anyone can view performers"
  ON talent_show.performers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can create performers"
  ON talent_show.performers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_project_admin('talent_show'));

CREATE POLICY "Admins can update performers"
  ON talent_show.performers FOR UPDATE
  TO authenticated
  USING (public.is_project_admin('talent_show'))
  WITH CHECK (public.is_project_admin('talent_show'));

CREATE POLICY "Admins can delete performers"
  ON talent_show.performers FOR DELETE
  TO authenticated
  USING (public.is_project_admin('talent_show'));

-- VOTES --
CREATE POLICY "Anyone can view votes"
  ON talent_show.votes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert own vote"
  ON talent_show.votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.uid() = user_id);

-- 8. Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE talent_show.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE talent_show.votes;
