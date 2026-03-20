-- ============================================================
-- Fix: complete_reading duplicate check should be per quest_day,
-- not per calendar day.
--
-- The old logic: IF last_completed_at::DATE = today THEN RAISE 'Already completed today'
-- This prevents a user from completing ANY reading if they already completed
-- a different quest_day on the same UTC date. This breaks when:
--   1. The quest start_date is adjusted (user sees a different day)
--   2. User is in a timezone behind UTC (6 PM CT = midnight UTC = "next day")
--
-- New logic: rely on the UNIQUE(user_id, quest_day_id) constraint on completions.
-- If the user already completed this specific quest_day, do an UPSERT (update answers)
-- without awarding double XP. If they haven't, insert normally.
--
-- RUN THIS MANUALLY in the Supabase SQL Editor dashboard.
-- Must be run AFTER all previous migrations (001–010).
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
  v_existing_completion_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

  -- Check if user already completed THIS specific quest_day (not calendar-based)
  SELECT id INTO v_existing_completion_id
    FROM public.completions
    WHERE user_id = v_user_id AND quest_day_id = p_quest_day_id;

  IF v_existing_completion_id IS NOT NULL THEN
    -- Re-completion: update answers but don't award XP again
    UPDATE public.completions SET
      answer_1 = p_answer_1,
      answer_2 = p_answer_2,
      answer_3 = p_answer_3
    WHERE id = v_existing_completion_id;

    RETURN json_build_object(
      'new_streak',       v_profile.current_streak,
      'new_xp',           v_profile.total_xp,
      'new_level',        v_profile.level_title,
      'new_badges',       '[]'::jsonb,
      'xp_earned',        0,
      'milestone_bonus',  0,
      'quest_complete',   false,
      'freeze_earned',    false
    );
  END IF;

  -- First-time completion for this quest_day
  IF v_profile.last_completed_at IS NOT NULL THEN
    v_last_date := (v_profile.last_completed_at AT TIME ZONE 'UTC')::DATE;
  END IF;

  -- Streak calculation
  IF v_last_date = v_today THEN
    -- Already completed a different quest_day today — keep current streak, don't increment
    v_new_streak := v_profile.current_streak;
  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
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
