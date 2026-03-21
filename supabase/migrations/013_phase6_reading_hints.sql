-- ============================================================
-- Migration 013: Add reading_hint column to quest_days
-- RUN THIS MANUALLY in the Supabase SQL Editor BEFORE
-- deploying the new frontend code.
--
-- A short 1-2 sentence prompt/question to help students
-- engage with the passage. Can be populated by Clay manually,
-- by AI, or left NULL (hint button won't show).
-- ============================================================

ALTER TABLE quest_days ADD COLUMN IF NOT EXISTS reading_hint TEXT;

-- Notify PostgREST to pick up the schema change
NOTIFY pgrst, 'reload schema';
