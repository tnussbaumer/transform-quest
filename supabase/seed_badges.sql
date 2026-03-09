-- ============================================================
-- Transform Quest — Badge Seed Data
-- Run AFTER 003_phase2_social.sql
-- ============================================================

INSERT INTO public.badges (name, description, icon, badge_type, requirement_value) VALUES
  -- Streak badges
  ('Week Warrior',   'Read 7 days in a row',   '🔥', 'streak',   7),
  ('Two-Week Titan', 'Read 14 days in a row',  '🔥', 'streak',  14),
  ('Monthly Master', 'Read 30 days in a row',  '🔥', 'streak',  30),
  ('Iron Will',      'Read 60 days in a row',  '💪', 'streak',  60),
  ('Unstoppable',    'Read 90 days in a row',  '⚡', 'streak',  90),
  ('Half-Year Hero', 'Read 180 days in a row', '🌟', 'streak', 180),
  ('Legendary',      'Read 365 days in a row', '👑', 'streak', 365),
  -- Special badges
  ('First Steps',    'Completed your first reading',  '📖', 'special', 1),
  ('Friendly',       'Added your first friend',        '👋', 'special', 1),
  ('Encourager',     'Sent your first nudge',          '💬', 'special', 1),
  -- Quest badge
  ('Matthew Scholar','Completed Journey Through Matthew', '📜', 'quest', NULL)
ON CONFLICT DO NOTHING;
