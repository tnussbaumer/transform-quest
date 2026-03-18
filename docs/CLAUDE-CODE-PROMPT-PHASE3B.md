# Transform Quest — Phase 3B Build Prompt (Social Discovery, Avatars, Reading Flow Update & Luke–Acts Content)

> **Paste this into Claude Code at the start of your Phase 3B session.**
> Phases 1–3 are complete and deployed. This phase improves the friend system (social discovery instead of invite codes), adds profile pictures/avatars, updates the reading flow to encourage physical Bibles instead of displaying passage text, and integrates Clay's Luke–Acts 90 Day Quest content (badges, XP, streak achievements, streak freeze, titles).

---

## CONTEXT LOADING

Before writing ANY code, read these files in order:

```
cat docs/BRAND-GUIDELINES.md
cat docs/SOURCE_OF_TRUTH.md
cat docs/TRANSFORM-QUEST-BLUEPRINT.md
```

Then scan the current codebase structure:

```
find src -type f -name "*.tsx" -o -name "*.ts" | head -100
cat src/App.tsx
cat src/types/database.ts
cat src/hooks/useAuth.tsx
cat src/hooks/useQuest.ts
cat src/hooks/useFriends.ts
cat src/pages/FriendsPage.tsx
cat src/pages/OnboardingPage.tsx
cat src/pages/ProfilePage.tsx
cat src/components/reading/PassageStep.tsx
cat src/components/reading/CelebrationStep.tsx
cat src/components/profile/ProfileHeader.tsx
```

---

## WHAT EXISTS (DO NOT REBUILD)

Phases 1–3 are complete and passing (`npm run build` → ~530KB JS, 26KB CSS). Key existing pieces:

- **Auth:** Google OAuth + magic link via Supabase, `useAuth` context with `{ user, session, profile, loading, signOut, refreshProfile, patchProfile }`
- **Profiles:** `profiles` table with `role`, `avatar_url`, `invite_code`, `onboarding_completed`, `display_name`
- **Friend system (CURRENT — will be replaced):** Users share their 8-char invite code → other user enters code → friendship created as pending → recipient accepts. `useFriends` hook handles add/accept/decline.
- **Reading flow:** 7-step flow (passage → 3 questions → celebration → friend streaks → done). `PassageStep` currently displays `passage_text` from `quest_days`.
- **Quest system:** Multi-quest support, journey map, admin quest builder, `complete_reading` RPC
- **Badges:** 11 badges seeded, `check_and_award_badges` RPC
- **Admin:** Quest builder, engagement dashboard, announcements manager
- **Streak freeze:** Auto-earned every 7 days, `use_streak_freeze` RPC
- **Supabase client:** `createClient()` without Database generic — all results explicitly cast at call sites (this is intentional, do NOT change)

---

## PHASE 3B SCOPE — BUILD THESE FEATURES

### 3B.1 — SQL Migration: `supabase/migrations/007_phase3b_social_avatars.sql`

Create a single migration file that adds everything Phase 3B needs:

**A. Update the `profiles` table — add avatar fields:**
```sql
-- Add avatar_type column to distinguish between uploaded photos and preset avatars
-- 'preset' = chose from built-in avatar options, 'custom' = uploaded their own image
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_type TEXT CHECK (avatar_type IN ('preset', 'custom')) DEFAULT 'preset';

-- Add avatar_preset column for storing which preset avatar they chose (e.g., 'lion', 'eagle', 'flame', etc.)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_preset TEXT DEFAULT 'default';
```

**B. Create Supabase Storage bucket for profile photos:**
This can't be done in SQL — add a comment block at the top of the migration explaining that Tim needs to manually create a storage bucket in Supabase Dashboard:
```
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
```

**C. Update XP values to match Clay's Luke–Acts spec:**
Clay provided specific XP values that differ from the current system. Update the `complete_reading` RPC to use these values:
```
-- Clay's XP system:
-- Daily reading completion: +25 XP (was +20)
-- Section/milestone completion: +100 XP (was +50)
-- Book completion (e.g., finish Luke or Acts): +300 XP (new — use quest completion for this)
-- Full quest completion: +1000 XP (was +200)
```

Update the `complete_reading()` function to reflect these new XP values:
- Base completion XP: change from +20 to +25 in the RPC logic (NOTE: the `xp_earned` parameter is still passed in from the client, but the MILESTONE and QUEST COMPLETION bonuses are added server-side in the RPC — update those server-side bonuses)
- Milestone bonus: change from +50 to +100
- Quest completion bonus: change from +200 to +1000

Also update `src/lib/calculateXp.ts` on the client side so the base XP matches:
- Base: 25 (was 20)
- Early Bird bonus: +5 (keep)
- Weekend bonus: +10 (keep)

**D. Seed the Luke–Acts badges:**
Insert new badge rows for the Luke–Acts content. These are in ADDITION to the existing 11 badges (don't delete them):

```sql
-- Section badges (quest type, awarded when section's last day is completed)
INSERT INTO badges (name, description, icon, badge_type, requirement_value) VALUES
  ('The Investigation Begins', 'Completed the Prologue of Luke', '🔍', 'quest', NULL),
  ('The Story Begins', 'Completed the Infancy Narrative', '⭐', 'quest', NULL),
  ('Ready for the Mission', 'Completed Luke 3:1–4:15', '🎯', 'quest', NULL),
  ('Following Jesus', 'Completed Jesus'' Ministry in Galilee', '👣', 'quest', NULL),
  ('On the Road with Jesus', 'Completed Luke 9:51–19:27', '🛤️', 'quest', NULL),
  ('The King Arrives', 'Completed Luke 19:28–21:38', '👑', 'quest', NULL),
  ('The Sacrifice', 'Jesus willingly gives His life on the cross for sinners', '✝️', 'quest', NULL),
  ('The Risen King', 'Jesus conquers death and sends His followers to proclaim the gospel', '🌅', 'quest', NULL),
  ('Power from the Spirit', 'Completed Acts 1:1–2:13', '🔥', 'quest', NULL),
  ('Church Ignited', 'Completed Acts 2:14–5:42', '⛪', 'quest', NULL),
  ('The Mission Expands', 'Completed Acts 6–12', '🌍', 'quest', NULL),
  ('First Mission Journey', 'Completed Acts 13–14', '⛵', 'quest', NULL),
  ('The Gospel Clarified', 'Completed Acts 15', '📜', 'quest', NULL),
  ('The Gospel Crosses Cultures', 'Completed Acts 15:36–18:22', '🌏', 'quest', NULL),
  ('Kingdom Impact', 'Completed Acts 18:23–21:16', '💥', 'quest', NULL),
  ('Standing for Jesus', 'Completed Acts 21–26', '🛡️', 'quest', NULL),
  ('The Gospel to the World', 'Completed Acts 27–28', '🗺️', 'quest', NULL),
  ('The Gospel Unleashed', 'Completed the entire Luke–Acts Quest', '🏆', 'quest', NULL);

-- Streak badges from Clay's spec (some overlap with existing — only insert if not already present)
-- Check existing badges first. The new ones from Clay's spec that don't exist yet:
INSERT INTO badges (name, description, icon, badge_type, requirement_value) VALUES
  ('Getting Started', 'You''ve started the habit. Keep it going!', '🌱', 'streak', 3),
  ('Locked In', 'Two full weeks of being consistent', '🔒', 'streak', 14),
  ('Habit Builder', 'Three weeks in — this is becoming part of your daily rhythm', '🧱', 'streak', 21),
  ('Polishing Your Sword', 'A full month in God''s Word', '⚔️', 'streak', 30),
  ('Halfway Hero', 'Halfway through the quest!', '🦸', 'streak', 45),
  ('Deep Roots', 'Two months of daily Bible reading', '🌳', 'streak', 60),
  ('Final Stretch', 'You''re almost at the finish line', '🏁', 'streak', 75)
ON CONFLICT DO NOTHING;
```

Note: Some streak milestones already exist (7, 14, 30, 60, 90). Where Clay's spec overlaps, keep the existing badges. Where Clay has NEW milestones (3, 21, 45, 75), add them. The `check_and_award_badges` RPC already handles streak badges by checking `requirement_value` against `current_streak` — the new badges will be automatically picked up.

**E. Update `check_and_award_badges` RPC** to also handle the streak XP rewards Clay specified:
```
-- Streak XP rewards (awarded alongside the badge):
-- 3-day: +50 XP
-- 7-day: +100 XP
-- 14-day: +150 XP
-- 21-day: +200 XP
-- 30-day: +300 XP
-- 45-day: +400 XP
-- 60-day: +500 XP
-- 75-day: +600 XP
-- 90-day: +1000 XP
```
When awarding a streak badge, also add the corresponding XP bonus to `profiles.total_xp` and recalculate level_title.

**F. Seed the Luke–Acts 90-Day Quest data:**
Create a new seed file: `supabase/seed_luke_acts.sql`

This should insert the quest and all 79 days (note: Clay's outline has 79 reading days across the 90-day quest — some day numbers go up to Day 79 in Acts). Here's the structure:

```sql
-- Insert the Luke-Acts quest
INSERT INTO quests (id, title, description, start_date, end_date, quest_type, badge_name, badge_icon, is_active)
VALUES (
  gen_random_uuid(),
  'Luke–Acts: The Gospel Unleashed',
  'Follow the story from the birth of Jesus to the spread of the gospel across the Roman world. 79 readings over 90 days through Luke and Acts.',
  '2026-04-01',  -- Tim: update this to Clay's actual launch date
  '2026-06-29',  -- 90 days from start
  'reading',
  'The Gospel Unleashed',
  '🏆',
  false  -- Set to true when Clay is ready to launch
);
```

Then insert all 79 `quest_days` rows. For each day, include:
- `day_number` (1–79)
- `passage_reference` (e.g., "Luke 1:1–4")
- `passage_text` — This should contain a SHORT SUMMARY of the passage (2-4 sentences), NOT the full Bible text. Clay wants students to open their own Bibles. The summary is what shows on the celebration/share screen. (Tim: you can fill these in later, or have Clay fill them in via the admin quest builder. For now, leave passage_text as NULL or a placeholder like 'Summary coming soon'.)
- `is_milestone` — true for the LAST day of each section (these trigger section badges)
- `milestone_note` — the section badge name/description

Here are all the days from Clay's outline:

```sql
-- LUKE (Days 1–44)
-- PROLOGUE (Day 1) — Badge: "The Investigation Begins"
(quest_id, 1,  'Luke 1:1–4',         NULL, true,  'The Investigation Begins'),

-- THE STORY BEGINS (Days 2–8) — Badge: "The Story Begins"
(quest_id, 2,  'Luke 1:5–25',        NULL, false, NULL),
(quest_id, 3,  'Luke 1:26–38',       NULL, false, NULL),
(quest_id, 4,  'Luke 1:39–56',       NULL, false, NULL),
(quest_id, 5,  'Luke 1:57–80',       NULL, false, NULL),
(quest_id, 6,  'Luke 2:1–20',        NULL, false, NULL),
(quest_id, 7,  'Luke 2:21–40',       NULL, false, NULL),
(quest_id, 8,  'Luke 2:41–52',       NULL, true,  'The Story Begins'),

-- READY FOR THE MISSION (Days 9–11) — Badge: "Ready for the Mission"
(quest_id, 9,  'Luke 3:1–20',        NULL, false, NULL),
(quest_id, 10, 'Luke 3:21–38',       NULL, false, NULL),
(quest_id, 11, 'Luke 4:1–15',        NULL, true,  'Ready for the Mission'),

-- JESUS' MINISTRY IN GALILEE (Days 12–20) — Badge: "Following Jesus"
(quest_id, 12, 'Luke 4:16–44',       NULL, false, NULL),
(quest_id, 13, 'Luke 5:1–26',        NULL, false, NULL),
(quest_id, 14, 'Luke 5:27–6:11',     NULL, false, NULL),
(quest_id, 15, 'Luke 6:12–49',       NULL, false, NULL),
(quest_id, 16, 'Luke 7:1–35',        NULL, false, NULL),
(quest_id, 17, 'Luke 7:36–8:21',     NULL, false, NULL),
(quest_id, 18, 'Luke 8:22–56',       NULL, false, NULL),
(quest_id, 19, 'Luke 9:1–36',        NULL, false, NULL),
(quest_id, 20, 'Luke 9:37–50',       NULL, true,  'Following Jesus'),

-- ON THE ROAD WITH JESUS (Days 21–34) — Badge: "On the Road with Jesus"
(quest_id, 21, 'Luke 9:51–10:24',    NULL, false, NULL),
(quest_id, 22, 'Luke 10:25–42',      NULL, false, NULL),
(quest_id, 23, 'Luke 11:1–36',       NULL, false, NULL),
(quest_id, 24, 'Luke 11:37–12:12',   NULL, false, NULL),
(quest_id, 25, 'Luke 12:13–48',      NULL, false, NULL),
(quest_id, 26, 'Luke 12:49–13:21',   NULL, false, NULL),
(quest_id, 27, 'Luke 13:22–14:14',   NULL, false, NULL),
(quest_id, 28, 'Luke 14:15–35',      NULL, false, NULL),
(quest_id, 29, 'Luke 15:1–32',       NULL, false, NULL),
(quest_id, 30, 'Luke 16:1–18',       NULL, false, NULL),
(quest_id, 31, 'Luke 16:19–17:19',   NULL, false, NULL),
(quest_id, 32, 'Luke 17:20–18:17',   NULL, false, NULL),
(quest_id, 33, 'Luke 18:18–19:10',   NULL, false, NULL),
(quest_id, 34, 'Luke 19:11–27',      NULL, true,  'On the Road with Jesus'),

-- THE KING ARRIVES (Days 35–38) — Badge: "The King Arrives"
(quest_id, 35, 'Luke 19:28–48',      NULL, false, NULL),
(quest_id, 36, 'Luke 20:1–26',       NULL, false, NULL),
(quest_id, 37, 'Luke 20:27–21:4',    NULL, false, NULL),
(quest_id, 38, 'Luke 21:5–38',       NULL, true,  'The King Arrives'),

-- THE SACRIFICE (Days 39–42) — Badge: "The Sacrifice"
(quest_id, 39, 'Luke 22:1–38',       NULL, false, NULL),
(quest_id, 40, 'Luke 22:39–71',      NULL, false, NULL),
(quest_id, 41, 'Luke 23:1–25',       NULL, false, NULL),
(quest_id, 42, 'Luke 23:26–56',      NULL, true,  'The Sacrifice'),

-- THE RISEN KING (Days 43–44) — Badge: "The Risen King"
(quest_id, 43, 'Luke 24:1–35',       NULL, false, NULL),
(quest_id, 44, 'Luke 24:36–53',      NULL, true,  'The Risen King'),

-- ACTS (Days 45–79)
-- POWER FROM THE SPIRIT (Days 45–46) — Badge: "Power from the Spirit"
(quest_id, 45, 'Acts 1:1–26',        NULL, false, NULL),
(quest_id, 46, 'Acts 2:1–13',        NULL, true,  'Power from the Spirit'),

-- CHURCH IGNITED (Days 47–51) — Badge: "Church Ignited"
(quest_id, 47, 'Acts 2:14–47',       NULL, false, NULL),
(quest_id, 48, 'Acts 3:1–26',        NULL, false, NULL),
(quest_id, 49, 'Acts 4:1–31',        NULL, false, NULL),
(quest_id, 50, 'Acts 4:32–5:11',     NULL, false, NULL),
(quest_id, 51, 'Acts 5:12–42',       NULL, true,  'Church Ignited'),

-- THE MISSION EXPANDS (Days 52–60) — Badge: "The Mission Expands"
(quest_id, 52, 'Acts 6:1–15',        NULL, false, NULL),
(quest_id, 53, 'Acts 7:1–60',        NULL, false, NULL),
(quest_id, 54, 'Acts 8:1–25',        NULL, false, NULL),
(quest_id, 55, 'Acts 8:26–40',       NULL, false, NULL),
(quest_id, 56, 'Acts 9:1–31',        NULL, false, NULL),
(quest_id, 57, 'Acts 9:32–43',       NULL, false, NULL),
(quest_id, 58, 'Acts 10:1–48',       NULL, false, NULL),
(quest_id, 59, 'Acts 11:1–30',       NULL, false, NULL),
(quest_id, 60, 'Acts 12:1–25',       NULL, true,  'The Mission Expands'),

-- FIRST MISSION JOURNEY (Days 61–63) — Badge: "First Mission Journey"
(quest_id, 61, 'Acts 13:1–25',       NULL, false, NULL),
(quest_id, 62, 'Acts 13:26–52',      NULL, false, NULL),
(quest_id, 63, 'Acts 14:1–28',       NULL, true,  'First Mission Journey'),

-- THE GOSPEL CLARIFIED (Day 64) — Badge: "The Gospel Clarified"
(quest_id, 64, 'Acts 15:1–35',       NULL, true,  'The Gospel Clarified'),

-- THE GOSPEL CROSSES CULTURES (Days 65–67) — Badge: "The Gospel Crosses Cultures"
(quest_id, 65, 'Acts 15:36–16:40',   NULL, false, NULL),
(quest_id, 66, 'Acts 17:1–34',       NULL, false, NULL),
(quest_id, 67, 'Acts 18:1–22',       NULL, true,  'The Gospel Crosses Cultures'),

-- KINGDOM IMPACT (Days 68–70) — Badge: "Kingdom Impact"
(quest_id, 68, 'Acts 18:23–19:20',   NULL, false, NULL),
(quest_id, 69, 'Acts 19:21–41',      NULL, false, NULL),
(quest_id, 70, 'Acts 20:1–21:16',    NULL, true,  'Kingdom Impact'),

-- STANDING FOR JESUS (Days 71–76) — Badge: "Standing for Jesus"
(quest_id, 71, 'Acts 21:17–36',      NULL, false, NULL),
(quest_id, 72, 'Acts 21:37–22:29',   NULL, false, NULL),
(quest_id, 73, 'Acts 22:30–23:35',   NULL, false, NULL),
(quest_id, 74, 'Acts 24:1–27',       NULL, false, NULL),
(quest_id, 75, 'Acts 25:1–12',       NULL, false, NULL),
(quest_id, 76, 'Acts 25:13–26:32',   NULL, true,  'Standing for Jesus'),

-- THE GOSPEL TO ROME (Days 77–79) — Badge: "The Gospel to the World"
(quest_id, 77, 'Acts 27:1–44',       NULL, false, NULL),
(quest_id, 78, 'Acts 28:1–16',       NULL, false, NULL),
(quest_id, 79, 'Acts 28:17–31',      NULL, true,  'The Gospel to the World')
```

**Note:** The quest has 79 reading days spread over a 90-day calendar period (students get ~11 rest/catch-up days built in). The `start_date` and `end_date` should span 90 calendar days. The day-number-to-calendar-date mapping is already handled by `useQuest.ts` — it computes today's day number from the date diff.

**Important:** This migration + seed must be manually run in the Supabase SQL Editor dashboard. Add a comment at the top of the file reminding Tim of this.

---

### 3B.2 — Friend Discovery System (Replace Invite Codes)

**Current behavior (REMOVE):** Users must copy an 8-char invite code, share it externally, and the other person types it in. This is clunky for teens.

**New behavior:** When a user taps the Friends tab, they see a list of ALL other Transform Quest users (it's a small youth group, not millions of users) and can send friend requests directly. Think of it like a simplified Instagram "suggested people" — but since everyone is in the same church youth group, just show everyone.

**Changes to `src/pages/FriendsPage.tsx`:**

Replace the "Add Friend" section (invite code input) with a "Find Friends" section:

1. **"Find Friends" section** at the top (or as a tab/toggle alongside "My Friends"):
   - Fetch ALL profiles where `id != currentUser.id`
   - Filter out users who are already friends (accepted) or have a pending request (in either direction)
   - Show remaining users as a scrollable list with: avatar, display_name, level_title
   - Each user card has an "Add Friend" button (tq-teal)
   - Tapping "Add Friend" creates a friendship row with `status: 'pending'`, `user_a: currentUser`, `user_b: targetUser`
   - Button changes to "Requested" (disabled, tq-surface-2) after sending
   - Optional: add a simple search/filter text input at the top to filter by display_name

2. **"Pending Requests" section** (keep existing behavior):
   - Show incoming friend requests with Accept / Decline buttons
   - Show outgoing requests with "Pending" label

3. **"My Friends" section** (keep existing behavior):
   - List of accepted friends with streak info and nudge buttons

**Changes to `src/hooks/useFriends.ts`:**
- Add a function `sendFriendRequest(targetUserId: string)` — inserts into friendships
- Add a query to fetch all profiles for the discovery list
- Keep `acceptFriend` and `declineFriend` as-is
- The `addFriend` function that looked up by invite code can be removed or kept as a fallback (your call — removing simplifies the code)

**RLS consideration:** The `profiles_select_authenticated` policy already allows all authenticated users to read all profiles — this is already in place from migration 005.

**Keep the invite_code column** in profiles — don't drop it. It's harmless and could be useful later (e.g., QR codes). Just remove the UI for entering invite codes.

---

### 3B.3 — Profile Pictures & Avatar System

Students should be able to either upload a profile photo or choose from a set of preset avatars. This makes the app feel more personal and the friend list / celebration screens more engaging.

**Preset avatars (built-in choices):**

Create 8-10 preset avatar options as simple, colorful SVG icons or emoji-style graphics that fit the brand. Suggested presets:
- `lion` — bold, courageous (🦁)
- `eagle` — soaring, free (🦅)
- `flame` — on fire for God (🔥)
- `shield` — defender of faith (🛡️)
- `mountain` — unmovable (⛰️)
- `star` — shining light (⭐)
- `compass` — guided by God (🧭)
- `crown` — royalty in Christ (👑)

**Implementation approach:**
Since these are for teens in a small church app, the simplest approach is to use large emoji rendered on a colored circular background. Each preset has:
- An emoji
- A background gradient/color from the brand palette

**File: `src/components/profile/AvatarPicker.tsx`**
- Grid of 8-10 preset avatar options (large tappable circles, 64px)
- Each shows the emoji on a gradient circle background
- Selected state: tq-teal border glow
- "Upload Photo" option at the end (camera icon + text)
- Upload triggers file input (`accept="image/jpeg,image/png,image/webp"`)
- On file select: resize/compress to max 256x256px on client side (use canvas), upload to Supabase Storage bucket `avatars` at path `{userId}/avatar.{ext}`
- On preset select: update `profiles.avatar_preset` and `profiles.avatar_type` = 'preset', clear `avatar_url`
- On upload success: update `profiles.avatar_url` with the public URL, set `avatar_type` = 'custom'

**File: `src/components/profile/Avatar.tsx`** (shared component)
- Renders the user's avatar everywhere (friend list, profile header, celebration screen, home screen friend snippet, etc.)
- Props: `profile: { avatar_type, avatar_preset, avatar_url, display_name }`, `size: 'sm' | 'md' | 'lg'`
- If `avatar_type === 'custom'` and `avatar_url` is set → show the image in a circle
- If `avatar_type === 'preset'` → show the preset emoji on its gradient background
- Fallback: show initials on `tq-purple` background (current behavior)

**Sizes:**
- `sm`: 32px (inline, friend snippets)
- `md`: 48px (friend list, celebration screen)
- `lg`: 80px (profile header, onboarding)

**Update onboarding flow (`OnboardingPage.tsx`):**
After the student enters their display name, show the `AvatarPicker` as a second step:
- "Choose your avatar" with the preset grid + upload option
- "Skip" button to continue with default (initials)
- On select or skip → complete onboarding as before

**Update all avatar display points:**
Replace any existing initials-based avatar rendering with the new `<Avatar>` component:
- `ProfileHeader.tsx`
- `FriendCard.tsx` / `FriendsList.tsx`
- `FriendActivitySnippet.tsx`
- `FriendStreaksStep.tsx` (in reading flow)
- `EngagementDashboard.tsx` (admin leaderboard)

---

### 3B.4 — Reading Flow: Encourage Physical Bibles (No Passage Text Display)

Clay has decided he'd rather NOT display the full Bible passage text in the app. Instead, the app should encourage students to open their own Bibles. But we KEEP the passage summaries (like we did with Matthew) for the share/celebration screen.

**Changes to `src/components/reading/PassageStep.tsx`:**

Currently this step shows `passage_text` in a scrollable view. Replace it with:

1. **Passage reference** prominently displayed (e.g., "Luke 5:1–26") — large text, tq-text
2. **An encouraging toast/card** instead of the passage text:
   - Show a warm, encouraging message in a styled card. Rotate through a set of messages:
     - "📖 Grab your Bible and turn to today's passage!"
     - "📖 Time to open your Bible! Today's reading is waiting for you."
     - "📖 Your Bible has the best version of this story. Open it up!"
     - "📖 No screen can replace the real thing. Crack open your Bible!"
     - "📖 Let's go! Find today's passage in your Bible and start reading."
     - "📖 God's Word is powerful. Grab your Bible and dive in!"
   - Pick one randomly each time (or cycle through them)
   - Style: `tq-surface` card, centered text, warm and encouraging tone, with the book emoji
   - Below the message: a subtle "Don't have a Bible? Try biblegateway.com" link that opens in a new tab
3. **"I've Read It" button** (tq-teal CTA) — same as the current "Continue" or "Next" button that advances to the question steps

**Keep `passage_text` in the database and quest builder:**
- The `passage_text` field is still used for the **share screen** summary (Step 7 in the reading flow) and for the **celebration screen**
- In the admin quest builder, Clay can still enter passage summaries for each day
- The summaries just don't show up during the reading step anymore — only on share/celebration

**Update share text format:**
The share button text should still include the passage reference and the student's reflection answers, but NOT the passage text itself. Update `ShareButton.tsx` if it currently includes passage_text in the share output. The summary can optionally be included (it's the student-friendly recap, not the full scripture).

---

### 3B.5 — Level Titles Update

Clay provided custom level titles. Update `src/lib/levelUtils.ts` and the `xp_to_level()` SQL function to use these titles (while keeping the XP ranges reasonable for the new XP values):

| Level | Title |
|-------|-------|
| 1 | Seeker |
| 2 | Explorer |
| 3 | Disciple |
| 4 | Kingdom Builder |
| 5 | Word Warrior |
| 6 | Scripture Master |

Adjust the XP thresholds to work with the new XP values (base 25/day instead of 20). Suggested thresholds:
```
0 – 499        → Seeker
500 – 1,999    → Explorer
2,000 – 4,999  → Disciple
5,000 – 9,999  → Kingdom Builder
10,000 – 24,999 → Word Warrior
25,000+         → Scripture Master
```

Update both:
- `src/lib/levelUtils.ts` — `getLevelTitle()`, `xpToNextLevel()`
- SQL function `xp_to_level()` in the migration

---

### 3B.6 — Streak Freeze Update: "The Two-Day Rule"

Clay wants to brand the streak freeze as **"The Two-Day Rule"** with the explanation: "Mistakes happen, but don't let it happen twice in a row!"

**Changes:**
- Update the streak freeze modal text on the Home screen to use this branding
- Update the freeze description on the Profile page
- Clay's spec says: students can miss one day every 14 days without losing their streak. **For now, keep the current mechanic** (auto-earn a freeze every 7 streak days) since it's already built and working. But update the UI copy to use "The Two-Day Rule" name. We can adjust the earn rate later if Clay wants.

---

## IMPLEMENTATION ORDER

Build in this sequence to minimize dependency issues:

1. **Migration `007_phase3b_social_avatars.sql`** — all DB changes (avatar columns, XP updates, badge seeds)
2. **Seed file `supabase/seed_luke_acts.sql`** — Luke–Acts quest + 79 days
3. **TypeScript types** — update `src/types/database.ts` with `avatar_type`, `avatar_preset` fields on Profile
4. **Avatar component** (`Avatar.tsx`) — shared rendering component
5. **Avatar picker** (`AvatarPicker.tsx`) — preset grid + upload
6. **Update onboarding** — add avatar selection step
7. **Update profile page** — avatar picker in settings/edit mode
8. **Friend discovery** — replace invite code UI with user list + "Add Friend"
9. **Update PassageStep** — encouraging toast instead of passage text
10. **Update XP values** — `calculateXp.ts` + migration
11. **Update level titles** — `levelUtils.ts` + migration
12. **Update streak freeze UI copy** — "The Two-Day Rule"
13. **Replace all avatar display points** with `<Avatar>` component
14. **Update ShareButton** — ensure passage text not included in share

---

## CRITICAL RULES

1. **Tailwind v3** — we are on Tailwind CSS v3, NOT v4. Do not use v4 syntax.
2. **Supabase client is untyped** — all query results must be explicitly cast using types from `src/types/database.ts`. Do NOT add a generic type parameter to `createClient()`.
3. **Migrations don't auto-run** — add clear comments in the SQL file that it must be manually run in Supabase SQL Editor.
4. **`null !== false`** — when checking booleans from the DB, check for truthiness carefully.
5. **Brand guidelines** — all new UI must follow `docs/BRAND-GUIDELINES.md`. Dark mode only. Use `tq-*` color classes. Nunito font. 16px card radius, 12px button/input radius.
6. **Mobile-first** — max content width 428px, 16px horizontal padding. Touch targets minimum 44×44px.
7. **No breaking changes** — Phases 1–3 features must continue working. The daily reading loop is sacred.
8. **Font size 16px minimum on inputs** — prevents iOS auto-zoom.
9. **`npm run build` must pass** — no TypeScript errors, no unused imports. Verify build after each major feature.
10. **File organization** — new components in appropriate subdirectories. Follow PascalCase for components, camelCase for utilities.
11. **Image uploads** — compress on client side before uploading. Max 256x256px, max 500KB. Use canvas resizing, not a library.
12. **Existing Matthew quest** — do NOT modify or delete the existing "Journey Through Matthew" quest or its seed data. The Luke–Acts quest is a new, separate quest.

---

## TESTING CHECKLIST

After building, verify:

- [ ] `npm run build` passes cleanly
- [ ] Onboarding flow shows avatar picker after name entry
- [ ] Preset avatars render correctly (emoji on colored circle)
- [ ] Photo upload works (file picker → crop/resize → appears as avatar)
- [ ] Avatar displays correctly in all locations (profile, friends, home snippet, celebration)
- [ ] Friends tab shows "Find Friends" with all users listed
- [ ] Can send friend request from discovery list
- [ ] "Requested" state shows correctly after sending
- [ ] Incoming friend requests still show with Accept/Decline
- [ ] Accepted friends still show with nudge buttons
- [ ] Reading flow shows encouraging toast instead of passage text
- [ ] "biblegateway.com" link works in passage step
- [ ] Share text does not include full passage text
- [ ] XP values updated: base 25, milestone +100, quest completion +1000
- [ ] Level titles updated to Clay's names (Seeker → Scripture Master)
- [ ] Streak freeze modal uses "The Two-Day Rule" branding
- [ ] Luke–Acts seed SQL is valid and can be run in Supabase SQL Editor
- [ ] New badges appear in seed SQL (section badges + new streak milestones)
- [ ] Existing Phase 1–3 features still work (reading flow, admin, quests, journey map, nudges)

---

## FILES YOU'LL CREATE OR MODIFY

**New files:**
- `supabase/migrations/007_phase3b_social_avatars.sql`
- `supabase/seed_luke_acts.sql`
- `src/components/profile/Avatar.tsx`
- `src/components/profile/AvatarPicker.tsx`

**Modified files:**
- `src/types/database.ts` — add `avatar_type`, `avatar_preset` to Profile type
- `src/pages/FriendsPage.tsx` — replace invite code UI with discovery list
- `src/hooks/useFriends.ts` — add `sendFriendRequest()`, fetch all profiles for discovery
- `src/pages/OnboardingPage.tsx` — add avatar selection step
- `src/pages/ProfilePage.tsx` — use Avatar component, add edit avatar option
- `src/components/profile/ProfileHeader.tsx` — use Avatar component
- `src/components/friends/FriendCard.tsx` — use Avatar component
- `src/components/friends/FriendsList.tsx` — use Avatar component
- `src/components/home/FriendActivitySnippet.tsx` — use Avatar component
- `src/components/reading/PassageStep.tsx` — encouraging toast instead of passage text
- `src/components/reading/FriendStreaksStep.tsx` — use Avatar component
- `src/components/reading/ShareButton.tsx` — update share text format
- `src/lib/calculateXp.ts` — base XP from 20 → 25
- `src/lib/levelUtils.ts` — new level titles + thresholds
- `src/components/home/AnnouncementBanner.tsx` — (if needed) no changes expected
- `src/hooks/useStreakFreeze.ts` — update UI copy references
- `src/pages/HomePage.tsx` — update freeze modal copy to "The Two-Day Rule"

---

*Phase 3B target: Make the app feel more personal (avatars), more social (friend discovery), and align with Clay's content vision (physical Bibles, Luke–Acts quest, updated XP/badges/titles).*
