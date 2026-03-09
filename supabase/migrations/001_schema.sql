-- ============================================================
-- Transform Quest — Phase 1 Schema
-- Run this in the Supabase SQL Editor for your project
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id                        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name              TEXT NOT NULL,
  avatar_url                TEXT,
  role                      TEXT CHECK (role IN ('youth', 'leader', 'admin')) DEFAULT 'youth',
  current_streak            INTEGER DEFAULT 0,
  longest_streak            INTEGER DEFAULT 0,
  total_xp                  INTEGER DEFAULT 0,
  level_title               TEXT DEFAULT 'Seedling',
  last_completed_at         TIMESTAMPTZ,
  streak_freezes_available  INTEGER DEFAULT 0,
  daily_reminder_time       TIME DEFAULT '19:00',
  push_subscription         JSONB,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  quest_type  TEXT CHECK (quest_type IN ('reading', 'discipline', 'event')) DEFAULT 'reading',
  created_by  UUID REFERENCES public.profiles(id),
  badge_name  TEXT,
  badge_icon  TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quest_days (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id          UUID REFERENCES public.quests(id) ON DELETE CASCADE,
  day_number        INTEGER NOT NULL,
  passage_reference TEXT,
  passage_text      TEXT,
  is_milestone      BOOLEAN DEFAULT false,
  milestone_note    TEXT,
  UNIQUE(quest_id, day_number)
);

CREATE TABLE IF NOT EXISTS public.completions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quest_day_id  UUID REFERENCES public.quest_days(id),
  answer_1      TEXT NOT NULL,
  answer_2      TEXT NOT NULL,
  answer_3      TEXT NOT NULL,
  xp_earned     INTEGER NOT NULL,
  completed_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_day_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_days  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

-- profiles: users can read/update their own row
CREATE POLICY "profiles_select_own"  ON public.profiles FOR SELECT  USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"  ON public.profiles FOR INSERT  WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE  USING (auth.uid() = id);

-- quests: all authenticated users can read
CREATE POLICY "quests_select_all"    ON public.quests    FOR SELECT  USING (auth.role() = 'authenticated');

-- quest_days: all authenticated users can read
CREATE POLICY "quest_days_select_all" ON public.quest_days FOR SELECT USING (auth.role() = 'authenticated');

-- completions: users can read their own, insert their own only
CREATE POLICY "completions_select_own" ON public.completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "completions_insert_own" ON public.completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HELPER: level title from total XP
-- ============================================================
CREATE OR REPLACE FUNCTION public.xp_to_level(p_xp INTEGER)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_xp >= 25000 THEN 'Mighty Oak'
    WHEN p_xp >= 10000 THEN 'Flourishing'
    WHEN p_xp >=  5000 THEN 'Branching'
    WHEN p_xp >=  2000 THEN 'Rooted'
    WHEN p_xp >=   500 THEN 'Sprout'
    ELSE 'Seedling'
  END;
$$;

-- ============================================================
-- RPC: complete_reading — atomic completion + streak + XP update
-- Called from the client after the user finishes the reading flow.
-- Returns the new streak, new total XP, and new level title.
-- ============================================================
CREATE OR REPLACE FUNCTION public.complete_reading(
  p_quest_day_id  UUID,
  p_answer_1      TEXT,
  p_answer_2      TEXT,
  p_answer_3      TEXT,
  p_xp_earned     INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id          UUID := auth.uid();
  v_profile          public.profiles%ROWTYPE;
  v_last_date        DATE;
  v_today            DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
  v_new_streak       INTEGER;
  v_new_xp           INTEGER;
  v_new_level        TEXT;
BEGIN
  -- Guard: must be authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock the profile row for update
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  -- Determine today's date in UTC (streak logic uses calendar dates)
  IF v_profile.last_completed_at IS NOT NULL THEN
    v_last_date := (v_profile.last_completed_at AT TIME ZONE 'UTC')::DATE;
  END IF;

  -- Guard: already completed today
  IF v_last_date = v_today THEN
    RAISE EXCEPTION 'Already completed today';
  END IF;

  -- Calculate new streak
  IF v_last_date = v_today - INTERVAL '1 day' THEN
    -- Continued streak
    v_new_streak := v_profile.current_streak + 1;
  ELSE
    -- Gap or first time — reset
    v_new_streak := 1;
  END IF;

  v_new_xp    := v_profile.total_xp + p_xp_earned;
  v_new_level := public.xp_to_level(v_new_xp);

  -- Insert completion
  INSERT INTO public.completions (user_id, quest_day_id, answer_1, answer_2, answer_3, xp_earned)
  VALUES (v_user_id, p_quest_day_id, p_answer_1, p_answer_2, p_answer_3, p_xp_earned);

  -- Update profile
  UPDATE public.profiles SET
    current_streak   = v_new_streak,
    longest_streak   = GREATEST(longest_streak, v_new_streak),
    total_xp         = v_new_xp,
    level_title      = v_new_level,
    last_completed_at = NOW()
  WHERE id = v_user_id;

  RETURN json_build_object(
    'new_streak', v_new_streak,
    'new_xp',     v_new_xp,
    'new_level',  v_new_level
  );
END;
$$;
