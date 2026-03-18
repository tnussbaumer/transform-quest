-- ============================================================
-- Phase 3B Migration: Social Discovery, Avatars, XP/Level Updates
-- ============================================================
-- MANUAL STEP: Run this in Supabase SQL Editor dashboard.
-- Also run supabase/seed_luke_acts.sql after this migration.
--
-- MANUAL STEP: Create a public storage bucket named 'avatars' in Supabase Dashboard:
-- 1. Go to Storage → New Bucket
-- 2. Name: "avatars"
-- 3. Public bucket: YES
-- 4. File size limit: 2MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp
-- Then add these Storage policies:
--   - SELECT (public): allow all (bucket_id = 'avatars')
--   - INSERT: allow authenticated users where (bucket_id = 'avatars') AND (storage.foldername(name))[1] = auth.uid()::text
--   - UPDATE: allow authenticated users where (bucket_id = 'avatars') AND (storage.foldername(name))[1] = auth.uid()::text
--   - DELETE: allow authenticated users where (bucket_id = 'avatars') AND (storage.foldername(name))[1] = auth.uid()::text
-- ============================================================

-- A. Avatar columns on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_type TEXT CHECK (avatar_type IN ('preset', 'custom')) DEFAULT 'preset';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_preset TEXT DEFAULT 'default';

-- B. Update xp_to_level() with Clay's level titles and new thresholds
CREATE OR REPLACE FUNCTION public.xp_to_level(p_xp INTEGER)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_xp >= 25000 THEN 'Scripture Master'
    WHEN p_xp >= 10000 THEN 'Word Warrior'
    WHEN p_xp >= 5000  THEN 'Kingdom Builder'
    WHEN p_xp >= 2000  THEN 'Disciple'
    WHEN p_xp >= 500   THEN 'Explorer'
    ELSE 'Seeker'
  END;
$$;

-- C. Update complete_reading() with new XP values
-- Base XP is passed from client (now 25 instead of 20).
-- Milestone bonus: +100 (was +50)
-- Quest completion bonus: +1000 (was +200)
-- Drop existing function first (return type changed to JSONB)
DROP FUNCTION IF EXISTS public.complete_reading(UUID, TEXT, TEXT, TEXT, INTEGER);
CREATE OR REPLACE FUNCTION public.complete_reading(
  p_quest_day_id UUID,
  p_answer_1 TEXT,
  p_answer_2 TEXT,
  p_answer_3 TEXT,
  p_xp_earned INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_quest_id UUID;
  v_is_milestone BOOLEAN;
  v_total_xp INTEGER;
  v_new_streak INTEGER;
  v_new_level TEXT;
  v_milestone_bonus INTEGER := 0;
  v_quest_complete BOOLEAN := false;
  v_total_days INTEGER;
  v_completed_days INTEGER;
  v_freeze_earned BOOLEAN := false;
  v_new_badges JSONB := '[]'::JSONB;
BEGIN
  -- Get quest info for this day
  SELECT qd.quest_id, qd.is_milestone
    INTO v_quest_id, v_is_milestone
    FROM public.quest_days qd
   WHERE qd.id = p_quest_day_id;

  -- Insert completion (will fail on unique constraint if already completed)
  INSERT INTO public.completions (user_id, quest_day_id, answer_1, answer_2, answer_3, xp_earned)
  VALUES (v_user_id, p_quest_day_id, p_answer_1, p_answer_2, p_answer_3, p_xp_earned);

  -- Update streak
  UPDATE public.profiles
     SET current_streak = CASE
           WHEN last_completed_at IS NULL THEN 1
           WHEN last_completed_at::date = CURRENT_DATE THEN current_streak
           WHEN last_completed_at::date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
           ELSE 1
         END,
         longest_streak = GREATEST(longest_streak, CASE
           WHEN last_completed_at IS NULL THEN 1
           WHEN last_completed_at::date = CURRENT_DATE THEN current_streak
           WHEN last_completed_at::date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
           ELSE 1
         END),
         last_completed_at = NOW()
   WHERE id = v_user_id
   RETURNING current_streak INTO v_new_streak;

  -- Calculate milestone bonus (+100 XP for milestones)
  IF v_is_milestone THEN
    v_milestone_bonus := 100;
  END IF;

  -- Check quest completion
  SELECT COUNT(*), COUNT(*) FILTER (
    WHERE EXISTS (SELECT 1 FROM public.completions c WHERE c.quest_day_id = qd.id AND c.user_id = v_user_id)
  )
    INTO v_total_days, v_completed_days
    FROM public.quest_days qd
   WHERE qd.quest_id = v_quest_id;

  IF v_completed_days = v_total_days THEN
    v_quest_complete := true;
    v_milestone_bonus := v_milestone_bonus + 1000; -- Quest completion bonus
  END IF;

  -- Update XP and level
  UPDATE public.profiles
     SET total_xp = total_xp + p_xp_earned + v_milestone_bonus,
         level_title = public.xp_to_level(total_xp + p_xp_earned + v_milestone_bonus)
   WHERE id = v_user_id
   RETURNING total_xp INTO v_total_xp;

  v_new_level := public.xp_to_level(v_total_xp);

  -- Auto-award streak freeze every 7 streak days
  IF v_new_streak > 0 AND v_new_streak % 7 = 0 THEN
    UPDATE public.profiles
       SET streak_freezes_available = streak_freezes_available + 1
     WHERE id = v_user_id;
    v_freeze_earned := true;
  END IF;

  -- Check and award badges (also handles streak XP bonuses)
  PERFORM public.check_and_award_badges(v_user_id);

  -- Fetch any newly awarded badges for the response
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', b.id, 'name', b.name, 'icon', b.icon)), '[]'::JSONB)
    INTO v_new_badges
    FROM public.user_badges ub
    JOIN public.badges b ON b.id = ub.badge_id
   WHERE ub.user_id = v_user_id
     AND ub.earned_at >= NOW() - INTERVAL '10 seconds';

  -- Update mutual streaks
  PERFORM public.update_mutual_streaks(v_user_id);

  RETURN jsonb_build_object(
    'new_streak', v_new_streak,
    'new_xp', v_total_xp,
    'new_level', v_new_level,
    'new_badges', v_new_badges,
    'xp_earned', p_xp_earned,
    'milestone_bonus', v_milestone_bonus,
    'quest_complete', v_quest_complete,
    'freeze_earned', v_freeze_earned
  );
END;
$$;

-- D. Update check_and_award_badges to include streak XP rewards
-- Drop existing function first (return type changed from JSONB to VOID)
DROP FUNCTION IF EXISTS public.check_and_award_badges(UUID);
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_streak INTEGER;
  v_completions_count INTEGER;
  v_has_friendship BOOLEAN;
  v_has_nudge BOOLEAN;
  v_badge RECORD;
  v_was_inserted BOOLEAN;
  v_streak_xp INTEGER := 0;
BEGIN
  -- Get current streak
  SELECT current_streak INTO v_streak FROM public.profiles WHERE id = p_user_id;

  -- Count completions
  SELECT COUNT(*) INTO v_completions_count FROM public.completions WHERE user_id = p_user_id;

  -- Check friendships
  SELECT EXISTS(
    SELECT 1 FROM public.friendships
     WHERE (user_a = p_user_id OR user_b = p_user_id) AND status = 'accepted'
  ) INTO v_has_friendship;

  -- Check nudges sent
  SELECT EXISTS(
    SELECT 1 FROM public.nudges WHERE from_user = p_user_id
  ) INTO v_has_nudge;

  -- Award streak badges with XP bonuses
  FOR v_badge IN
    SELECT id, requirement_value FROM public.badges
     WHERE badge_type = 'streak' AND requirement_value IS NOT NULL AND requirement_value <= v_streak
  LOOP
    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (p_user_id, v_badge.id)
    ON CONFLICT (user_id, badge_id) DO NOTHING
    RETURNING TRUE INTO v_was_inserted;

    -- If badge was just earned, calculate streak XP bonus
    IF v_was_inserted THEN
      v_streak_xp := v_streak_xp + CASE v_badge.requirement_value
        WHEN 3   THEN 50
        WHEN 7   THEN 100
        WHEN 14  THEN 150
        WHEN 21  THEN 200
        WHEN 30  THEN 300
        WHEN 45  THEN 400
        WHEN 60  THEN 500
        WHEN 75  THEN 600
        WHEN 90  THEN 1000
        WHEN 180 THEN 1500
        WHEN 365 THEN 3000
        ELSE 0
      END;
    END IF;
  END LOOP;

  -- Apply streak XP bonus if any
  IF v_streak_xp > 0 THEN
    UPDATE public.profiles
       SET total_xp = total_xp + v_streak_xp,
           level_title = public.xp_to_level(total_xp + v_streak_xp)
     WHERE id = p_user_id;
  END IF;

  -- First Steps badge (any completion)
  IF v_completions_count > 0 THEN
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.badges WHERE name = 'First Steps'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;

  -- Friendly badge
  IF v_has_friendship THEN
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.badges WHERE name = 'Friendly'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;

  -- Encourager badge
  IF v_has_nudge THEN
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT p_user_id, id FROM public.badges WHERE name = 'Encourager'
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;

  -- Quest completion badges — check if user completed all days of any quest
  INSERT INTO public.user_badges (user_id, badge_id)
  SELECT p_user_id, b.id
    FROM public.quests q
    JOIN public.badges b ON b.name = q.badge_name AND b.badge_type = 'quest'
   WHERE NOT EXISTS (
     SELECT 1 FROM public.quest_days qd
      WHERE qd.quest_id = q.id
        AND NOT EXISTS (
          SELECT 1 FROM public.completions c WHERE c.quest_day_id = qd.id AND c.user_id = p_user_id
        )
   )
  ON CONFLICT (user_id, badge_id) DO NOTHING;
END;
$$;

-- E. Seed new Luke-Acts section badges
INSERT INTO public.badges (name, description, icon, badge_type, requirement_value) VALUES
  ('The Investigation Begins', 'Completed the Prologue of Luke', '🔍', 'quest', NULL),
  ('The Story Begins', 'Completed the Infancy Narrative', '⭐', 'quest', NULL),
  ('Ready for the Mission', 'Completed Luke 3:1-4:15', '🎯', 'quest', NULL),
  ('Following Jesus', 'Completed Jesus'' Ministry in Galilee', '👣', 'quest', NULL),
  ('On the Road with Jesus', 'Completed Luke 9:51-19:27', '🛤️', 'quest', NULL),
  ('The King Arrives', 'Completed Luke 19:28-21:38', '👑', 'quest', NULL),
  ('The Sacrifice', 'Jesus willingly gives His life on the cross for sinners', '✝️', 'quest', NULL),
  ('The Risen King', 'Jesus conquers death and sends His followers to proclaim the gospel', '🌅', 'quest', NULL),
  ('Power from the Spirit', 'Completed Acts 1:1-2:13', '🔥', 'quest', NULL),
  ('Church Ignited', 'Completed Acts 2:14-5:42', '⛪', 'quest', NULL),
  ('The Mission Expands', 'Completed Acts 6-12', '🌍', 'quest', NULL),
  ('First Mission Journey', 'Completed Acts 13-14', '⛵', 'quest', NULL),
  ('The Gospel Clarified', 'Completed Acts 15', '📜', 'quest', NULL),
  ('The Gospel Crosses Cultures', 'Completed Acts 15:36-18:22', '🌏', 'quest', NULL),
  ('Kingdom Impact', 'Completed Acts 18:23-21:16', '💥', 'quest', NULL),
  ('Standing for Jesus', 'Completed Acts 21-26', '🛡️', 'quest', NULL),
  ('The Gospel to the World', 'Completed Acts 27-28', '🗺️', 'quest', NULL),
  ('The Gospel Unleashed', 'Completed the entire Luke-Acts Quest', '🏆', 'quest', NULL)
ON CONFLICT DO NOTHING;

-- F. Seed new streak badges from Clay's spec (new milestones: 3, 21, 45, 75)
INSERT INTO public.badges (name, description, icon, badge_type, requirement_value) VALUES
  ('Getting Started', 'You''ve started the habit. Keep it going!', '🌱', 'streak', 3),
  ('Locked In', 'Two full weeks of being consistent', '🔒', 'streak', 14),
  ('Habit Builder', 'Three weeks in - this is becoming part of your daily rhythm', '🧱', 'streak', 21),
  ('Polishing Your Sword', 'A full month in God''s Word', '⚔️', 'streak', 30),
  ('Halfway Hero', 'Halfway through the quest!', '🦸', 'streak', 45),
  ('Deep Roots', 'Two months of daily Bible reading', '🌳', 'streak', 60),
  ('Final Stretch', 'You''re almost at the finish line', '🏁', 'streak', 75)
ON CONFLICT DO NOTHING;
