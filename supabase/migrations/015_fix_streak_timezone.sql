-- ============================================================
-- Migration 015: Fix complete_reading streak timezone
-- RUN THIS MANUALLY in the Supabase SQL Editor.
--
-- The streak calculation used UTC for "today" which caused
-- completions after 6 PM Central Time to register as the next
-- UTC day, breaking streak continuity for users in Central Time.
--
-- Changed from: (NOW() AT TIME ZONE 'UTC')::DATE
-- Changed to:   (NOW() AT TIME ZONE 'America/Chicago')::DATE
--
-- v1 assumption: all users are in Central Time (Andover, MN).
-- ============================================================

CREATE OR REPLACE FUNCTION public.complete_reading(
  p_quest_day_id UUID, p_answer_1 TEXT, p_answer_2 TEXT, p_answer_3 TEXT, p_xp_earned INTEGER
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_last_date DATE;
  v_today DATE := (NOW() AT TIME ZONE 'America/Chicago')::DATE;
  v_new_streak INTEGER;
  v_new_xp INTEGER;
  v_new_level TEXT;
  v_new_badges JSONB;
  v_quest_day public.quest_days%ROWTYPE;
  v_total_xp INTEGER;
  v_quest_id UUID;
  v_total_days INTEGER;
  v_completed_days INTEGER;
  v_new_freezes INTEGER;
  v_existing_completion_id UUID;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user_id FOR UPDATE;

  -- Check if user already completed THIS specific quest_day
  SELECT id INTO v_existing_completion_id
    FROM public.completions WHERE user_id = v_user_id AND quest_day_id = p_quest_day_id;

  IF v_existing_completion_id IS NOT NULL THEN
    -- Re-completion: update answers but don't award XP again
    UPDATE public.completions SET answer_1=p_answer_1, answer_2=p_answer_2, answer_3=p_answer_3
    WHERE id = v_existing_completion_id;
    RETURN json_build_object(
      'new_streak', v_profile.current_streak, 'new_xp', v_profile.total_xp,
      'new_level', v_profile.level_title, 'new_badges', json_build_array(),
      'xp_earned', 0, 'milestone_bonus', 0, 'quest_complete', false, 'freeze_earned', false
    );
  END IF;

  -- First-time completion for this quest_day
  IF v_profile.last_completed_at IS NOT NULL THEN
    v_last_date := (v_profile.last_completed_at AT TIME ZONE 'America/Chicago')::DATE;
  END IF;

  -- Streak calculation (Central Time)
  IF v_last_date = v_today THEN
    v_new_streak := v_profile.current_streak;
  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
    v_new_streak := v_profile.current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_total_xp := p_xp_earned;
  SELECT * INTO v_quest_day FROM public.quest_days WHERE id = p_quest_day_id;
  IF v_quest_day.is_milestone = true THEN v_total_xp := v_total_xp + 50; END IF;

  INSERT INTO public.completions (user_id, quest_day_id, answer_1, answer_2, answer_3, xp_earned)
  VALUES (v_user_id, p_quest_day_id, p_answer_1, p_answer_2, p_answer_3, v_total_xp);

  v_quest_id := v_quest_day.quest_id;
  SELECT COUNT(*) INTO v_total_days FROM public.quest_days WHERE quest_id = v_quest_id;
  SELECT COUNT(*) INTO v_completed_days FROM public.completions c
    JOIN public.quest_days qd ON qd.id = c.quest_day_id
    WHERE c.user_id = v_user_id AND qd.quest_id = v_quest_id;
  IF v_completed_days >= v_total_days THEN v_total_xp := v_total_xp + 200; END IF;

  v_new_xp := v_profile.total_xp + v_total_xp;
  v_new_level := public.xp_to_level(v_new_xp);
  v_new_freezes := v_profile.streak_freezes_available;
  IF v_new_streak > 0 AND v_new_streak % 7 = 0 THEN v_new_freezes := v_new_freezes + 1; END IF;

  UPDATE public.profiles SET
    current_streak=v_new_streak, longest_streak=GREATEST(longest_streak, v_new_streak),
    total_xp=v_new_xp, level_title=v_new_level, last_completed_at=NOW(),
    streak_freezes_available=v_new_freezes
  WHERE id = v_user_id;

  PERFORM public.check_and_award_badges(v_user_id);
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', b.id, 'name', b.name, 'icon', b.icon)), '[]'::JSONB)
    INTO v_new_badges
    FROM public.user_badges ub JOIN public.badges b ON b.id = ub.badge_id
   WHERE ub.user_id = v_user_id AND ub.earned_at >= NOW() - INTERVAL '10 seconds';
  PERFORM public.update_mutual_streaks(v_user_id);

  RETURN json_build_object(
    'new_streak', v_new_streak, 'new_xp', v_new_xp, 'new_level', v_new_level,
    'new_badges', v_new_badges, 'xp_earned', v_total_xp,
    'milestone_bonus', CASE WHEN v_quest_day.is_milestone THEN 50 ELSE 0 END,
    'quest_complete', v_completed_days >= v_total_days,
    'freeze_earned', v_new_streak > 0 AND v_new_streak % 7 = 0
  );
END; $$;

NOTIFY pgrst, 'reload schema';
