# Transform Quest — Source of Truth

> **This is the living reference document for the project.** Update it whenever the app's state meaningfully changes. Use it to orient any new Claude session, onboard collaborators, or remind yourself where things stand.

*Last updated: March 17, 2026 — Phase 3B complete. Build passing (~516KB JS, 32KB CSS). Deployed on Vercel.*

---

## 1. WHAT THIS APP IS

A gamified daily Bible reading PWA for Transform Church youth (ages 11–18) in Andover, MN. Youth pastor **Clay Knight** uses it to build a daily Bible reading habit tied to his teaching calendar.

**Core daily loop:** Open app → Open your Bible to today's passage → Answer 3 reflection questions → Earn streak + XP → See progress.

**Inspiration:** Duolingo (dark UI, streaks, XP), modern fitness apps (habit formation).

---

## 2. TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2.0 |
| Language | TypeScript | ~5.9.3 (strict mode) |
| Build | Vite | ^7.3.1 |
| Styling | Tailwind CSS | ^3.4.19 (v3, NOT v4) |
| Backend/DB/Auth | Supabase | ^2.99.0 |
| Routing | React Router | ^7.13.1 |
| Icons | Lucide React | ^0.577.0 |
| PWA | vite-plugin-pwa | ^1.2.0 |
| Animations | canvas-confetti | ^1.9.3 |
| Hosting | Vercel | — |
| Font | Nunito (Google Fonts) | 400/600/700/800/900 |

---

## 3. CURRENT PHASE STATUS

### ✅ Phase 1 — MVP (COMPLETE)
- Project scaffold, Tailwind config, PWA manifest
- Supabase SQL migrations + auth trigger + seed data (all 30 Matthew passages filled in)
- Auth flow (magic link + Google OAuth, protected routes, first-time user auto-redirect)
- Onboarding (set display name on first sign-in)
- App shell (bottom nav, layout, routing)
- Home screen (today's card, weekly streak bar, stats row)
- Reading & reflection flow (writes to Supabase via RPC)
- XP & streak calculation (server-side atomic RPC)
- Profile screen (stats grid, streak calendar, sign out)
- Quests tab (active quest card + progress bar)
- PWA icons (SVG)

### ✅ Phase 2 — Social Layer (COMPLETE)
- [x] Friend system: invite codes, add/accept/decline friends (`useFriends`)
- [x] Nudge system: nudge buttons, `send_nudge` RPC, daily limit (`useNudge`)
- [x] Badge system: 11 badges seeded, `check_and_award_badges` RPC, badges grid on profile
- [x] Share button: Web Share API + clipboard fallback
- [x] Celebration animations: confetti, streak count-up, XP fly-up, milestone flair
- [x] New badges notification on celebration screen
- [x] Reading flow expanded to 7 steps (Friend Streaks + Done screens)
- [x] Friend activity snippet on Home screen
- [x] Mutual streak tracking (`update_mutual_streaks` RPC)
- [x] First-time user auto-redirect to onboarding (`onboarding_completed` flag)

### ✅ Phase 3 — Admin, Quest Engine & Streak Freeze (COMPLETE)
- [x] Admin dashboard at `/admin` (leader/admin role required)
- [x] Admin access via purple shield icon on Home page (visible to leader/admin only)
- [x] Quest Builder: create/edit quests + daily readings with CRUD
- [x] Engagement Dashboard: stat cards, streak leaderboard, inactive users, Nudge All button
- [x] Announcements Manager: full CRUD with active/inactive toggle, edit, delete with confirmation, expiry dates
- [x] Announcement banners on Home screen (dismissible per-session)
- [x] Multi-quest support: `useQuestHistory` hook with joined query (quest_days + embedded completions)
- [x] Journey Map: SVG winding S-curve path with glowing nodes, sparkle decorations, gradient trail, milestone markers
- [x] Streak freeze mechanic: auto-earned every 7 days, `use_streak_freeze` RPC, Home modal
- [x] Discipline/event quest types: alternate questions in `QuestionStep`, alternate headers in `PassageStep`
- [x] Updated `complete_reading` RPC: milestone +50 XP, quest completion +200 XP, auto freeze award
- [x] Leader read-access RLS policies for engagement dashboard
- [x] All passage references visible on journey map for every day (not just milestones)

### ✅ Phase 3B — Social Discovery, Avatars, Content & XP Updates (COMPLETE)
`npm run build` → ~516KB JS, 32KB CSS, PWA service worker.

- [x] **Avatar system**: 8 preset emoji avatars (lion, eagle, flame, shield, mountain, star, compass, crown) on gradient backgrounds + custom photo upload (client-side resize to 256x256 WebP, Supabase Storage)
- [x] **Avatar component** (`Avatar.tsx`): shared sm/md/lg sizes, used across all avatar display points (profile header, friend cards, friend activity snippet, friend streaks step, engagement dashboard leaderboard, pending requests)
- [x] **AvatarPicker component**: preset grid + photo upload, used in onboarding and profile editing
- [x] **Onboarding updated**: 2-step flow (name → avatar picker with skip option)
- [x] **Profile page**: "Edit Avatar" button with inline AvatarPicker
- [x] **Friend discovery**: replaced invite code entry with "Find Friends" discovery list showing all users, search filter, "Add" button → "Requested" state
- [x] **PassageStep updated**: encourages physical Bibles instead of displaying passage text. Shows passage reference prominently + rotating encouraging messages + biblegateway.com link. "I've Read It" CTA button. Discipline/event quests still show passage_text.
- [x] **XP values updated** (Clay's spec): base 25 (was 20), milestone +100 (was +50), quest completion +1000 (was +200)
- [x] **Streak XP bonuses**: awarded alongside streak badges (3-day: +50, 7-day: +100, 14-day: +150, 21-day: +200, 30-day: +300, 45-day: +400, 60-day: +500, 75-day: +600, 90-day: +1000)
- [x] **Level titles updated** (Clay's spec): Seeker → Explorer → Disciple → Kingdom Builder → Word Warrior → Scripture Master
- [x] **Streak freeze rebranded**: "The Two-Day Rule" — "Mistakes happen, but don't let it happen twice in a row!"
- [x] **Luke–Acts 90-Day Quest**: 79 reading days seeded across Luke and Acts, 17 section milestones + 1 quest completion badge
- [x] **25 new badges**: 18 Luke–Acts section badges + 7 new streak milestones (3, 21, 45, 75 days + overlapping 14, 30, 60)
- [x] **Celebration milestone text**: updated to "+100 XP Bonus!" (was +50)
- [x] **`check_and_award_badges` RPC**: now returns VOID (was JSONB), awards streak XP bonuses alongside badges
- [x] **Supabase Storage**: `avatars` bucket (public, 2MB limit, image/jpeg/png/webp) with per-user folder RLS policies

**What is NOT built (Phase 4+):**
- [ ] Push notification delivery (data model ready, delivery deferred)
- [ ] QR code for invite sharing
- [ ] Offline reading / advanced SW caching
- [ ] Onboarding carousel
- [ ] Group/team system

---

## 4. SETUP CHECKLIST (required before the app works)

### One-time Supabase setup
1. Create project at [supabase.com](https://supabase.com)
2. In SQL Editor, run **in order**:
   - `supabase/migrations/001_schema.sql` — tables + RLS + `xp_to_level` + `complete_reading` RPC
   - `supabase/migrations/002_auth_trigger.sql` — on_auth_user_created trigger → `handle_new_user()`
   - `supabase/migrations/003_phase2_social.sql` — friendships, nudges, badges, user_badges + RLS + RPCs + updated `handle_new_user` (invite_code) + updated `complete_reading`
   - `supabase/migrations/004_onboarding_flag.sql` — adds `onboarding_completed` to profiles
   - `supabase/migrations/005_profiles_public_read.sql` — adds `profiles_select_authenticated` RLS policy
   - `supabase/migrations/006_phase3_admin.sql` — announcements + streak_freezes_used tables, leader write/read policies, updated `complete_reading` + `use_streak_freeze` RPC
   - `supabase/migrations/007_phase3b_social_avatars.sql` — avatar columns, updated XP/level functions, new badges, updated `complete_reading` + `check_and_award_badges` RPCs
   - `supabase/seed.sql` — "Journey Through Matthew" quest + 30 days
   - `supabase/seed_badges.sql` — 11 original badge definitions
   - `supabase/seed_luke_acts.sql` — "Luke–Acts: The Gospel Unleashed" quest + 79 days
3. Create **`avatars` storage bucket**: Dashboard → Storage → New Bucket → name "avatars", public: YES, 2MB limit, MIME types: image/jpeg, image/png, image/webp. Add 4 RLS policies (public SELECT, authenticated INSERT/UPDATE/DELETE with `(storage.foldername(name))[1] = auth.uid()::text` or `SPLIT_PART(name, '/', 1) = auth.uid()::text`)
4. Enable **Google OAuth**: Dashboard → Authentication → Providers → Google
5. Set **Site URL** and **Redirect URLs** in Auth settings (include `http://localhost:5173` for local dev, and your Vercel URL for prod)
6. Create `.env.local` in the project root (this file is gitignored):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Run locally
```bash
npm run dev       # dev server at http://localhost:5173
npm run build     # production build (TypeScript check + Vite)
npm run preview   # preview the production build
```

---

## 5. FILE STRUCTURE

```
transform-quest/
├── docs/
│   ├── BRAND-GUIDELINES.md          ← Colors, typography, component specs
│   ├── TRANSFORM-QUEST-BLUEPRINT.md ← Architecture, DB schema, screen specs
│   ├── CLAUDE-CODE-PROMPT.md        ← Phase 1 build instructions
│   ├── CLAUDE-CODE-PROMPT-PHASE2.md ← Phase 2 build instructions
│   ├── CLAUDE-CODE-PROMPT-PHASE3.md ← Phase 3 build instructions
│   ├── CLAUDE-CODE-PROMPT-PHASE3B.md ← Phase 3B build instructions
│   └── SOURCE_OF_TRUTH.md          ← This file
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_schema.sql           ← Tables, RLS, complete_reading() RPC
│   │   ├── 002_auth_trigger.sql     ← Auto-create profile on auth.users INSERT
│   │   ├── 003_phase2_social.sql    ← Social tables + RPCs (friends, nudges, badges)
│   │   ├── 004_onboarding_flag.sql  ← onboarding_completed column
│   │   ├── 005_profiles_public_read.sql ← Authenticated read-all profiles policy
│   │   ├── 006_phase3_admin.sql     ← Admin tables, leader policies, updated RPCs
│   │   └── 007_phase3b_social_avatars.sql ← Avatar columns, XP/level updates, new badges, updated RPCs
│   ├── seed.sql                     ← "Journey Through Matthew" quest + 30 days
│   ├── seed_badges.sql              ← 11 original badge definitions
│   └── seed_luke_acts.sql           ← "Luke–Acts: The Gospel Unleashed" quest + 79 days
│
├── src/
│   ├── App.tsx                      ← Router setup (all routes defined here)
│   ├── main.tsx                     ← React root render
│   ├── index.css                    ← Tailwind directives + CSS properties + animations
│   │
│   ├── types/
│   │   └── database.ts              ← All TypeScript interfaces (Profile includes avatar_type, avatar_preset)
│   │
│   ├── lib/
│   │   ├── supabase.ts              ← createClient() — untyped, explicit casts at call sites
│   │   ├── calculateXp.ts           ← calculateXp(date) → number (base 25 XP)
│   │   ├── levelUtils.ts            ← getLevelTitle(xp), xpToNextLevel(xp), formatXp(xp)
│   │   └── streakUtils.ts           ← isCompletedToday(), toLocalDateString(), getCurrentWeekDays()
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx              ← AuthProvider Context + useAuth() hook
│   │   ├── useQuest.ts              ← { quest, questDay, dayNumber, totalDays, loading }
│   │   ├── useCompletion.ts         ← { isCompletedToday, submitCompletion(), submitting }
│   │   ├── useProfile.ts            ← { profile, completions[], loading, refetch() }
│   │   ├── useFriends.ts            ← { friends, pendingIncoming, discoverableUsers, sendFriendRequest, ... }
│   │   ├── useNudge.ts              ← { todaysNudges, hasNudgedToday, nudgeFriend }
│   │   ├── useBadges.ts             ← { allBadges, earnedBadges, hasBadge }
│   │   ├── useQuestHistory.ts       ← { activeQuests, completedQuests, completedDayIds, loading, refetch }
│   │   ├── useAdminStats.ts         ← { totalUsers, activeToday, avgStreak, profiles }
│   │   └── useStreakFreeze.ts        ← { needsFreeze, freezesAvailable, useFreeze, dismiss }
│   │
│   ├── pages/
│   │   ├── AuthPage.tsx             ← /auth — magic link + Google OAuth
│   │   ├── OnboardingPage.tsx       ← /onboarding — 2-step: set display name → choose avatar
│   │   ├── HomePage.tsx             ← / — reading card, streak, stats, announcements, "Two-Day Rule" freeze modal
│   │   ├── ReadingFlowPage.tsx      ← /read/:questDayId — 5-7 step flow
│   │   ├── QuestsPage.tsx           ← /quests — active quests + journey map + completed
│   │   ├── FriendsPage.tsx          ← /friends — friend discovery list, requests, friend list + nudge
│   │   ├── ProfilePage.tsx          ← /profile — stats, calendar, badges, avatar editing, freeze count
│   │   └── AdminPage.tsx            ← /admin — quest builder, engagement, announcements
│   │
│   └── components/
│       ├── ui/                      Button, Card, Input, Textarea
│       ├── layout/                  Layout, BottomNav, ProtectedRoute, AdminRoute
│       ├── home/                    TodaysReadingCard, WeeklyStreakBar, QuickStatsRow,
│       │                            FriendActivitySnippet, AnnouncementBanner
│       ├── reading/                 PassageStep, QuestionStep, CelebrationStep,
│       │                            ProgressDots, FriendStreaksStep, ShareButton
│       ├── quest/                   ActiveQuestCard, JourneyMap
│       ├── profile/                 ProfileHeader, StatsGrid, StreakCalendar,
│       │                            BadgesGrid, BadgeCircle, Avatar, AvatarPicker
│       ├── friends/                 FriendCard, FriendsList, PendingRequests
│       └── admin/                   QuestBuilder, EngagementDashboard, AnnouncementsManager
│
├── vercel.json                      ← SPA rewrite rule for client-side routing
├── .env.local.example               ← Copy to .env.local and fill in your keys
├── tailwind.config.js               ← Full tq-* color palette + Nunito font
├── vite.config.ts                   ← @vitejs/plugin-react + vite-plugin-pwa
└── index.html                       ← Nunito Google Font link, PWA meta tags
```

---

## 6. DATABASE SCHEMA

All tables live in `public` schema. Run migrations 001–007 in order.

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | References `auth.users(id)` |
| `display_name` | TEXT NOT NULL | Set during onboarding |
| `avatar_url` | TEXT nullable | Public URL for custom uploaded photo |
| `avatar_type` | TEXT | `'preset'` \| `'custom'`, default `'preset'` |
| `avatar_preset` | TEXT | Preset key (e.g. `'lion'`, `'eagle'`), default `'default'` |
| `role` | TEXT | `'youth'` \| `'leader'` \| `'admin'`, default `'youth'` |
| `current_streak` | INT | Updated by `complete_reading()` |
| `longest_streak` | INT | Auto-updated if current exceeds it |
| `total_xp` | INT | Cumulative XP |
| `level_title` | TEXT | Seeker → Explorer → Disciple → Kingdom Builder → Word Warrior → Scripture Master |
| `last_completed_at` | TIMESTAMPTZ | Used for streak logic |
| `streak_freezes_available` | INT | Default 0, auto-awarded every 7-day streak |
| `daily_reminder_time` | TIME | Default 19:00 |
| `push_subscription` | JSONB nullable | For future push notifications |
| `invite_code` | TEXT UNIQUE | 8-char uppercase, auto-generated on signup (kept but UI removed) |
| `onboarding_completed` | BOOLEAN | Default false |
| `created_at` | TIMESTAMPTZ | Join date |

RLS: all authenticated users can SELECT any row. Own-row UPDATE/INSERT only.

### `quests`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `title` | TEXT NOT NULL | e.g. "Journey Through Matthew", "Luke–Acts: The Gospel Unleashed" |
| `description` | TEXT nullable | |
| `start_date` | DATE | |
| `end_date` | DATE | |
| `quest_type` | TEXT | `'reading'` \| `'discipline'` \| `'event'` |
| `created_by` | UUID nullable | References profiles |
| `badge_name` | TEXT nullable | |
| `badge_icon` | TEXT nullable | |
| `is_active` | BOOLEAN | Default true |
| `created_at` | TIMESTAMPTZ | |

RLS: all authenticated SELECT. Leaders/admins can INSERT + UPDATE.

### `quest_days`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Used in `/read/:questDayId` |
| `quest_id` | UUID FK | → `quests.id` CASCADE |
| `day_number` | INT | 1–N, UNIQUE per quest |
| `passage_reference` | TEXT nullable | e.g. "Luke 5:1–26" |
| `passage_text` | TEXT nullable | Passage summary (used on share/celebration screen, NOT shown during reading) |
| `is_milestone` | BOOLEAN | Default false. Section-end days in Luke–Acts quest |
| `milestone_note` | TEXT nullable | Section badge name for milestone days |

RLS: all authenticated SELECT. Leaders/admins can INSERT + UPDATE + DELETE.

### `completions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | → `profiles.id` CASCADE |
| `quest_day_id` | UUID FK | → `quest_days.id` |
| `answer_1/2/3` | TEXT NOT NULL | Reflection answers |
| `xp_earned` | INT NOT NULL | Total XP including bonuses |
| `completed_at` | TIMESTAMPTZ | Default NOW() |
| UNIQUE | (user_id, quest_day_id) | Prevents re-submission |

RLS: own-row SELECT + INSERT. Leaders/admins can also SELECT all.

### `friendships`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_a` | UUID FK | Initiator → `profiles.id` CASCADE |
| `user_b` | UUID FK | Recipient → `profiles.id` CASCADE |
| `mutual_streak` | INT | Default 0 |
| `status` | TEXT | `'pending'` \| `'accepted'` |
| `created_at` | TIMESTAMPTZ | |
| UNIQUE | (user_a, user_b) | |

RLS: both parties + leaders can SELECT; user_a inserts; user_b updates; either deletes.

### `nudges`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `from_user` | UUID FK | → `profiles.id` CASCADE |
| `to_user` | UUID FK | → `profiles.id` CASCADE |
| `quest_day_id` | UUID FK | → `quest_days.id` CASCADE |
| `nudged_at` | TIMESTAMPTZ | Default NOW() |

RLS: sender + receiver + leaders can SELECT; sender can INSERT.

### `badges`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `name` | TEXT NOT NULL | e.g. "Week Warrior", "The Investigation Begins" |
| `description` | TEXT nullable | |
| `icon` | TEXT nullable | Emoji |
| `badge_type` | TEXT | `'streak'` \| `'quest'` \| `'monthly'` \| `'special'` |
| `requirement_value` | INT nullable | e.g. 7 for "Week Warrior", NULL for quest badges |
| `created_at` | TIMESTAMPTZ | |

RLS: all authenticated SELECT.

### `user_badges`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | → `profiles.id` CASCADE |
| `badge_id` | UUID FK | → `badges.id` CASCADE |
| `earned_at` | TIMESTAMPTZ | Default NOW() |
| UNIQUE | (user_id, badge_id) | |

RLS: own-row + leaders can SELECT; INSERT only via `check_and_award_badges` SECURITY DEFINER.

### `announcements`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `title` | TEXT NOT NULL | |
| `body` | TEXT nullable | |
| `created_by` | UUID FK | → `profiles.id` |
| `is_active` | BOOLEAN | Default true |
| `created_at` | TIMESTAMPTZ | |
| `expires_at` | TIMESTAMPTZ nullable | Auto-hidden after this date |

RLS: all authenticated SELECT; leaders/admins INSERT + UPDATE + DELETE.

### `streak_freezes_used`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | → `profiles.id` CASCADE |
| `used_on` | DATE NOT NULL | |
| `created_at` | TIMESTAMPTZ | |
| UNIQUE | (user_id, used_on) | |

RLS: own-row SELECT; INSERT only via `use_streak_freeze` SECURITY DEFINER.

### SQL Functions / RPCs

| Function | Security | Description |
|----------|----------|-------------|
| `xp_to_level(p_xp)` | — | IMMUTABLE. Maps XP → level title (Seeker/Explorer/Disciple/Kingdom Builder/Word Warrior/Scripture Master) |
| `handle_new_user()` | DEFINER | Trigger on auth.users INSERT. Creates profile + invite_code |
| `generate_invite_code()` | — | Returns random 8-char uppercase string |
| `complete_reading(quest_day_id, answer_1-3, xp_earned)` | DEFINER | Atomic: insert completion + update streak/XP/level + milestone bonus (+100) + quest completion bonus (+1000) + auto-award freeze every 7 days + award badges + update mutual streaks. Returns JSONB `{new_streak, new_xp, new_level, new_badges, xp_earned, milestone_bonus, quest_complete, freeze_earned}` |
| `check_and_award_badges(user_id)` | DEFINER | Evaluates all badge conditions, awards streak XP bonuses (3-day: +50 through 365-day: +3000). Returns VOID |
| `send_nudge(to_user_id, quest_day_id)` | DEFINER | Inserts nudge (max 1/day per pair), triggers badge check |
| `update_mutual_streaks(user_id)` | DEFINER | Increments or resets mutual_streak for all accepted friendships |
| `use_streak_freeze()` | DEFINER | Uses one freeze if streak is about to break (2+ day gap). Returns `{freeze_used, remaining_freezes}` |

---

## 7. GAMIFICATION RULES

### XP per completion
| Condition | XP |
|-----------|-----|
| Base (always) | +25 |
| Before noon local time ("Early Bird") | +5 |
| Saturday or Sunday ("Weekend") | +10 |
| Milestone day bonus | +100 |
| Quest completion bonus | +1000 |
| **Max possible per day** | **40** (base) or **1,140** (milestone + quest completion) |

### Streak XP bonuses (awarded with streak badges)
| Streak | Bonus XP |
|--------|----------|
| 3 days | +50 |
| 7 days | +100 |
| 14 days | +150 |
| 21 days | +200 |
| 30 days | +300 |
| 45 days | +400 |
| 60 days | +500 |
| 75 days | +600 |
| 90 days | +1,000 |
| 180 days | +1,500 |
| 365 days | +3,000 |

### Level titles
| XP Range | Title |
|----------|-------|
| 0 – 499 | Seeker |
| 500 – 1,999 | Explorer |
| 2,000 – 4,999 | Disciple |
| 5,000 – 9,999 | Kingdom Builder |
| 10,000 – 24,999 | Word Warrior |
| 25,000+ | Scripture Master |

### Streak logic (server-side in `complete_reading()`)
- `last_completed_at` was **yesterday** → `current_streak + 1`
- `last_completed_at` was **today** → error: already completed
- `last_completed_at` was **older than yesterday** (or null) → reset to 1
- Every **7 consecutive days** → auto-award 1 streak freeze
- Dates compared in UTC in the RPC; client-side display uses local time

### Streak freeze — "The Two-Day Rule"
- Auto-earned every 7-day streak milestone
- Used when 2+ day gap detected (missed yesterday)
- Sets `last_completed_at` to yesterday, preserving the streak
- One freeze per day max
- UI branding: "Mistakes happen, but don't let it happen twice in a row!"

### Badges (36 total: 11 original + 18 Luke–Acts section + 7 new streak)

**Original badges (seeded in `seed_badges.sql`):**
| Name | Type | Requirement |
|------|------|-------------|
| Week Warrior | streak | 7 days |
| Two-Week Titan | streak | 14 days |
| Monthly Master | streak | 30 days |
| Iron Will | streak | 60 days |
| Unstoppable | streak | 90 days |
| Half-Year Hero | streak | 180 days |
| Legendary | streak | 365 days |
| First Steps | special | 1 completion |
| Friendly | special | 1 accepted friendship |
| Encourager | special | 1 nudge sent |
| Matthew Scholar | quest | Complete "Journey Through Matthew" |

**New streak badges (seeded in migration 007):**
| Name | Type | Requirement |
|------|------|-------------|
| Getting Started | streak | 3 days |
| Locked In | streak | 14 days |
| Habit Builder | streak | 21 days |
| Polishing Your Sword | streak | 30 days |
| Halfway Hero | streak | 45 days |
| Deep Roots | streak | 60 days |
| Final Stretch | streak | 75 days |

**Luke–Acts section badges (seeded in migration 007):**
The Investigation Begins, The Story Begins, Ready for the Mission, Following Jesus, On the Road with Jesus, The King Arrives, The Sacrifice, The Risen King, Power from the Spirit, Church Ignited, The Mission Expands, First Mission Journey, The Gospel Clarified, The Gospel Crosses Cultures, Kingdom Impact, Standing for Jesus, The Gospel to the World, The Gospel Unleashed (quest completion)

---

## 8. ROUTES

| Path | Component | Auth | Notes |
|------|-----------|------|-------|
| `/auth` | AuthPage | Public | Magic link + Google OAuth |
| `/onboarding` | OnboardingPage | Protected | 2-step: set display name → choose avatar |
| `/` | HomePage | Protected | Daily reading hub + announcements + "Two-Day Rule" freeze modal + admin shield |
| `/quests` | QuestsPage | Protected | Active quests + journey map + completed quests |
| `/friends` | FriendsPage | Protected | Friend discovery list, requests, friend list + nudge |
| `/profile` | ProfilePage | Protected | Stats, calendar, badges, avatar editing, freeze count |
| `/read/:questDayId` | ReadingFlowPage | Protected | Full-screen 5-7 step reading flow |
| `/admin` | AdminPage | Leader/Admin | Quest builder, engagement, announcements |
| `/*` | — | — | Redirects to `/` |

---

## 9. KEY DESIGN TOKENS

Always reference `docs/BRAND-GUIDELINES.md` for the full system. Quick cheat sheet:

```
Background:      bg-tq-bg        (#1A1D2E)
Cards/inputs:    bg-tq-surface   (#232740)
Hover surfaces:  bg-tq-surface-2 (#2D3154)
Primary CTA:     bg-tq-teal      (#00C9A7)  — dark text on bright bg
XP / fire:       text-tq-gold    (#FFB830)
Quests / levels: text-tq-purple  (#8B5CF6)
Completed:       text-tq-success (#34D399)
Body text:       text-tq-text    (#F1F5F9)
Secondary text:  text-tq-text-sec (#94A3B8)
Disabled:        text-tq-text-muted (#64748B)
Borders:         border-tq-border (#334155)
```

**Gradient classes** (defined in `src/index.css`):
- `.gradient-fire` — fire icon backgrounds (gold → orange → red)
- `.gradient-quest` — progress bars (purple → teal)
- `.gradient-xp` — XP popups (gold → gold-light)

**Glow classes** (defined in `src/index.css`):
- `.glow-teal`, `.glow-gold`, `.glow-purple`

**Animation classes:**
- `.animate-fire-pulse` — subtle scale pulse on flame icons
- `.animate-gold-pulse` — pulsing ring on today's unfinished streak circle
- `.animate-xp-flyup` — XP earned fly-up and fade
- `.animate-streak-bounce` — streak count-up bounce

**Typography:** Nunito. Key sizes: 48px/900 (display/streak count) · 28px/800 (H1) · 16px/400 (body, inputs) · 12px min.

**Border radii:** `rounded-2xl` (16px) for cards · `rounded-xl` (12px) for buttons/inputs · `rounded-full` for circles.

---

## 10. IMPORTANT TECHNICAL NOTES

### Supabase client
The client in `src/lib/supabase.ts` uses `createClient()` **without** a Database generic type. **All query results are explicitly cast** at each call site using types from `database.ts`. This is intentional — do not add the generic back without first generating types via the Supabase CLI.

### useAuth is a React Context
`AuthProvider` lives in `src/hooks/useAuth.tsx` and is mounted at the top of `App.tsx` above `<BrowserRouter>`. All components share one auth state instance. Do NOT revert to a plain hook — independent state per component caused onboarding redirect loops.

Key exports: `user, session, profile, loading, isNewUser, signOut, refreshProfile, patchProfile`
- `patchProfile(updates)` — synchronously merges partial updates into in-memory profile state (no DB call). Used by OnboardingPage before `navigate()` to avoid stale-state redirect loops.
- `refreshProfile()` — re-fetches profile from DB and updates state.

### Onboarding detection
`ProtectedRoute` reads `profile.onboarding_completed` directly from the shared context profile object. `OnboardingPage` calls `patchProfile({ onboarding_completed: true })` before navigating to `/`.

### Onboarding flow — 2-step
Step 1: enter display name. Step 2: choose preset avatar or upload photo (with "Skip" option). On finish, updates `display_name`, `onboarding_completed`, `avatar_type`, `avatar_preset`, and optionally `avatar_url` in one DB call.

### Avatar system
- **Preset avatars**: 8 options (lion, eagle, flame, shield, mountain, star, compass, crown) rendered as emoji on gradient circle backgrounds via `PRESET_AVATARS` in `Avatar.tsx`
- **Custom photos**: uploaded to Supabase Storage `avatars` bucket at `{userId}/avatar.webp`, client-side resized to max 256x256 using canvas, converted to WebP
- **`Avatar` component**: shared across all display points, supports `sm` (32px), `md` (48px), `lg` (80px) sizes. Falls back to initials on purple background when no avatar is set.
- **`AvatarPicker` component**: used in onboarding (step 2) and profile page (edit mode)

### `.maybeSingle()` for nullable lookups
Any Supabase query that may return 0 rows must use `.maybeSingle()`, not `.single()`. `.single()` returns 406 on no match.

### Profiles RLS
All authenticated users can read any profile row (`profiles_select_authenticated` policy). This is required for friend discovery and friend streak display.

### Friend discovery (Phase 3B)
Replaced invite code entry UI with a discovery list. `useFriends` fetches all profiles, filters out self and anyone already connected (friend or pending), and exposes `discoverableUsers` array. FriendsPage shows a searchable list with "Add" button → creates pending friendship. The `invite_code` column is kept in the DB but the UI for entering codes has been removed (replaced by `AddFriendSection` → discovery list in `FriendsPage`).

### Admin access
Leaders/admins see a purple shield icon in the Home page header (next to streak counter) that navigates to `/admin`. `AdminRoute` waits for both `user` and `profile` to be loaded before checking `profile.role`. Without the null-profile guard, a race condition between auth loading and profile fetching caused premature redirect to `/`.

### Seed data — passage text
All 30 days of "Journey Through Matthew" have passage summaries filled in. Luke–Acts quest has 79 days with passage references but `passage_text` set to NULL (Clay can fill these in via admin quest builder). Passage text is used for share/celebration screens only — the reading step encourages opening a physical Bible.

### PassageStep — physical Bible encouragement
For reading quests, `PassageStep` shows the passage reference prominently and an encouraging message card (rotated from 6 options) instead of displaying passage text. Includes a biblegateway.com fallback link. Button says "I've Read It". Discipline/event quests still display `passage_text` in-step.

### Reading flow — "already completed" guard
The `complete_reading` RPC throws if the user already completed today. `ReadingFlowPage` catches this (with `console.error` logging) and still shows the celebration screen.

### Quest day lookup
`useQuest.ts` determines today's day number by computing the diff in calendar days between `quest.start_date` and today, clamped to 1–totalDays.

### useQuestHistory — joined query
`useQuestHistory` fetches quest_days with an embedded Supabase join: `.select('*, completions(id)')`. RLS on completions ensures only the current user's completions are returned inline. A quest_day is marked completed if `d.completions.length > 0`. This eliminates the need for a separate completions query and prevents ID mismatch issues. The hook also supports `refetch()` and `QuestsPage` triggers refetch via `useLocation().key` on navigation.

### Journey Map — SVG winding path
`JourneyMap.tsx` renders an SVG-based winding S-curve path connecting all quest day nodes. Nodes follow a horizontal pattern (50% → 78% → 50% → 22%, repeating) with 100px vertical spacing. The path uses cubic bezier curves and has a gradient (teal → gold → gray) based on completion progress. Decorative sparkles and glow filters add visual depth. Milestone nodes get a purple glow; today's node gets a gold/teal glow.

### XP and level system (Phase 3B updates)
- Base XP: 25 (was 20). Early bird +5, weekend +10 unchanged.
- Milestone bonus: +100 XP (was +50). Quest completion: +1000 XP (was +200).
- Streak badges also award XP bonuses (see §7 table).
- `check_and_award_badges` now returns VOID (was JSONB) — badge detection for celebration screen uses a time-window query in `complete_reading` instead.

### Luke–Acts quest
79 reading days across 90 calendar days (students get ~11 rest/catch-up days). 17 section milestones trigger section badges. Quest completion triggers "The Gospel Unleashed" badge. Quest seeded as `is_active = false` — set to `true` when Clay is ready to launch.

### Vercel deployment
`vercel.json` has an SPA rewrite rule (`/(.*) → /index.html`) so client-side routes like `/admin` are served correctly. Without this, direct navigation to non-root paths returns 404.

### PWA service worker caching
`vite-plugin-pwa` with `registerType: 'autoUpdate'` precaches all JS/CSS/HTML. After deploying new code, users may see the old version until the service worker updates (typically on next page load). For immediate updates: hard refresh, clear site data, or use incognito. `runtimeCaching` is empty — API calls to Supabase are NOT cached by the service worker.

### SQL migration 007 — DROP before CREATE
`complete_reading` and `check_and_award_badges` had their return types changed in migration 007. PostgreSQL requires `DROP FUNCTION` before `CREATE OR REPLACE` when the return type changes. The migration includes `DROP FUNCTION IF EXISTS` statements for both.

---

## 11. WHAT TO DO NEXT (Phase 4+)

1. **Push notifications** — Supabase Edge Functions + Web Push API (data model ready via `push_subscription`)
2. **QR code invite sharing** — generate QR from invite code for easy friend-adding
3. **Offline reading** — advanced service worker caching for offline passage access
4. **Onboarding carousel** — multi-step intro explaining the app
5. **Group/team system** — organize youth into teams for group competitions

---

*Reference files: `docs/BRAND-GUIDELINES.md` (visual system) · `docs/TRANSFORM-QUEST-BLUEPRINT.md` (full architecture)*
