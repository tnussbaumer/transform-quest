-- ============================================================
-- Migration 014: Add hints_enabled toggle to quests
-- RUN THIS MANUALLY in the Supabase SQL Editor.
--
-- Default true so existing quests with hints show them immediately.
-- Clay can flip to false to hide all hints without deleting hint text.
-- ============================================================

ALTER TABLE quests ADD COLUMN IF NOT EXISTS hints_enabled BOOLEAN DEFAULT true;

NOTIFY pgrst, 'reload schema';
