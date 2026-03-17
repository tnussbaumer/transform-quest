# Transform Quest — Phase 3 Build Prompt (Quest Engine & Admin)

> **Paste this into Claude Code at the start of your Phase 3 session.**
> Phase 1 (MVP) and Phase 2 (Social/Gamification) are complete and deployed. This phase adds the admin dashboard, quest builder, multi-quest support, journey map, streak freeze, and announcements.

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
find src -type f -name "*.tsx" -o -name "*.ts" | head -80
cat src/App.tsx
cat src/types/database.ts
cat src/hooks/useAuth.ts
cat src/hooks/useQuest.ts
cat src/lib/supabase.ts
```

---

## WHAT EXISTS (DO NOT REBUILD)

Phase 1 + Phase 2 are complete and passing. Key existing pieces:

- **Auth:** Google OAuth + magic link via Supabase, `useAuth` hook with `{ user, session, profile, loading, signOut }`
- **Profiles:** `profiles` table with `role` field (`'youth' | 'leader' | 'admin'`), `onboarding_completed` boolean
- **Quest system:** Single active quest (`quests` + `quest_days` tables), `useQuest` hook
- **Reading flow:** 7-step flow (passage → 3 questions → celebration → friend streaks → done)
- **Completion:** `complete_reading` RPC (atomic insert + streak/XP update)
- **Friends:** Invite codes, accept/decline, `useFriends` hook
- **Nudges:** `send_nudge` RPC, daily limit, `useNudge` hook
- **Badges:** 11 badges seeded, `check_and_award_badges` RPC, profile grid display
- **Celebration:** Confetti, streak count-up, XP fly-up, milestone flair, new badges notification
- **Share:** Web Share API + clipboard fallback
- **Supabase client:** `createClient()` without Database generic — all results explicitly cast at call sites (this is intentional, do NOT change)

---

## PHASE 3 SCOPE — BUILD THESE FEATURES

### 3.1 — SQL Migration: `supabase/migrations/005_phase3_admin.sql`

Create a single migration file that adds everything the admin features need:

**A. `announcements` table** (does NOT exist yet):
```sql
CREATE TABLE announcements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  body            TEXT,
  created_by      UUID REFERENCES profiles(id),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ
);
```

**B. RLS policies for announcements:**
- SELECT: all authenticated users can read active announcements
- INSERT/UPDATE/DELETE: only users where `profiles.role` IN ('leader', 'admin')

**C. RLS policies for quests (add if not already present):**
- INSERT/UPDATE: only users where `profiles.role` IN ('leader', 'admin')
- SELECT: all authenticated (already exists)

**D. RLS policies for quest_days (add if not already present):**
- INSERT/UPDATE/DELETE: only users where `profiles.role` IN ('leader', 'admin')

**E. Leader read-access policies:**
- Leaders/admins can SELECT all rows in `profiles`, `completions`, `friendships`, `nudges`, `user_badges` (for the engagement dashboard)
- Regular youth users' existing policies remain unchanged (own data only)

**F. `streak_freezes_used` table** (for tracking freeze usage):
```sql
CREATE TABLE streak_freezes_used (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id),
  used_on     DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, used_on)
);
```

**G. Update `complete_reading` RPC** (or create a wrapper) to:
- Award +50 XP on milestone days (`quest_days.is_milestone = true`)
- Award +200 XP when all days in a quest are completed (quest completion bonus)
- Auto-award streak freeze: every 7 consecutive streak days, increment `profiles.streak_freezes_available` by 1

**H. `use_streak_freeze` RPC:**
- Called when user opens app and their streak would be broken (last_completed_at was 2+ days ago but they have freezes available)
- Decrements `streak_freezes_available`, inserts into `streak_freezes_used`, keeps streak intact
- Returns `{ freeze_used: true, remaining_freezes: N }` or error if no freezes available

**Important:** This migration must be manually run in the Supabase SQL Editor dashboard. Add a comment at the top of the file reminding Tim of this.

---

### 3.2 — Admin Route Guard & Layout

**File: `src/components/layout/AdminRoute.tsx`**
- Wraps admin routes, checks `profile.role === 'leader' || profile.role === 'admin'`
- If not authorized, redirect to `/` with a brief toast or message
- Reuse the existing `useAuth` hook for role checking

**File: `src/pages/AdminPage.tsx`** (route: `/admin`)
- Full-width layout (no bottom nav — admin is a separate experience)
- Tab navigation at top: **Quests** | **Engagement** | **Announcements**
- Back arrow/link to return to the main app
- Use `tq-surface` cards on `tq-bg` background, same brand system

**Route registration in `App.tsx`:**
```tsx
<Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
```

---

### 3.3 — Quest Builder (Admin Tab 1: "Quests")

**File: `src/components/admin/QuestBuilder.tsx`**

**Quest list view:**
- Show all quests (active and inactive) with title, date range, type, status badge
- "Create New Quest" button (tq-teal CTA)
- Click a quest to edit it

**Quest create/edit form:**
- Fields: title, description, quest_type (dropdown: reading/discipline/event), start_date, end_date, is_active toggle
- Badge name and icon fields (text inputs for now — Clay will enter emoji or icon name)
- On save: upsert to `quests` table

**Daily readings manager (shown below quest form when editing a reading quest):**
- Auto-generate day rows based on start/end date range
- Each row: day number, passage_reference (text input), passage_text (textarea — expandable), is_milestone toggle, milestone_note (text input, shown if is_milestone checked)
- "Auto-fill day numbers" button that populates day_number 1 through N
- Save button that upserts all `quest_days` rows for this quest
- Visual indicator for days that have passage_text filled vs. empty

**Important UX:**
- Warn before deleting a quest that has completions attached
- Show completion count per quest in the list view
- Clay is the primary user of this screen — make it clean and functional, not overly complex

---

### 3.4 — Engagement Dashboard (Admin Tab 2: "Engagement")

**File: `src/components/admin/EngagementDashboard.tsx`**

**Hook: `src/hooks/useAdminStats.ts`**
- Fetches aggregated data for the dashboard (use Supabase queries, not RPCs — keep it simple)

**Dashboard cards (top row):**
- **Active Today:** count of users who completed today's reading
- **Total Users:** count of all profiles
- **Avg Streak:** average `current_streak` across all profiles
- **Completion Rate:** (users completed today / total users) as percentage

**Streak Leaderboard:**
- Table/list: rank, display_name, current_streak, longest_streak, total_xp, last_completed_at
- Sort by current_streak desc by default
- Highlight users who completed today (tq-success dot or checkmark)

**Inactive Users (3+ days):**
- List of users where `last_completed_at` is NULL or older than 3 days
- Show display_name, last_completed_at (or "Never"), days inactive
- "Nudge All Inactive" button (bulk insert nudges — stretch goal, can be a simple button that iterates)

**Per-quest breakdown:**
- For the active quest: show total days, days elapsed, and a breakdown of how many users completed each day (simple bar or number list)

---

### 3.5 — Announcements System (Admin Tab 3: "Announcements")

**File: `src/components/admin/AnnouncementsManager.tsx`**

**List view:**
- All announcements, most recent first
- Show title, created_at, is_active status, expires_at
- Toggle is_active with a switch
- Delete button (with confirmation)

**Create form:**
- Title (text input)
- Body (textarea)
- Expires at (date picker, optional)
- Save → inserts into `announcements` table with `created_by` = current user ID

**Home screen integration:**
- **File: `src/components/home/AnnouncementBanner.tsx`**
- On the Home screen, above the Today's Reading Card, show active non-expired announcements
- Card style: `tq-surface` with left border accent in `tq-purple`, title bold, body below
- Dismissible per-session (use React state, not persistent — keeps it simple)
- Fetch active announcements with: `announcements.is_active = true AND (expires_at IS NULL OR expires_at > NOW())`

---

### 3.6 — Multiple Quest Support

**Update `src/hooks/useQuest.ts`:**
- Support fetching ALL active quests (not just one)
- Determine "today's quest" — the active quest whose date range includes today
- If multiple active quests overlap, pick the one with the earliest start_date (or let Clay manage this)
- Export both `activeQuest` (today's primary) and `allQuests` (for the Quests tab)

**Update `src/pages/QuestsPage.tsx`:**
- Show the active quest card at top (already exists — keep it)
- Below: "Completed Quests" section showing quests where all days are completed or end_date has passed
- Each completed quest card shows: title, date range, badge earned (if any), completion percentage

**New hook: `src/hooks/useQuestHistory.ts`**
- Fetches all quests + user's completions for each
- Computes completion percentage per quest
- Returns `{ activeQuests, completedQuests, loading }`

---

### 3.7 — Journey Map Visualization

**File: `src/components/quest/JourneyMap.tsx`**

This is the visual winding path showing progress through a quest. Show it on the Quests page when user taps into an active quest.

**Design (reference BRAND-GUIDELINES.md §5 and §6):**
- Vertical scrollable path with nodes for each day
- Nodes wind left-right in a gentle S-curve pattern (not a straight vertical line)
- **Completed day:** `tq-success` filled circle with white checkmark icon
- **Today (completed):** `tq-teal` with glow ring + checkmark
- **Today (not completed):** `tq-gold` with pulsing ring animation (`animate-gold-pulse`)
- **Future days:** `tq-surface-2` (#2D3154), dimmed, with `Lock` icon from Lucide
- **Milestone days (every 7):** Larger node (48px vs 36px), star or trophy icon, `tq-purple` accent
- Connecting lines between nodes: 2px, `tq-border` color, with a slight curve/offset for the S-pattern

**Interaction:**
- Tapping a completed day shows a small popover/tooltip with passage reference and "View" link
- Tapping today's node (if not completed) navigates to `/read/:questDayId`
- Future nodes are not tappable

**Auto-scroll:** On mount, scroll to today's node position

**Implementation approach:**
- Use absolute positioning or CSS grid with calculated offsets
- Keep it CSS/HTML — no canvas or SVG library needed
- The S-curve can be achieved with alternating `justify-start` / `justify-end` on each row, with a connecting line element between

---

### 3.8 — Streak Freeze Mechanic

**Hook: `src/hooks/useStreakFreeze.ts`**
- On app load (in the Home page or a top-level effect), check if the user's streak is about to break:
  - `last_completed_at` exists AND is older than yesterday AND `streak_freezes_available > 0`
- If so, show a modal/dialog asking: "You missed yesterday! Use a streak freeze to save your 🔥 X-day streak?"
  - "Use Freeze" button → calls `use_streak_freeze` RPC → updates local profile state
  - "Let it go" button → streak resets on next completion (natural behavior)
- Show current freeze count on the Profile screen near the streak display: "❄️ 2 freezes available"

**Profile screen update:**
- Add streak freeze count display to the stats grid or near the streak number
- Use a snowflake or ice crystal icon (Lucide `Snowflake`)

---

### 3.9 — Quest Milestone Bonus XP

**Update celebration flow:**
- In `CelebrationStep.tsx`, check if today's `quest_day.is_milestone === true`
- If milestone: show extra celebration flair — "🎉 Milestone Reached!" text, bonus "+50 XP" animation, and the `milestone_note` from Clay if present
- If quest is fully complete (last day): show "🏆 Quest Complete!" with "+200 XP" and the quest badge

**Update `calculateXp.ts`:**
- Add milestone and quest completion XP to the calculation (these should come from the server response, not be calculated client-side, since the RPC handles it)
- Actually — the milestone/completion XP should be handled in the `complete_reading` RPC server-side. Client just reads the `xp_earned` from the response and displays it.

---

### 3.10 — Discipline Quest Support (Lightweight)

Discipline quests use the same `quests` + `quest_days` structure but `quest_type = 'discipline'`.

**Differences from reading quests:**
- `passage_reference` becomes the discipline task description (e.g., "Pray for 10 minutes")
- `passage_text` becomes extended instructions or a devotional thought
- The reading flow still works — the 3 reflection questions become:
  1. "What did you do?" (observation)
  2. "What did you learn?" (application) 
  3. "What will you do differently?" (action)
- XP is +30 per completion (instead of +20 base)

**Implementation:**
- In `ReadingFlowPage.tsx` / `PassageStep.tsx`, check `quest.quest_type`
- If `'discipline'`: show the task description instead of "Read the passage", and use the alternate question wording
- If `'event'`: same as discipline for now (Clay can differentiate content in the quest builder)

---

### 3.11 — "Nudge All" for Leaders

**In the Engagement Dashboard:**
- "Nudge All Inactive" button
- On click: fetches all users who haven't completed today, inserts a nudge row for each from the current leader
- Shows count: "Nudged X users"
- Rate limit: once per day per leader (check if leader already nudged-all today)

**Note:** This creates nudge records in the DB. Actual push notification delivery is Phase 3+ / deferred — for now the nudge shows up in the app when the user opens it.

---

## IMPLEMENTATION ORDER

Build in this sequence to minimize dependency issues:

1. **Migration `005_phase3_admin.sql`** — all DB changes first
2. **TypeScript types** — update `src/types/database.ts` with Announcement, StreakFreezeUsed types
3. **Admin route guard** (`AdminRoute.tsx`) + route registration in `App.tsx`
4. **Admin page shell** (`AdminPage.tsx`) with tab navigation
5. **Quest Builder** — list + create/edit form + daily readings manager
6. **Announcements Manager** — CRUD + Home screen banner
7. **Engagement Dashboard** — stats cards + leaderboard + inactive users
8. **Multiple quest support** — update `useQuest`, `QuestsPage`, add `useQuestHistory`
9. **Journey Map** — visual path component on Quests page
10. **Streak Freeze** — hook + modal + profile display
11. **Milestone/completion XP** — update celebration flow
12. **Discipline quest support** — conditional wording in reading flow
13. **Nudge All** — button in engagement dashboard

---

## CRITICAL RULES

1. **Tailwind v3** — we are on Tailwind CSS v3, NOT v4. Do not use v4 syntax.
2. **Supabase client is untyped** — all query results must be explicitly cast using types from `src/types/database.ts`. Do NOT add a generic type parameter to `createClient()`.
3. **Migrations don't auto-run** — add clear comments in the SQL file that it must be manually run in Supabase SQL Editor.
4. **`null !== false`** — when checking booleans from the DB (like `is_milestone`, `is_active`), check for truthiness carefully. Columns defaulting to `null` instead of `false` can silently break logic.
5. **Brand guidelines** — all new UI must follow `docs/BRAND-GUIDELINES.md`. Dark mode only. Use `tq-*` color classes. Nunito font. 16px card radius, 12px button/input radius.
6. **Mobile-first** — max content width 428px, 16px horizontal padding. Touch targets minimum 44×44px.
7. **No breaking changes** — Phase 1 & 2 features must continue working. The daily reading loop is sacred.
8. **Font size 16px minimum on inputs** — prevents iOS auto-zoom.
9. **`npm run build` must pass** — no TypeScript errors, no unused imports that fail strict mode. Verify the build compiles cleanly after each major feature.
10. **File organization** — admin components go in `src/components/admin/`. New hooks go in `src/hooks/`. Follow PascalCase for components, camelCase for utilities.

---

## TESTING CHECKLIST

After building, verify:

- [ ] `npm run build` passes cleanly
- [ ] Non-admin users cannot access `/admin` (redirected)
- [ ] Leader/admin users see the admin dashboard with all 3 tabs
- [ ] Quest builder can create a new quest with daily readings
- [ ] Quest builder can edit an existing quest
- [ ] Engagement dashboard shows accurate stats
- [ ] Announcements appear on the Home screen when active
- [ ] Multiple quests display correctly on the Quests page
- [ ] Journey map renders with correct node states (completed, today, future)
- [ ] Streak freeze modal appears when appropriate
- [ ] Milestone days show bonus XP in celebration
- [ ] Discipline quest shows alternate question wording
- [ ] Existing Phase 1 + 2 features still work (reading flow, friends, nudges, badges, share)

---

## FILES YOU'LL CREATE OR MODIFY

**New files:**
- `supabase/migrations/005_phase3_admin.sql`
- `src/components/layout/AdminRoute.tsx`
- `src/pages/AdminPage.tsx`
- `src/components/admin/QuestBuilder.tsx`
- `src/components/admin/EngagementDashboard.tsx`
- `src/components/admin/AnnouncementsManager.tsx`
- `src/components/home/AnnouncementBanner.tsx`
- `src/components/quest/JourneyMap.tsx`
- `src/hooks/useAdminStats.ts`
- `src/hooks/useQuestHistory.ts`
- `src/hooks/useStreakFreeze.ts`

**Modified files:**
- `src/App.tsx` — add `/admin` route
- `src/types/database.ts` — add Announcement, StreakFreezeUsed types
- `src/hooks/useQuest.ts` — multi-quest support
- `src/pages/QuestsPage.tsx` — completed quests section + journey map entry
- `src/pages/HomePage.tsx` — announcement banner integration
- `src/pages/ProfilePage.tsx` — streak freeze count display
- `src/components/reading/CelebrationStep.tsx` — milestone + quest completion XP
- `src/components/reading/PassageStep.tsx` — discipline quest alternate wording
- `src/components/reading/QuestionStep.tsx` — discipline quest alternate questions

---

*Phase 3 target: Quest Engine & Admin — give Clay the tools to run Transform Quest independently.*
