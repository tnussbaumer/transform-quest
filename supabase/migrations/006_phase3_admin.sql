-- ============================================================
-- Transform Quest — Phase 3: Admin, Quest Engine & Streak Freeze
-- Run this AFTER 005_profiles_public_read.sql
-- IMPORTANT: Run this manually in the Supabase SQL Editor dashboard.
-- ============================================================

-- ============================================================
-- A. ANNOUNCEMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  body        TEXT,
  created_by  UUID REFERENCES public.profiles(id),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active announcements
CREATE POLICY "announcements_select" ON public.announcements FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only leaders/admins can insert
CREATE POLICY "announcements_insert" ON public.announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

-- Only leaders/admins can update
CREATE POLICY "announcements_update" ON public.announcements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

-- Only leaders/admins can delete
CREATE POLICY "announcements_delete" ON public.announcements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

-- ============================================================
-- B. STREAK FREEZES USED TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.streak_freezes_used (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_on    DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, used_on)
);

ALTER TABLE public.streak_freezes_used ENABLE ROW LEVEL SECURITY;

CREATE POLICY "streak_freezes_select_own" ON public.streak_freezes_used FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT only via use_streak_freeze RPC (SECURITY DEFINER)

-- ============================================================
-- C. QUEST WRITE POLICIES (leaders/admins can create/edit quests)
-- ============================================================

CREATE POLICY "quests_insert_leader" ON public.quests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

CREATE POLICY "quests_update_leader" ON public.quests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

-- ============================================================
-- D. QUEST_DAYS WRITE POLICIES
-- ============================================================

CREATE POLICY "quest_days_insert_leader" ON public.quest_days FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

CREATE POLICY "quest_days_update_leader" ON public.quest_days FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

CREATE POLICY "quest_days_delete_leader" ON public.quest_days FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

-- ============================================================
-- E. LEADER READ-ACCESS POLICIES
-- Leaders/admins can read all data for the engagement dashboard
-- ============================================================

CREATE POLICY "completions_select_leader" ON public.completions FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

-- Drop and recreate the completions_select_own policy to avoid conflicts
-- (the new completions_select_leader policy above already covers own-row access)
DROP POLICY IF EXISTS "completions_select_own" ON public.completions;

-- Leaders can read all friendships (for engagement dashboard)
CREATE POLICY "friendships_select_leader" ON public.friendships FOR SELECT
  USING (
    auth.uid() = user_a OR auth.uid() = user_b
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

-- Drop old friendships select policy to avoid conflict
DROP POLICY IF EXISTS "friendships_select" ON public.friendships;

-- Leaders can read all nudges
CREATE POLICY "nudges_select_leader" ON public.nudges FOR SELECT
  USING (
    auth.uid() = from_user OR auth.uid() = to_user
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

DROP POLICY IF EXISTS "nudges_select" ON public.nudges;

-- Leaders can read all user_badges
CREATE POLICY "user_badges_select_leader" ON public.user_badges FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('leader', 'admin')
    )
  );

DROP POLICY IF EXISTS "user_badges_select_own" ON public.user_badges;

-- ============================================================
-- F. UPDATED complete_reading() RPC
-- Adds: milestone +50 XP, quest completion +200 XP,
-- auto-awards streak freeze every 7 consecutive days
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
  v_user_id       UUID := auth.uid();
  v_profile       public.profiles%ROWTYPE;
  v_last_date     DATE;
  v_today         DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
  v_new_streak    INTEGER;
  v_new_xp        INTEGER;
  v_new_level     TEXT;
  v_new_badges    JSONB;
  v_quest_day     public.quest_days%ROWTYPE;
  v_total_xp      INTEGER;
  v_quest_id      UUID;
  v_total_days    INTEGER;
  v_completed_days INTEGER;
  v_new_freezes   INTEGER;
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

  -- Start with client-provided XP
  v_total_xp := p_xp_earned;

  -- Fetch the quest_day for milestone/quest-completion checks
  SELECT * INTO v_quest_day FROM public.quest_days WHERE id = p_quest_day_id;

  -- Milestone bonus: +50 XP
  IF v_quest_day.is_milestone = true THEN
    v_total_xp := v_total_xp + 50;
  END IF;

  -- Insert completion
  INSERT INTO public.completions (user_id, quest_day_id, answer_1, answer_2, answer_3, xp_earned)
  VALUES (v_user_id, p_quest_day_id, p_answer_1, p_answer_2, p_answer_3, v_total_xp);

  -- Check quest completion: did user just finish ALL days in this quest?
  v_quest_id := v_quest_day.quest_id;

  SELECT COUNT(*) INTO v_total_days
    FROM public.quest_days WHERE quest_id = v_quest_id;

  SELECT COUNT(*) INTO v_completed_days
    FROM public.completions c
    JOIN public.quest_days qd ON qd.id = c.quest_day_id
    WHERE c.user_id = v_user_id AND qd.quest_id = v_quest_id;

  IF v_completed_days >= v_total_days THEN
    v_total_xp := v_total_xp + 200;
  END IF;

  v_new_xp    := v_profile.total_xp + v_total_xp;
  v_new_level := public.xp_to_level(v_new_xp);

  -- Auto-award streak freeze every 7 consecutive days
  v_new_freezes := v_profile.streak_freezes_available;
  IF v_new_streak > 0 AND v_new_streak % 7 = 0 THEN
    v_new_freezes := v_new_freezes + 1;
  END IF;

  -- Update profile
  UPDATE public.profiles SET
    current_streak          = v_new_streak,
    longest_streak          = GREATEST(longest_streak, v_new_streak),
    total_xp                = v_new_xp,
    level_title             = v_new_level,
    last_completed_at       = NOW(),
    streak_freezes_available = v_new_freezes
  WHERE id = v_user_id;

  -- Award badges
  v_new_badges := public.check_and_award_badges(v_user_id);

  -- Update mutual streaks
  PERFORM public.update_mutual_streaks(v_user_id);

  RETURN json_build_object(
    'new_streak',       v_new_streak,
    'new_xp',           v_new_xp,
    'new_level',        v_new_level,
    'new_badges',       v_new_badges,
    'xp_earned',        v_total_xp,
    'milestone_bonus',  CASE WHEN v_quest_day.is_milestone = true THEN 50 ELSE 0 END,
    'quest_complete',   v_completed_days >= v_total_days,
    'freeze_earned',    v_new_streak > 0 AND v_new_streak % 7 = 0
  );
END;
$$;

-- ============================================================
-- G. use_streak_freeze RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.use_streak_freeze()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id   UUID := auth.uid();
  v_profile   public.profiles%ROWTYPE;
  v_last_date DATE;
  v_today     DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

  IF v_profile.streak_freezes_available <= 0 THEN
    RETURN json_build_object('freeze_used', false, 'reason', 'no_freezes_available');
  END IF;

  IF v_profile.last_completed_at IS NULL THEN
    RETURN json_build_object('freeze_used', false, 'reason', 'no_streak_to_save');
  END IF;

  v_last_date := (v_profile.last_completed_at AT TIME ZONE 'UTC')::DATE;

  -- Only allow freeze if last completion was 2 days ago (yesterday was missed)
  IF v_last_date >= v_today - INTERVAL '1 day' THEN
    RETURN json_build_object('freeze_used', false, 'reason', 'streak_not_broken');
  END IF;

  -- Use the freeze: decrement available, insert record, keep streak intact
  UPDATE public.profiles SET
    streak_freezes_available = streak_freezes_available - 1,
    last_completed_at = (v_today - INTERVAL '1 day')::DATE::TIMESTAMPTZ
  WHERE id = v_user_id;

  INSERT INTO public.streak_freezes_used (user_id, used_on)
  VALUES (v_user_id, v_today - INTERVAL '1 day')
  ON CONFLICT DO NOTHING;

  RETURN json_build_object(
    'freeze_used', true,
    'remaining_freezes', v_profile.streak_freezes_available - 1
  );
END;
$$;
