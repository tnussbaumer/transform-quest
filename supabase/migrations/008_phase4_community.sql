-- ============================================================
-- Phase 4 — Community Feed
-- RUN THIS MANUALLY in the Supabase SQL Editor dashboard.
-- Must be run AFTER all previous migrations (001–007).
-- ============================================================

-- A. wall_posts table
CREATE TABLE wall_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quest_day_id    UUID REFERENCES quest_days(id) ON DELETE CASCADE,
  post_type       TEXT NOT NULL CHECK (post_type IN ('reflection', 'thought')),
  visibility      TEXT NOT NULL CHECK (visibility IN ('friends', 'everyone')) DEFAULT 'friends',
  share_answer_1  BOOLEAN DEFAULT false,
  share_answer_2  BOOLEAN DEFAULT false,
  share_answer_3  BOOLEAN DEFAULT false,
  thought_text    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_post_content CHECK (
    (post_type = 'reflection' AND (share_answer_1 OR share_answer_2 OR share_answer_3))
    OR
    (post_type = 'thought' AND thought_text IS NOT NULL AND LENGTH(TRIM(thought_text)) > 0)
  )
);

CREATE INDEX idx_wall_posts_quest_day ON wall_posts(quest_day_id, created_at DESC);
CREATE INDEX idx_wall_posts_user ON wall_posts(user_id, created_at DESC);

-- B. wall_reactions table
CREATE TABLE wall_reactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type   TEXT NOT NULL CHECK (reaction_type IN ('heart', 'prayer', 'fire', 'me_too')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

CREATE INDEX idx_wall_reactions_post ON wall_reactions(post_id);

-- C. Enable RLS
ALTER TABLE wall_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_reactions ENABLE ROW LEVEL SECURITY;

-- D. RLS policies for wall_posts

-- SELECT: author can always see own posts; others based on visibility
CREATE POLICY wall_posts_select ON wall_posts FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR visibility = 'everyone'
  OR (
    visibility = 'friends' AND EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (user_a = auth.uid() AND user_b = wall_posts.user_id)
        OR (user_a = wall_posts.user_id AND user_b = auth.uid())
      )
    )
  )
);

-- INSERT: authenticated users can create their own posts
CREATE POLICY wall_posts_insert ON wall_posts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- DELETE: users can delete their own posts
CREATE POLICY wall_posts_delete ON wall_posts FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Leaders/admins can see and delete any post (moderation)
CREATE POLICY wall_posts_leader_select ON wall_posts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('leader', 'admin'))
);
CREATE POLICY wall_posts_leader_delete ON wall_posts FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('leader', 'admin'))
);

-- E. RLS policies for wall_reactions

CREATE POLICY wall_reactions_select ON wall_reactions FOR SELECT TO authenticated USING (true);

CREATE POLICY wall_reactions_insert ON wall_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY wall_reactions_delete ON wall_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- F. get_wall_feed RPC — returns today's wall posts with joined data
CREATE OR REPLACE FUNCTION get_wall_feed(p_quest_day_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_user_id UUID := auth.uid();
BEGIN
  SELECT COALESCE(jsonb_agg(post_data ORDER BY post_data->>'created_at' DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT jsonb_build_object(
      'id', wp.id,
      'user_id', wp.user_id,
      'post_type', wp.post_type,
      'visibility', wp.visibility,
      'share_answer_1', wp.share_answer_1,
      'share_answer_2', wp.share_answer_2,
      'share_answer_3', wp.share_answer_3,
      'thought_text', wp.thought_text,
      'created_at', wp.created_at,
      'author_name', p.display_name,
      'author_avatar_type', p.avatar_type,
      'author_avatar_preset', p.avatar_preset,
      'author_avatar_url', p.avatar_url,
      'answer_1', CASE WHEN wp.share_answer_1 THEN c.answer_1 ELSE NULL END,
      'answer_2', CASE WHEN wp.share_answer_2 THEN c.answer_2 ELSE NULL END,
      'answer_3', CASE WHEN wp.share_answer_3 THEN c.answer_3 ELSE NULL END,
      'reactions', (
        SELECT COALESCE(jsonb_object_agg(reaction_type, cnt), '{}'::jsonb)
        FROM (
          SELECT reaction_type, COUNT(*) as cnt
          FROM wall_reactions WHERE post_id = wp.id
          GROUP BY reaction_type
        ) rc
      ),
      'my_reactions', (
        SELECT COALESCE(jsonb_agg(reaction_type), '[]'::jsonb)
        FROM wall_reactions WHERE post_id = wp.id AND user_id = v_user_id
      ),
      'is_mine', (wp.user_id = v_user_id)
    ) as post_data
    FROM wall_posts wp
    JOIN profiles p ON p.id = wp.user_id
    LEFT JOIN completions c ON c.user_id = wp.user_id AND c.quest_day_id = wp.quest_day_id
    WHERE wp.quest_day_id = p_quest_day_id
    AND (
      wp.user_id = v_user_id
      OR wp.visibility = 'everyone'
      OR (
        wp.visibility = 'friends' AND EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (user_a = v_user_id AND user_b = wp.user_id)
            OR (user_a = wp.user_id AND user_b = v_user_id)
          )
        )
      )
    )
  ) sub;

  RETURN v_result;
END;
$$;

-- G. toggle_reaction RPC
CREATE OR REPLACE FUNCTION toggle_reaction(p_post_id UUID, p_reaction_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing UUID;
BEGIN
  SELECT id INTO v_existing
  FROM wall_reactions
  WHERE post_id = p_post_id AND user_id = v_user_id AND reaction_type = p_reaction_type;

  IF v_existing IS NOT NULL THEN
    DELETE FROM wall_reactions WHERE id = v_existing;
    RETURN jsonb_build_object('action', 'removed', 'reaction_type', p_reaction_type);
  ELSE
    INSERT INTO wall_reactions (post_id, user_id, reaction_type)
    VALUES (p_post_id, v_user_id, p_reaction_type);
    RETURN jsonb_build_object('action', 'added', 'reaction_type', p_reaction_type);
  END IF;
END;
$$;

-- H. create_wall_post RPC
-- Awards 15 XP for the first share of the day (once per calendar day).
CREATE OR REPLACE FUNCTION create_wall_post(
  p_quest_day_id UUID,
  p_post_type TEXT,
  p_visibility TEXT DEFAULT 'friends',
  p_share_answer_1 BOOLEAN DEFAULT false,
  p_share_answer_2 BOOLEAN DEFAULT false,
  p_share_answer_3 BOOLEAN DEFAULT false,
  p_thought_text TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_id UUID;
  v_user_id UUID := auth.uid();
  v_already_shared_today BOOLEAN;
  v_share_xp INTEGER := 0;
BEGIN
  -- For reflection posts, verify user actually has a completion for this quest_day
  IF p_post_type = 'reflection' THEN
    IF NOT EXISTS (
      SELECT 1 FROM completions WHERE user_id = v_user_id AND quest_day_id = p_quest_day_id
    ) THEN
      RAISE EXCEPTION 'Cannot share reflections without completing the reading first';
    END IF;
  END IF;

  -- Check if user already shared today (any post from today)
  SELECT EXISTS (
    SELECT 1 FROM wall_posts
    WHERE user_id = v_user_id
      AND created_at::date = CURRENT_DATE
  ) INTO v_already_shared_today;

  INSERT INTO wall_posts (user_id, quest_day_id, post_type, visibility, share_answer_1, share_answer_2, share_answer_3, thought_text)
  VALUES (v_user_id, p_quest_day_id, p_post_type, p_visibility, p_share_answer_1, p_share_answer_2, p_share_answer_3, p_thought_text)
  RETURNING id INTO v_post_id;

  -- Award 15 XP for first share of the day
  IF NOT v_already_shared_today THEN
    v_share_xp := 15;
    UPDATE profiles
    SET total_xp = total_xp + v_share_xp,
        level_title = xp_to_level(total_xp + v_share_xp)
    WHERE id = v_user_id;
  END IF;

  RETURN jsonb_build_object(
    'post_id', v_post_id,
    'xp_earned', v_share_xp
  );
END;
$$;
