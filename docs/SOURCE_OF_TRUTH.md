# Transform Quest — Source of Truth

> **This is the living reference document for the project.** Update it whenever the app's state meaningfully changes. Use it to orient any new Claude session, onboard collaborators, or remind yourself where things stand.

*Last updated: March 18, 2026 — Phase 4 complete (Community Feed). Build passing (~542KB JS, 34KB CSS). Deployed on Vercel.*

---

## 1. WHAT THIS APP IS

A gamified daily Bible reading PWA for Transform Church youth (ages 11–18) in Andover, MN. Youth pastor **Clay Knight** uses it to build a daily Bible reading habit tied to his teaching calendar.

**Core daily loop:** Open app → Read today's passage → Answer 3 reflection questions → Earn streak + XP → See progress.

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
`npm run build` → ~530KB JS, 26KB CSS, PWA service worker.

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

### ✅ Phase 3B — Social Discovery, Avatars, Content & Polish (COMPLETE)
`npm run build` → ~546KB JS, 32KB CSS, PWA service worker.

- [x] **Avatar system**: 8 preset emoji avatars on brand-colored gradient backgrounds + custom photo upload (Supabase Storage `avatars` bucket)
- [x] **Avatar component** (`Avatar.tsx`): shared sm/md/lg sizes, brand palette colors, `object-top` crop for photos
- [x] **Onboarding**: 2-step flow (name → avatar picker with skip), step dots indicator, back button
- [x] **Profile page**: Edit Avatar button, XP progress bar showing distance to next level
- [x] **Friend discovery**: replaced invite code entry with "Find Friends" user list + search + "Add" button
- [x] **PassageStep**: encourages physical Bibles with rotating messages + biblegateway.com link. Scripture Summary section shows `passage_text` when available.
- [x] **XP values updated** (Clay's spec): base 25, milestone +100, quest completion +1000, streak XP bonuses
- [x] **Level titles**: Seeker → Explorer → Disciple → Kingdom Builder → Word Warrior → Scripture Master
- [x] **Streak freeze**: rebranded as "The Two-Day Rule"
- [x] **Luke-Acts 90-Day Quest**: 79 reading days + 17 section milestone badges seeded (inactive until launch)
- [x] **25 new badges**: 18 Luke-Acts section badges + 7 new streak milestones
- [x] **Devotional summaries**: 30 Matthew + 79 Luke-Acts passage summaries pre-generated
- [x] **Announcement links**: supports `[text](url)` markdown links + bare URL auto-linking, "Announcements" header
- [x] **`useQuestHistory`**: only fetches `is_active = true` quests (inactive quests hidden from users)
- [x] **Nudge fix**: `already_nudged_today` no longer throws error, UI updates gracefully
- [x] **UI polish pass**: skeleton loading screens, card entrance stagger animations, shimmer effects, bottom nav active indicator (teal pill + bar), character count on reflection questions, Button loading prop, subtle header gradient, polished empty states

### ✅ Phase 4 — Community Feed (COMPLETE)
`npm run build` → ~542KB JS, 34KB CSS, PWA service worker.

- [x] **Community tab**: Renamed Friends → Community with `MessageCircle` icon in bottom nav
- [x] **Segmented control**: "Today's Wall" (default) | "Friends" pill toggle on Community page
- [x] **Friends tab preserved**: All existing friend functionality (discovery, requests, nudge) moved into "Friends" sub-tab
- [x] **Wall posts**: `wall_posts` table with `post_type` ('reflection' | 'thought'), `visibility` ('friends' | 'everyone'), answer sharing flags
- [x] **Wall reactions**: `wall_reactions` table with 4 emoji types (heart, prayer, fire, me_too), toggle behavior, optimistic UI updates
- [x] **Feed RPC** (`get_wall_feed`): Returns posts with joined author profile, answer text from completions, reaction counts, and user's own reactions
- [x] **ComposeModal**: Bottom-sheet for sharing reflections (toggle which answers) or freeform thoughts (280 char limit), visibility selector
- [x] **ShareStep in reading flow**: New step 6 between celebration and friend streaks — share reflections or write a thought, skip always available
- [x] **WallPostCard**: Staggered entrance animation, relative timestamps, visibility indicator (lock/globe), inline delete confirmation, "Show more" for long answers
- [x] **Share XP**: `create_wall_post` RPC awards **+15 XP** for the first share each calendar day (once per day, any post type). Returns `{post_id, xp_earned}` for UI toast
- [x] **Admin moderation**: "Recent Wall Posts" section in Engagement Dashboard — view/delete any post regardless of visibility
- [x] **Re-completion support**: `complete_reading` RPC now updates answers on re-completion instead of throwing (no double XP/streak)
- [x] **Completion detection fix**: `useQuest` checks completion in the same async flow as quest loading (eliminates race condition). Admin dashboard uses `completedTodayUserIds` Set instead of timestamp comparison
- [x] **Route redirect**: `/friends` → `/community` for backwards compatibility
- [x] **Slide-up animation**: New CSS keyframe for bottom-sheet modals

**What is NOT built (Phase 5+):**
- [ ] Push notification delivery (data model ready, delivery deferred)
- [ ] QR code for invite sharing
- [ ] Offline reading / advanced SW caching
- [ ] Group/team system
- [ ] Photo crop/drag tool for avatar uploads

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
   - `supabase/migrations/007_phase3b_social_avatars.sql` — avatar columns, XP/level updates, new badges, updated `complete_reading` + `check_and_award_badges` RPCs
   - `supabase/migrations/008_phase4_community.sql` — wall_posts + wall_reactions tables, RLS, `get_wall_feed` + `toggle_reaction` + `create_wall_post` RPCs
   - `supabase/migrations/009_fix_recompletion.sql` — updated `complete_reading` to allow re-completion (updates answers, no double XP)
   - `supabase/seed.sql` — "Journey Through Matthew" 30-day quest
   - `supabase/seed_badges.sql` — 11 original badge definitions
   - `supabase/seed_summaries_matthew.sql` — 30 devotional summaries for Matthew
   - `supabase/seed_luke_acts.sql` — "Luke-Acts: The Gospel Unleashed" quest + 79 days (run when ready to launch)
   - `supabase/seed_summaries_luke_acts.sql` — 79 devotional summaries for Luke-Acts (run after seed_luke_acts)
3. Create **`avatars` storage bucket**: Dashboard → Storage → New Bucket → name `avatars` (lowercase), public: YES, 2MB limit. Add 4 RLS policies (authenticated SELECT + INSERT/UPDATE/DELETE with `SPLIT_PART(name, '/', 1) = auth.uid()::text`)
4. Enable **Google OAuth**: Dashboard → Authentication → Providers → Google
4. Set **Site URL** and **Redirect URLs** in Auth settings (include `http://localhost:5173` for local dev, and your Vercel URL for prod)
5. Create `.env.local` in the project root (this file is gitignored):
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
│   │   ├── 007_phase3b_social_avatars.sql ← Avatar columns, XP/level updates, new badges, updated RPCs
│   │   ├── 008_phase4_community.sql ← wall_posts, wall_reactions, RLS, feed/reaction/post RPCs
│   │   └── 009_fix_recompletion.sql ← Updated complete_reading for re-completion support
│   ├── seed.sql                     ← "Journey Through Matthew" quest + 30 days
│   ├── seed_badges.sql              ← 11 original badge definitions
│   ├── seed_luke_acts.sql           ← "Luke-Acts: The Gospel Unleashed" quest + 79 days
│   ├── seed_summaries_matthew.sql   ← 30 devotional summaries for Matthew
│   └── seed_summaries_luke_acts.sql ← 79 devotional summaries for Luke-Acts
│
├── src/
│   ├── App.tsx                      ← Router setup (all routes defined here)
│   ├── main.tsx                     ← React root render
│   ├── index.css                    ← Tailwind directives + CSS properties + animations
│   │
│   ├── types/
│   │   └── database.ts              ← All TypeScript interfaces
│   │
│   ├── lib/
│   │   ├── supabase.ts              ← createClient() — untyped, explicit casts at call sites
│   │   ├── calculateXp.ts           ← calculateXp(date) → number
│   │   ├── levelUtils.ts            ← getLevelTitle(xp), xpToNextLevel(xp), formatXp(xp)
│   │   └── streakUtils.ts           ← isCompletedToday(), toLocalDateString(), getCurrentWeekDays()
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx              ← AuthProvider Context + useAuth() hook
│   │   ├── useQuest.ts              ← { quest, questDay, dayNumber, totalDays, isCurrentDayCompleted, loading }
│   │   ├── useCompletion.ts         ← { isCompletedToday, submitCompletion(), submitting } (used by ReadingFlowPage)
│   │   ├── useCommunityFeed.ts      ← { posts, createPost, toggleReaction, deletePost, refetch }
│   │   ├── useProfile.ts            ← { profile, completions[], loading, refetch() }
│   │   ├── useFriends.ts            ← { friends, pendingIncoming, discoverableUsers, sendFriendRequest, ... }
│   │   ├── useNudge.ts              ← { todaysNudges, hasNudgedToday, nudgeFriend }
│   │   ├── useBadges.ts             ← { allBadges, earnedBadges, hasBadge }
│   │   ├── useQuestHistory.ts       ← { activeQuests, completedQuests, completedDayIds, loading, refetch }
│   │   ├── useAdminStats.ts         ← { totalUsers, activeToday, completedTodayUserIds, profiles }
│   │   └── useStreakFreeze.ts        ← { needsFreeze, freezesAvailable, useFreeze, dismiss }
│   │
│   ├── pages/
│   │   ├── AuthPage.tsx             ← /auth — magic link + Google OAuth
│   │   ├── OnboardingPage.tsx       ← /onboarding — 2-step: set display name → choose avatar
│   │   ├── HomePage.tsx             ← / — reading card, streak, stats, announcements, freeze modal
│   │   ├── ReadingFlowPage.tsx      ← /read/:questDayId — 6-8 step flow (includes ShareStep)
│   │   ├── QuestsPage.tsx           ← /quests — active quests + journey map + completed
│   │   ├── CommunityPage.tsx        ← /community — Today's Wall feed + Friends tab
│   │   ├── FriendsPage.tsx          ← /friends — redirects to /community
│   │   ├── ProfilePage.tsx          ← /profile — stats, calendar, badges, freeze count
│   │   └── AdminPage.tsx            ← /admin — quest builder, engagement, announcements
│   │
│   └── components/
│       ├── ui/                      Button, Card, Input, Textarea
│       ├── layout/                  Layout, BottomNav, ProtectedRoute, AdminRoute
│       ├── home/                    TodaysReadingCard, WeeklyStreakBar, QuickStatsRow,
│       │                            FriendActivitySnippet, AnnouncementBanner
│       ├── reading/                 PassageStep, QuestionStep, CelebrationStep,
│       │                            ProgressDots, FriendStreaksStep, ShareButton, ShareStep
│       ├── quest/                   ActiveQuestCard, JourneyMap
│       ├── profile/                 ProfileHeader, StatsGrid, StreakCalendar,
│       │                            BadgesGrid, BadgeCircle, Avatar, AvatarPicker
│       ├── friends/                 FriendCard, FriendsList, PendingRequests
│       ├── community/               WallPostCard, ComposeModal, FriendsTab
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

All tables live in `public` schema. Run migrations 001–009 in order.

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
| `invite_code` | TEXT UNIQUE | 8-char uppercase, auto-generated on signup |
| `onboarding_completed` | BOOLEAN | Default false |
| `created_at` | TIMESTAMPTZ | Join date |

RLS: all authenticated users can SELECT any row. Own-row UPDATE/INSERT only.

### `quests`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `title` | TEXT NOT NULL | e.g. "Journey Through Matthew" |
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
| `passage_reference` | TEXT nullable | e.g. "Matthew 5:1-16" |
| `passage_text` | TEXT nullable | Passage content or challenge details |
| `is_milestone` | BOOLEAN | Default false. Days 7, 14, 21, 30 in seed |
| `milestone_note` | TEXT nullable | Shown on milestone days |

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
| UNIQUE | (user_id, quest_day_id) | One completion per user per quest day (answers updatable via RPC) |

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
| `name` | TEXT NOT NULL | e.g. "Week Warrior" |
| `description` | TEXT nullable | |
| `icon` | TEXT nullable | Emoji |
| `badge_type` | TEXT | `'streak'` \| `'quest'` \| `'monthly'` \| `'special'` |
| `requirement_value` | INT nullable | e.g. 7 for "Week Warrior" |
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

### `wall_posts`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | → `profiles.id` CASCADE |
| `quest_day_id` | UUID FK | → `quest_days.id` CASCADE |
| `post_type` | TEXT | `'reflection'` \| `'thought'` |
| `visibility` | TEXT | `'friends'` \| `'everyone'`, default `'friends'` |
| `share_answer_1/2/3` | BOOLEAN | Which answers to share (reflection posts) |
| `thought_text` | TEXT nullable | Freeform text (thought posts, max 280 chars enforced client-side) |
| `created_at` | TIMESTAMPTZ | Default NOW() |
| CONSTRAINT | valid_post_content | Enforces at least one shared answer OR non-empty thought text |

RLS: Author always sees own posts. `visibility='everyone'` visible to all authenticated. `visibility='friends'` visible to accepted friends only. Leaders/admins can see and delete any post.

### `wall_reactions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `post_id` | UUID FK | → `wall_posts.id` CASCADE |
| `user_id` | UUID FK | → `profiles.id` CASCADE |
| `reaction_type` | TEXT | `'heart'` \| `'prayer'` \| `'fire'` \| `'me_too'` |
| `created_at` | TIMESTAMPTZ | Default NOW() |
| UNIQUE | (post_id, user_id, reaction_type) | One of each type per user per post |

RLS: all authenticated SELECT; own-row INSERT + DELETE.

### SQL Functions / RPCs

| Function | Security | Description |
|----------|----------|-------------|
| `xp_to_level(p_xp)` | — | IMMUTABLE. Maps XP → level title |
| `handle_new_user()` | DEFINER | Trigger on auth.users INSERT. Creates profile + invite_code |
| `generate_invite_code()` | — | Returns random 8-char uppercase string |
| `complete_reading(quest_day_id, answer_1-3, xp_earned)` | DEFINER | Atomic: insert completion + update streak/XP/level + milestone bonus (+100) + quest completion bonus (+1000) + auto-award freeze every 7 days + award badges + update mutual streaks. On re-completion (same day): updates answers only, no double XP/streak. Returns JSON `{new_streak, new_xp, new_level, new_badges, xp_earned, milestone_bonus, quest_complete, freeze_earned}` |
| `check_and_award_badges(user_id)` | DEFINER | Evaluates all badge conditions + awards streak XP bonuses. Returns VOID |
| `send_nudge(to_user_id, quest_day_id)` | DEFINER | Inserts nudge (max 1/day per pair), triggers badge check |
| `update_mutual_streaks(user_id)` | DEFINER | Increments or resets mutual_streak for all accepted friendships |
| `use_streak_freeze()` | DEFINER | Uses one freeze if streak is about to break (2+ day gap). Returns `{freeze_used, remaining_freezes}` |
| `get_wall_feed(quest_day_id)` | DEFINER | Returns JSONB array of wall posts for a quest day with joined author profile, answer text from completions, reaction counts, user's own reactions, and `is_mine` flag. Filters by visibility + friendship |
| `create_wall_post(quest_day_id, post_type, visibility, share_answer_1-3, thought_text)` | DEFINER | Creates wall post. For reflections, verifies completion exists. Awards +15 XP on first share per calendar day. Returns `{post_id, xp_earned}` |
| `toggle_reaction(post_id, reaction_type)` | DEFINER | Adds or removes a reaction (idempotent toggle). Returns `{action, reaction_type}` |

---

## 7. GAMIFICATION RULES

### XP per completion
| Condition | XP |
|-----------|-----|
| Base (always) | +25 |
| Before noon local time ("Early Bird") | +5 |
| Saturday or Sunday ("Weekend") | +10 |
| Milestone day bonus | +100 |
| Quest completion bonus | +1,000 |
| First wall share of the day | +15 |
| **Max possible per day** | **55** (base + share) or **1,155** (milestone + quest completion + share) |

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
- `last_completed_at` was **today** → updates answers only (no XP/streak change)
- `last_completed_at` was **older than yesterday** (or null) → reset to 1
- Every **7 consecutive days** → auto-award 1 streak freeze
- Dates compared in UTC in the RPC; client-side display uses local time

### Streak freeze — "The Two-Day Rule"
- Auto-earned every 7-day streak milestone
- Used when 2+ day gap detected (missed yesterday)
- Sets `last_completed_at` to yesterday, preserving the streak
- One freeze per day max
- UI branding: "Mistakes happen, but don't let it happen twice in a row!"

### Badges (36 total)
**Original (11):** Week Warrior (7d), Two-Week Titan (14d), Monthly Master (30d), Iron Will (60d), Unstoppable (90d), Half-Year Hero (180d), Legendary (365d), First Steps, Friendly, Encourager, Matthew Scholar

**New streak badges (7):** Getting Started (3d), Locked In (14d), Habit Builder (21d), Polishing Your Sword (30d), Halfway Hero (45d), Deep Roots (60d), Final Stretch (75d)

**Luke-Acts section badges (18):** The Investigation Begins, The Story Begins, Ready for the Mission, Following Jesus, On the Road with Jesus, The King Arrives, The Sacrifice, The Risen King, Power from the Spirit, Church Ignited, The Mission Expands, First Mission Journey, The Gospel Clarified, The Gospel Crosses Cultures, Kingdom Impact, Standing for Jesus, The Gospel to the World, The Gospel Unleashed

---

## 8. ROUTES

| Path | Component | Auth | Notes |
|------|-----------|------|-------|
| `/auth` | AuthPage | Public | Magic link + Google OAuth |
| `/onboarding` | OnboardingPage | Protected | 2-step: set display name → choose avatar |
| `/` | HomePage | Protected | Daily reading hub + announcements + freeze modal + admin shield button |
| `/quests` | QuestsPage | Protected | Active quests + journey map + completed quests |
| `/community` | CommunityPage | Protected | Today's Wall feed + Friends tab (segmented control) |
| `/friends` | — | Protected | Redirects to `/community` |
| `/profile` | ProfilePage | Protected | Stats, calendar, badges, freeze count |
| `/read/:questDayId` | ReadingFlowPage | Protected | Full-screen 6-8 step reading flow (includes ShareStep) |
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
- `.animate-slide-up` — bottom-sheet modal entrance
- `.animate-fade-up` — card entrance fade + translate (supports `animationDelay` for stagger)

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

### `.maybeSingle()` for nullable lookups
Any Supabase query that may return 0 rows must use `.maybeSingle()`, not `.single()`. `.single()` returns 406 on no match.

### Profiles RLS
All authenticated users can read any profile row (`profiles_select_authenticated` policy). This is required for invite code lookup and friend streak display.

### Admin access
Leaders/admins see a purple shield icon in the Home page header (next to streak counter) that navigates to `/admin`. `AdminRoute` waits for both `user` and `profile` to be loaded before checking `profile.role`. Without the null-profile guard, a race condition between auth loading and profile fetching caused premature redirect to `/`.

### Seed data — passage text
All 30 days of "Journey Through Matthew" have passage summaries filled in.

### Reading flow — re-completion support
The `complete_reading` RPC allows re-completion on the same day. On re-completion it updates the answers in the existing completion row without re-awarding XP, streak, or badges. The reading flow is 6-8 steps: Passage → Q1 → Q2 → Q3 → Celebrate → ShareStep → FriendStreaks (if friends) → Done.

### Completion detection — `useQuest.isCurrentDayCompleted`
`useQuest` checks for a completion row in the SAME async flow that loads the quest day — no separate hook, no race condition. HomePage and CommunityPage use this directly. Do NOT use `useCompletion.isCompletedToday` for display checks (it still exists for `ReadingFlowPage.submitCompletion()` only). The admin dashboard uses `completedTodayUserIds` (a Set queried from completions for today's quest day) instead of `isCompletedToday(last_completed_at)` timestamp comparison.

### Quest day lookup
`useQuest.ts` determines today's day number by computing the diff in calendar days between `quest.start_date` and today, clamped to 1–totalDays.

### useQuestHistory — joined query
`useQuestHistory` fetches quest_days with an embedded Supabase join: `.select('*, completions(id)')`. RLS on completions ensures only the current user's completions are returned inline. A quest_day is marked completed if `d.completions.length > 0`. This eliminates the need for a separate completions query and prevents ID mismatch issues. The hook also supports `refetch()` and `QuestsPage` triggers refetch via `useLocation().key` on navigation.

### Journey Map — SVG winding path
`JourneyMap.tsx` renders an SVG-based winding S-curve path connecting all quest day nodes. Nodes follow a horizontal pattern (50% → 78% → 50% → 22%, repeating) with 100px vertical spacing. The path uses cubic bezier curves and has a gradient (teal → gold → gray) based on completion progress. Decorative sparkles and glow filters add visual depth. Milestone nodes get a purple glow; today's node gets a gold/teal glow.

### Vercel deployment
`vercel.json` has an SPA rewrite rule (`/(.*) → /index.html`) so client-side routes like `/admin` are served correctly. Without this, direct navigation to non-root paths returns 404.

### PWA service worker caching
`vite-plugin-pwa` with `registerType: 'autoUpdate'` precaches all JS/CSS/HTML. After deploying new code, users may see the old version until the service worker updates (typically on next page load). For immediate updates: hard refresh, clear site data, or use incognito. `runtimeCaching` is empty — API calls to Supabase are NOT cached by the service worker.

---

## 11. WHAT TO DO NEXT (Phase 5+)

1. **Push notifications** — Supabase Edge Functions + Web Push API (data model ready via `push_subscription`)
2. **QR code invite sharing** — generate QR from invite code for easy friend-adding
3. **Offline reading** — advanced service worker caching for offline passage access
4. **Onboarding carousel** — multi-step intro explaining the app
5. **Group/team system** — organize youth into teams for group competitions
6. **Wall post notifications** — notify users when friends react to their posts
7. **Photo crop/drag tool** — for avatar uploads

---

*Reference files: `docs/BRAND-GUIDELINES.md` (visual system) · `docs/TRANSFORM-QUEST-BLUEPRINT.md` (full architecture)*
