-- ============================================================
-- Luke-Acts 90-Day Quest Seed Data
-- ============================================================
-- MANUAL STEP: Run this in Supabase SQL Editor AFTER running
-- supabase/migrations/007_phase3b_social_avatars.sql
--
-- This inserts the quest and all 79 reading days.
-- Tim: Update start_date/end_date to Clay's actual launch date.
-- Set is_active = true when Clay is ready to launch.
-- ============================================================

-- Insert the quest (using a DO block to capture the generated quest ID)
DO $$
DECLARE
  v_quest_id UUID;
BEGIN
  INSERT INTO public.quests (title, description, start_date, end_date, quest_type, badge_name, badge_icon, is_active)
  VALUES (
    'Luke–Acts: The Gospel Unleashed',
    'Follow the story from the birth of Jesus to the spread of the gospel across the Roman world. 79 readings over 90 days through Luke and Acts.',
    '2026-04-01',   -- UPDATE to Clay''s actual launch date
    '2026-06-29',   -- 90 days from start
    'reading',
    'The Gospel Unleashed',
    '🏆',
    false           -- Set to true when Clay is ready to launch
  )
  RETURNING id INTO v_quest_id;

  -- LUKE (Days 1-44)

  -- PROLOGUE (Day 1) — Badge: "The Investigation Begins"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 1,  'Luke 1:1–4',         NULL, true,  'The Investigation Begins');

  -- THE STORY BEGINS (Days 2-8) — Badge: "The Story Begins"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 2,  'Luke 1:5–25',        NULL, false, NULL),
  (v_quest_id, 3,  'Luke 1:26–38',       NULL, false, NULL),
  (v_quest_id, 4,  'Luke 1:39–56',       NULL, false, NULL),
  (v_quest_id, 5,  'Luke 1:57–80',       NULL, false, NULL),
  (v_quest_id, 6,  'Luke 2:1–20',        NULL, false, NULL),
  (v_quest_id, 7,  'Luke 2:21–40',       NULL, false, NULL),
  (v_quest_id, 8,  'Luke 2:41–52',       NULL, true,  'The Story Begins');

  -- READY FOR THE MISSION (Days 9-11) — Badge: "Ready for the Mission"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 9,  'Luke 3:1–20',        NULL, false, NULL),
  (v_quest_id, 10, 'Luke 3:21–38',       NULL, false, NULL),
  (v_quest_id, 11, 'Luke 4:1–15',        NULL, true,  'Ready for the Mission');

  -- JESUS' MINISTRY IN GALILEE (Days 12-20) — Badge: "Following Jesus"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 12, 'Luke 4:16–44',       NULL, false, NULL),
  (v_quest_id, 13, 'Luke 5:1–26',        NULL, false, NULL),
  (v_quest_id, 14, 'Luke 5:27–6:11',     NULL, false, NULL),
  (v_quest_id, 15, 'Luke 6:12–49',       NULL, false, NULL),
  (v_quest_id, 16, 'Luke 7:1–35',        NULL, false, NULL),
  (v_quest_id, 17, 'Luke 7:36–8:21',     NULL, false, NULL),
  (v_quest_id, 18, 'Luke 8:22–56',       NULL, false, NULL),
  (v_quest_id, 19, 'Luke 9:1–36',        NULL, false, NULL),
  (v_quest_id, 20, 'Luke 9:37–50',       NULL, true,  'Following Jesus');

  -- ON THE ROAD WITH JESUS (Days 21-34) — Badge: "On the Road with Jesus"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 21, 'Luke 9:51–10:24',    NULL, false, NULL),
  (v_quest_id, 22, 'Luke 10:25–42',      NULL, false, NULL),
  (v_quest_id, 23, 'Luke 11:1–36',       NULL, false, NULL),
  (v_quest_id, 24, 'Luke 11:37–12:12',   NULL, false, NULL),
  (v_quest_id, 25, 'Luke 12:13–48',      NULL, false, NULL),
  (v_quest_id, 26, 'Luke 12:49–13:21',   NULL, false, NULL),
  (v_quest_id, 27, 'Luke 13:22–14:14',   NULL, false, NULL),
  (v_quest_id, 28, 'Luke 14:15–35',      NULL, false, NULL),
  (v_quest_id, 29, 'Luke 15:1–32',       NULL, false, NULL),
  (v_quest_id, 30, 'Luke 16:1–18',       NULL, false, NULL),
  (v_quest_id, 31, 'Luke 16:19–17:19',   NULL, false, NULL),
  (v_quest_id, 32, 'Luke 17:20–18:17',   NULL, false, NULL),
  (v_quest_id, 33, 'Luke 18:18–19:10',   NULL, false, NULL),
  (v_quest_id, 34, 'Luke 19:11–27',      NULL, true,  'On the Road with Jesus');

  -- THE KING ARRIVES (Days 35-38) — Badge: "The King Arrives"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 35, 'Luke 19:28–48',      NULL, false, NULL),
  (v_quest_id, 36, 'Luke 20:1–26',       NULL, false, NULL),
  (v_quest_id, 37, 'Luke 20:27–21:4',    NULL, false, NULL),
  (v_quest_id, 38, 'Luke 21:5–38',       NULL, true,  'The King Arrives');

  -- THE SACRIFICE (Days 39-42) — Badge: "The Sacrifice"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 39, 'Luke 22:1–38',       NULL, false, NULL),
  (v_quest_id, 40, 'Luke 22:39–71',      NULL, false, NULL),
  (v_quest_id, 41, 'Luke 23:1–25',       NULL, false, NULL),
  (v_quest_id, 42, 'Luke 23:26–56',      NULL, true,  'The Sacrifice');

  -- THE RISEN KING (Days 43-44) — Badge: "The Risen King"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 43, 'Luke 24:1–35',       NULL, false, NULL),
  (v_quest_id, 44, 'Luke 24:36–53',      NULL, true,  'The Risen King');

  -- ACTS (Days 45-79)

  -- POWER FROM THE SPIRIT (Days 45-46) — Badge: "Power from the Spirit"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 45, 'Acts 1:1–26',        NULL, false, NULL),
  (v_quest_id, 46, 'Acts 2:1–13',        NULL, true,  'Power from the Spirit');

  -- CHURCH IGNITED (Days 47-51) — Badge: "Church Ignited"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 47, 'Acts 2:14–47',       NULL, false, NULL),
  (v_quest_id, 48, 'Acts 3:1–26',        NULL, false, NULL),
  (v_quest_id, 49, 'Acts 4:1–31',        NULL, false, NULL),
  (v_quest_id, 50, 'Acts 4:32–5:11',     NULL, false, NULL),
  (v_quest_id, 51, 'Acts 5:12–42',       NULL, true,  'Church Ignited');

  -- THE MISSION EXPANDS (Days 52-60) — Badge: "The Mission Expands"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 52, 'Acts 6:1–15',        NULL, false, NULL),
  (v_quest_id, 53, 'Acts 7:1–60',        NULL, false, NULL),
  (v_quest_id, 54, 'Acts 8:1–25',        NULL, false, NULL),
  (v_quest_id, 55, 'Acts 8:26–40',       NULL, false, NULL),
  (v_quest_id, 56, 'Acts 9:1–31',        NULL, false, NULL),
  (v_quest_id, 57, 'Acts 9:32–43',       NULL, false, NULL),
  (v_quest_id, 58, 'Acts 10:1–48',       NULL, false, NULL),
  (v_quest_id, 59, 'Acts 11:1–30',       NULL, false, NULL),
  (v_quest_id, 60, 'Acts 12:1–25',       NULL, true,  'The Mission Expands');

  -- FIRST MISSION JOURNEY (Days 61-63) — Badge: "First Mission Journey"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 61, 'Acts 13:1–25',       NULL, false, NULL),
  (v_quest_id, 62, 'Acts 13:26–52',      NULL, false, NULL),
  (v_quest_id, 63, 'Acts 14:1–28',       NULL, true,  'First Mission Journey');

  -- THE GOSPEL CLARIFIED (Day 64) — Badge: "The Gospel Clarified"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 64, 'Acts 15:1–35',       NULL, true,  'The Gospel Clarified');

  -- THE GOSPEL CROSSES CULTURES (Days 65-67) — Badge: "The Gospel Crosses Cultures"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 65, 'Acts 15:36–16:40',   NULL, false, NULL),
  (v_quest_id, 66, 'Acts 17:1–34',       NULL, false, NULL),
  (v_quest_id, 67, 'Acts 18:1–22',       NULL, true,  'The Gospel Crosses Cultures');

  -- KINGDOM IMPACT (Days 68-70) — Badge: "Kingdom Impact"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 68, 'Acts 18:23–19:20',   NULL, false, NULL),
  (v_quest_id, 69, 'Acts 19:21–41',      NULL, false, NULL),
  (v_quest_id, 70, 'Acts 20:1–21:16',    NULL, true,  'Kingdom Impact');

  -- STANDING FOR JESUS (Days 71-76) — Badge: "Standing for Jesus"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 71, 'Acts 21:17–36',      NULL, false, NULL),
  (v_quest_id, 72, 'Acts 21:37–22:29',   NULL, false, NULL),
  (v_quest_id, 73, 'Acts 22:30–23:35',   NULL, false, NULL),
  (v_quest_id, 74, 'Acts 24:1–27',       NULL, false, NULL),
  (v_quest_id, 75, 'Acts 25:1–12',       NULL, false, NULL),
  (v_quest_id, 76, 'Acts 25:13–26:32',   NULL, true,  'Standing for Jesus');

  -- THE GOSPEL TO ROME (Days 77-79) — Badge: "The Gospel to the World"
  INSERT INTO public.quest_days (quest_id, day_number, passage_reference, passage_text, is_milestone, milestone_note) VALUES
  (v_quest_id, 77, 'Acts 27:1–44',       NULL, false, NULL),
  (v_quest_id, 78, 'Acts 28:1–16',       NULL, false, NULL),
  (v_quest_id, 79, 'Acts 28:17–31',      NULL, true,  'The Gospel to the World');

END $$;
