-- ============================================================
-- Fix: Allow friends to see each other's completions
-- RUN THIS MANUALLY in the Supabase SQL Editor dashboard.
-- Must be run AFTER all previous migrations (001–009).
-- ============================================================

-- The completions RLS only allowed own-row SELECT. This meant users
-- couldn't see whether their friends completed today's reading,
-- breaking the nudge button logic and "X friends completed" count.

-- Allow reading completions of accepted friends
CREATE POLICY completions_friends_select ON completions FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (user_a = auth.uid() AND user_b = completions.user_id)
      OR (user_a = completions.user_id AND user_b = auth.uid())
    )
  )
);
