-- ============================================================
-- Transform Quest — Phase 2 Social Migration
-- Run this AFTER 001_schema.sql and 002_auth_trigger.sql
-- ============================================================

-- ============================================================
-- NEW TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.friendships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a        UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b        UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mutual_streak INTEGER DEFAULT 0,
  status        TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);

CREATE TABLE IF NOT EXISTS public.nudges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quest_day_id UUID REFERENCES public.quest_days(id) ON DELETE CASCADE,
  nudged_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.badges (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  icon              TEXT,
  badge_type        TEXT CHECK (badge_type IN ('streak', 'quest', 'monthly', 'special')),
  requirement_value INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id  UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Add invite_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.friendships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges   ENABLE ROW LEVEL SECURITY;

-- friendships: parties can see their own friendships
CREATE POLICY "friendships_select" ON public.friendships FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- user_a initiates the friendship
CREATE POLICY "friendships_insert" ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_a);

-- only user_b can accept (update)
CREATE POLICY "friendships_update" ON public.friendships FOR UPDATE
  USING (auth.uid() = user_b);

-- either party can remove the friendship
CREATE POLICY "friendships_delete" ON public.friendships FOR DELETE
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- nudges: sender and receiver can see nudges
CREATE POLICY "nudges_select" ON public.nudges FOR SELECT
  USING (auth.uid() = from_user OR auth.uid() = to_user);

-- only the sender can insert (enforced further by send_nudge RPC)
CREATE POLICY "nudges_insert" ON public.nudges FOR INSERT
  WITH CHECK (auth.uid() = from_user);

-- badges: all authenticated users can read (public catalog)
CREATE POLICY "badges_select_all" ON public.badges FOR SELECT
  USING (auth.role() = 'authenticated');

-- user_badges: users can read their own; INSERT via SECURITY DEFINER function only
CREATE POLICY "user_badges_select_own" ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Generate a random 8-character uppercase invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

-- Backfill invite codes for existing users
UPDATE public.profiles
  SET invite_code = public.generate_invite_code()
  WHERE invite_code IS NULL;

-- ============================================================
-- UPDATE AUTH TRIGGER to include invite_code
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, invite_code)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    public.generate_invite_code()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================================
-- check_and_award_badges — awards any newly earned badges
-- Returns JSONB array of newly awarded badge objects
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile        public.profiles%ROWTYPE;
  v_new_badges     JSONB := '[]'::JSONB;
  v_badge          RECORD;
  v_completion_count INTEGER;
  v_friend_count     INTEGER;
  v_nudge_count      INTEGER;
  v_quest_complete   BOOLEAN;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

  -- Count completions (for First Steps badge)
  SELECT COUNT(*) INTO v_completion_count
    FROM public.completions WHERE user_id = p_user_id;

  -- Count accepted friendships (for Friendly badge)
  SELECT COUNT(*) INTO v_friend_count
    FROM public.friendships
    WHERE (user_a = p_user_id OR user_b = p_user_id) AND status = 'accepted';

  -- Count nudges sent (for Encourager badge)
  SELECT COUNT(*) INTO v_nudge_count
    FROM public.nudges WHERE from_user = p_user_id;

  -- Check quest completion (Matthew Scholar: all 30 days of the seeded quest)
  SELECT (
    SELECT COUNT(DISTINCT c.quest_day_id) FROM public.completions c
    JOIN public.quest_days qd ON qd.id = c.quest_day_id
    JOIN public.quests q ON q.id = qd.quest_id
    WHERE c.user_id = p_user_id AND q.is_active = false
  ) >= (
    SELECT COUNT(*) FROM public.quest_days qd2
    JOIN public.quests q2 ON q2.id = qd2.quest_id
    WHERE q2.is_active = false
    LIMIT 1
  ) INTO v_quest_complete;

  -- Evaluate each badge
  FOR v_badge IN
    SELECT * FROM public.badges ORDER BY badge_type, requirement_value
  LOOP
    -- Skip if already earned
    CONTINUE WHEN EXISTS (
      SELECT 1 FROM public.user_badges
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    );

    -- Check eligibility
    IF (v_badge.badge_type = 'streak' AND v_profile.current_streak >= v_badge.requirement_value)
    OR (v_badge.badge_type = 'special' AND v_badge.name = 'First Steps' AND v_completion_count >= 1)
    OR (v_badge.badge_type = 'special' AND v_badge.name = 'Friendly'    AND v_friend_count >= 1)
    OR (v_badge.badge_type = 'special' AND v_badge.name = 'Encourager'  AND v_nudge_count >= 1)
    OR (v_badge.badge_type = 'quest'   AND v_quest_complete)
    THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id)
      ON CONFLICT DO NOTHING;

      v_new_badges := v_new_badges || jsonb_build_object(
        'id',   v_badge.id,
        'name', v_badge.name,
        'icon', v_badge.icon
      );
    END IF;
  END LOOP;

  RETURN v_new_badges;
END;
$$;

-- ============================================================
-- update_mutual_streaks — updates mutual streak for all friendships
-- Called at end of complete_reading()
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_mutual_streaks(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_friendship     RECORD;
  v_friend_id      UUID;
  v_friend_date    DATE;
  v_today          DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
BEGIN
  FOR v_friendship IN
    SELECT * FROM public.friendships
    WHERE (user_a = p_user_id OR user_b = p_user_id) AND status = 'accepted'
  LOOP
    -- Determine the friend's ID
    v_friend_id := CASE
      WHEN v_friendship.user_a = p_user_id THEN v_friendship.user_b
      ELSE v_friendship.user_a
    END;

    -- Get the friend's last completion date
    SELECT (last_completed_at AT TIME ZONE 'UTC')::DATE
      INTO v_friend_date
      FROM public.profiles
      WHERE id = v_friend_id;

    -- If friend also completed today → increment mutual streak
    -- Otherwise reset to 0
    IF v_friend_date = v_today THEN
      UPDATE public.friendships
        SET mutual_streak = mutual_streak + 1
        WHERE id = v_friendship.id;
    ELSE
      UPDATE public.friendships
        SET mutual_streak = 0
        WHERE id = v_friendship.id;
    END IF;
  END LOOP;
END;
$$;

-- ============================================================
-- send_nudge — inserts a nudge (max 1 per friend per day)
-- Calls check_and_award_badges for Encourager badge
-- ============================================================
CREATE OR REPLACE FUNCTION public.send_nudge(
  p_to_user_id   UUID,
  p_quest_day_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_from_user_id UUID := auth.uid();
  v_today_start  TIMESTAMPTZ := date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
BEGIN
  IF v_from_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check for existing nudge today
  IF EXISTS (
    SELECT 1 FROM public.nudges
    WHERE from_user = v_from_user_id
      AND to_user   = p_to_user_id
      AND nudged_at >= v_today_start
  ) THEN
    RETURN jsonb_build_object('success', false, 'reason', 'already_nudged_today');
  END IF;

  INSERT INTO public.nudges (from_user, to_user, quest_day_id)
  VALUES (v_from_user_id, p_to_user_id, p_quest_day_id);

  -- Check for Encourager badge
  PERFORM public.check_and_award_badges(v_from_user_id);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- UPDATE complete_reading() to call badge + mutual streak checks
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
  v_user_id     UUID := auth.uid();
  v_profile     public.profiles%ROWTYPE;
  v_last_date   DATE;
  v_today       DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
  v_new_streak  INTEGER;
  v_new_xp      INTEGER;
  v_new_level   TEXT;
  v_new_badges  JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

  IF v_profile.last_completed_at IS NOT NULL THEN
    v_last_date := (v_profile.last_completed_at AT TIME ZONE 'UTC')::DATE;
  END IF;

  IF v_last_date = v_today THEN
    RAISE EXCEPTION 'Already completed today';
  END IF;

  -- Streak calculation
  IF v_last_date = v_today - INTERVAL '1 day' THEN
    v_new_streak := v_profile.current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_new_xp    := v_profile.total_xp + p_xp_earned;
  v_new_level := public.xp_to_level(v_new_xp);

  -- Insert completion
  INSERT INTO public.completions (user_id, quest_day_id, answer_1, answer_2, answer_3, xp_earned)
  VALUES (v_user_id, p_quest_day_id, p_answer_1, p_answer_2, p_answer_3, p_xp_earned);

  -- Update profile
  UPDATE public.profiles SET
    current_streak    = v_new_streak,
    longest_streak    = GREATEST(longest_streak, v_new_streak),
    total_xp          = v_new_xp,
    level_title       = v_new_level,
    last_completed_at = NOW()
  WHERE id = v_user_id;

  -- Award badges (returns newly earned badges)
  v_new_badges := public.check_and_award_badges(v_user_id);

  -- Update mutual streaks with friends
  PERFORM public.update_mutual_streaks(v_user_id);

  RETURN json_build_object(
    'new_streak',  v_new_streak,
    'new_xp',      v_new_xp,
    'new_level',   v_new_level,
    'new_badges',  v_new_badges
  );
END;
$$;
