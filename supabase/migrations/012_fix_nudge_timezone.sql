-- ============================================================
-- Fix: send_nudge "today" check should use Central Time,
-- not UTC. Users in Central Time who nudge after 6 PM CT
-- see "Nudged" persist into the next local day because
-- the RPC was comparing against UTC midnight.
--
-- Changed from: date_trunc('day', NOW() AT TIME ZONE 'UTC')
-- Changed to:   date_trunc('day', NOW() AT TIME ZONE 'America/Chicago')
--
-- v1 assumption: all users are in Central Time (Andover, MN).
--
-- RUN THIS MANUALLY in the Supabase SQL Editor dashboard.
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
  v_today_start  TIMESTAMPTZ := (date_trunc('day', NOW() AT TIME ZONE 'America/Chicago')) AT TIME ZONE 'America/Chicago';
BEGIN
  IF v_from_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check for existing nudge today (Central Time day boundary)
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
