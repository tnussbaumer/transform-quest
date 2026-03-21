# Transform Quest — Source of Truth

> **This is the living reference document for the project.** Update it whenever the app's state meaningfully changes. Use it to orient any new Claude session, onboard collaborators, or remind yourself where things stand.

*Last updated: March 20, 2026 — Phase 5 in progress (Launch Readiness). Build passing (~471KB JS, 36KB CSS). Deployed on Vercel.*

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
| PWA | vite-plugin-pwa | ^1.2.0 (injectManifest mode) |
| Animations | canvas-confetti | ^1.9.4 |
| QR Code | qrcode.react | latest |
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
- [x] Admin dashboard, Quest Builder, Engagement Dashboard, Announcements Manager
- [x] Multi-quest support, Journey Map (SVG winding path)
- [x] Streak freeze ("Two-Day Rule"), discipline/event quest types
- [x] Updated `complete_reading` RPC with milestone/completion bonuses

### ✅ Phase 3B — Social Discovery, Avatars, Content & Polish (COMPLETE)
- [x] Avatar system (8 presets + custom photo upload)
- [x] Friend discovery (user search), XP/level updates, 25 new badges
- [x] Luke-Acts 90-Day Quest (79 reading days + 17 milestone badges)

### ✅ Phase 4 — Community Feed (COMPLETE)
- [x] Community tab with Today's Wall + Friends sub-tabs
- [x] Wall posts (reflections + thoughts), 4 emoji reactions, ComposeModal
- [x] ShareStep in reading flow, share XP (+15/day), admin moderation

### 🔧 Phase 5 — Launch Readiness (IN PROGRESS)
`npm run build` → ~471KB JS, 36KB CSS, custom service worker with push handler.

**Completed:**
- [x] **Push notification client infrastructure**: `subscribeToPush()`, `unsubscribeFromPush()`, VAPID key handling, `savePushSubscription()` → saves to `profiles.push_subscription`
- [x] **Custom service worker** (`src/sw.ts`): Push event listener + notification click handler. Switched from `generateSW` to `injectManifest` mode in vite.config.ts
- [x] **Install detection hook** (`useInstallPrompt.ts`): PWA install detection, `beforeinstallprompt` capture, visit tracking
- [x] **Install banner** (`InstallBanner.tsx`): Platform-specific instructions for iOS Safari, Android Chrome, non-Safari iOS warning
- [x] **Notification prompt** (`NotificationPrompt.tsx`): Shows on Home screen after 2+ completions when running as installed PWA (or Android)
- [x] **Notification settings on Profile**: Toggle + time picker for daily reminders
- [x] **QR code invites** (`QRCodeModal.tsx`): QR code encoding invite URL, share/copy buttons, shown in Community → Friends tab
- [x] **Invite link handler** (`AddFriendPage.tsx`): `/add/:inviteCode` route — auto-sends friend request, handles auth redirect with `returnTo`
- [x] **Invite-code gate** on AuthPage: `VITE_LAUNCH_CODE` env var gates sign-in for controlled rollout
- [x] **Non-Safari iOS warning**: Detects Chrome/Instagram/Facebook in-app browsers on iOS, shows "Open in Safari" prompt
- [x] **Route-level code splitting**: `React.lazy()` for AdminPage, ReadingFlowPage, CommunityPage, QuestsPage, AddFriendPage with brand-styled Suspense fallback
- [x] **Supabase Edge Functions**: `send-push-notification` (RFC 8291 encrypted Web Push) + `daily-reminder-cron` (15-min schedule via pg_cron)
- [x] **Nudge push notifications**: `sendNudgePush()` fires Edge Function after successful nudge
- [x] **Button debouncing**: PendingRequests accept/decline, QuestionStep finish, AddFriendSection add — all use `loading` prop
- [x] **Reaction debouncing**: 400ms guard on WallPostCard reaction buttons
- [x] **Session expiry handling**: `fetchProfile` gracefully handles errors
- [x] **Long content overflow**: Profile display name truncated with `max-w-[280px]`
- [x] **Quest day calculation fixes**: Local date parsing (no UTC mismatch), dynamic totalDays cap (not hardcoded 30)
- [x] **Nudge timezone fix**: `fetchTodaysNudges` uses UTC midnight to match `send_nudge` RPC
- [x] **`complete_reading` RPC fix** (migration 011): Duplicate check changed from calendar-day to per-quest-day. Re-completions update answers without double XP. Streak maintained when completing multiple quest days same day. Fixed `check_and_award_badges` call (PERFORM, not assign — function returns VOID)
- [x] **Error visibility**: Reading flow shows actual RPC error message instead of silently faking success

**Not yet working / in progress:**
- [ ] Push notification delivery (Edge Function deployed but notifications not confirmed arriving on iOS)
- [ ] Daily reminder cron (pg_cron scheduled, Edge Function deployed, not yet tested end-to-end)

**Not built (deferred):**
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
   - `supabase/migrations/009_fix_recompletion.sql` — updated `complete_reading` for re-completion
   - `supabase/migrations/010_completions_friends_read.sql` — RLS policy for friends to see each other's completions
   - `supabase/migrations/011_fix_complete_reading_duplicate_check.sql` — per-quest-day duplicate check, fixed badge call
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
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VITE_LAUNCH_CODE=TRANSFORM2026
```

### Push notification setup
1. Generate VAPID keys: `npx web-push generate-vapid-keys`
2. Add `VITE_VAPID_PUBLIC_KEY` to `.env.local` (client)
3. Add Edge Function secrets in Supabase Dashboard → Edge Functions → Secrets:
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:tim@missionvox.ai`
4. Deploy Edge Functions:
   - `supabase functions deploy send-push-notification --no-verify-jwt`
   - `supabase functions deploy daily-reminder-cron --no-verify-jwt`
5. Set up pg_cron for daily reminders (run in SQL Editor):
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   CREATE EXTENSION IF NOT EXISTS pg_net;
   SELECT cron.schedule('daily-reminder-cron', '*/15 * * * *', $$
     SELECT net.http_post(url := 'YOUR_SUPABASE_URL/functions/v1/daily-reminder-cron',
       headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
       body := '{}'::jsonb);
   $$);
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
│   ├── BRAND-GUIDELINES.md
│   ├── TRANSFORM-QUEST-BLUEPRINT.md
│   ├── CLAUDE-CODE-PROMPT.md through PHASE5.md
│   └── SOURCE_OF_TRUTH.md          ← This file
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_schema.sql through 011_fix_complete_reading_duplicate_check.sql
│   ├── functions/
│   │   ├── send-push-notification/index.ts  ← Edge Function: RFC 8291 Web Push
│   │   └── daily-reminder-cron/index.ts     ← Edge Function: scheduled reminders
│   ├── seed.sql, seed_badges.sql, seed_luke_acts.sql
│   └── seed_summaries_*.sql
│
├── src/
│   ├── App.tsx                      ← Router + React.lazy code splitting + Suspense
│   ├── sw.ts                        ← Custom service worker (push + precache)
│   ├── main.tsx
│   ├── index.css
│   │
│   ├── types/database.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts              ← createClient() — untyped, explicit casts
│   │   ├── pushNotifications.ts     ← subscribe/unsubscribe, VAPID, permission checks
│   │   ├── sendNudgePush.ts         ← Fire-and-forget nudge push via Edge Function
│   │   ├── calculateXp.ts, levelUtils.ts, streakUtils.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx              ← AuthProvider Context
│   │   ├── useQuest.ts              ← Quest day calculation (local date parsing)
│   │   ├── useCompletion.ts
│   │   ├── useInstallPrompt.ts      ← PWA install detection + banner logic
│   │   ├── useCommunityFeed.ts, useProfile.ts, useFriends.ts
│   │   ├── useNudge.ts             ← UTC-based nudge tracking + push trigger
│   │   ├── useBadges.ts, useQuestHistory.ts, useAdminStats.ts, useStreakFreeze.ts
│   │
│   ├── pages/
│   │   ├── AuthPage.tsx             ← Invite-code gate + non-Safari iOS warning + returnTo
│   │   ├── AddFriendPage.tsx        ← /add/:inviteCode handler (lazy-loaded)
│   │   ├── HomePage.tsx             ← + InstallBanner + NotificationPrompt
│   │   ├── ProfilePage.tsx          ← + Notification settings (toggle + time picker)
│   │   ├── ReadingFlowPage.tsx      ← Error display on RPC failure (lazy-loaded)
│   │   ├── CommunityPage.tsx, QuestsPage.tsx, AdminPage.tsx (lazy-loaded)
│   │   ├── OnboardingPage.tsx, FriendsPage.tsx
│   │
│   └── components/
│       ├── ui/                      Button, Card, Input, Textarea
│       ├── layout/                  Layout, BottomNav, ProtectedRoute, AdminRoute
│       ├── home/                    TodaysReadingCard, WeeklyStreakBar, QuickStatsRow,
│       │                            FriendActivitySnippet, AnnouncementBanner,
│       │                            NotificationPrompt, InstallBanner
│       ├── reading/                 PassageStep, QuestionStep, CelebrationStep,
│       │                            ProgressDots, FriendStreaksStep, ShareButton, ShareStep
│       ├── quest/                   ActiveQuestCard, JourneyMap
│       ├── profile/                 ProfileHeader, StatsGrid, StreakCalendar,
│       │                            BadgesGrid, BadgeCircle, Avatar, AvatarPicker
│       ├── friends/                 FriendCard, FriendsList, PendingRequests, AddFriendSection
│       ├── community/               WallPostCard, ComposeModal, FriendsTab, QRCodeModal
│       └── admin/                   QuestBuilder, EngagementDashboard, AnnouncementsManager
│
├── tsconfig.json, tsconfig.app.json, tsconfig.node.json, tsconfig.sw.json
├── vercel.json
├── vite.config.ts                   ← injectManifest mode for custom SW
└── tailwind.config.js
```

---

## 6. DATABASE SCHEMA

All tables live in `public` schema. Run migrations 001–011 in order.

*(Schema tables unchanged from Phase 4 — see profiles, quests, quest_days, completions, friendships, nudges, badges, user_badges, announcements, streak_freezes_used, wall_posts, wall_reactions)*

### SQL Functions / RPCs

| Function | Security | Description |
|----------|----------|-------------|
| `xp_to_level(p_xp)` | — | IMMUTABLE. Maps XP → level title |
| `handle_new_user()` | DEFINER | Trigger on auth.users INSERT. Creates profile + invite_code |
| `generate_invite_code()` | — | Returns random 8-char uppercase string |
| `complete_reading(quest_day_id, answer_1-3, xp_earned)` | DEFINER | Atomic: insert completion + update streak/XP/level. **Per-quest-day duplicate check** (not calendar-day). Re-completion updates answers only (no double XP). Uses `PERFORM check_and_award_badges()` (VOID return). Returns JSON `{new_streak, new_xp, new_level, new_badges, xp_earned, milestone_bonus, quest_complete, freeze_earned}` |
| `check_and_award_badges(user_id)` | DEFINER | Evaluates all badge conditions + awards streak XP bonuses. **Returns VOID** (not JSONB) |
| `send_nudge(to_user_id, quest_day_id)` | DEFINER | Inserts nudge (max 1/day per pair, UTC-based), triggers badge check |
| `update_mutual_streaks(user_id)` | DEFINER | Increments or resets mutual_streak for all accepted friendships |
| `use_streak_freeze()` | DEFINER | Uses one freeze if streak is about to break |
| `get_wall_feed(quest_day_id)` | DEFINER | Returns wall posts with author profile, answers, reactions, visibility filtering |
| `create_wall_post(...)` | DEFINER | Creates wall post. Awards +15 XP on first share per day |
| `toggle_reaction(post_id, reaction_type)` | DEFINER | Adds or removes a reaction |

---

## 7. GAMIFICATION RULES

*(Unchanged from Phase 4 — XP values, level titles, streak logic, badges)*

### Streak logic (server-side in `complete_reading()`)
- Duplicate check is **per quest_day** (not per calendar day)
- Same quest_day re-completion → updates answers only, no XP/streak change
- Different quest_day on same calendar day → keeps current streak (no increment), awards XP
- `last_completed_at` yesterday → streak + 1
- `last_completed_at` older than yesterday → reset to 1
- Every 7 consecutive days → auto-award 1 streak freeze

---

## 8. ROUTES

| Path | Component | Auth | Notes |
|------|-----------|------|-------|
| `/auth` | AuthPage | Public | Magic link + Google + invite-code gate |
| `/add/:inviteCode` | AddFriendPage | Public* | Redirects to auth if not logged in |
| `/onboarding` | OnboardingPage | Protected | 2-step: name → avatar |
| `/` | HomePage | Protected | + InstallBanner + NotificationPrompt |
| `/quests` | QuestsPage | Protected | Lazy-loaded |
| `/community` | CommunityPage | Protected | Lazy-loaded |
| `/friends` | — | Protected | Redirects to `/community` |
| `/profile` | ProfilePage | Protected | + Notification settings |
| `/read/:questDayId` | ReadingFlowPage | Protected | Lazy-loaded |
| `/admin` | AdminPage | Leader/Admin | Lazy-loaded |
| `/*` | — | — | Redirects to `/` |

---

## 9. KEY DESIGN TOKENS

*(Unchanged — see `docs/BRAND-GUIDELINES.md`)*

---

## 10. IMPORTANT TECHNICAL NOTES

### Supabase client
Untyped `createClient()` — all query results explicitly cast at call sites. Do NOT add Database generic.

### useAuth is a React Context
Mounted at top of App.tsx above BrowserRouter. Do NOT revert to plain hook.

### PWA service worker — injectManifest mode
`vite-plugin-pwa` switched from `generateSW` to `injectManifest` in Phase 5. Custom service worker at `src/sw.ts` handles both precaching (via workbox `precacheAndRoute`) and push events. Separate `tsconfig.sw.json` for WebWorker types.

**IMPORTANT:** After deploying, users must close and reopen the PWA (sometimes twice) for the new service worker to activate. This is a common source of "why isn't my fix working" — the old JS is cached.

### Quest day calculation — timezone-safe
`useQuest.ts` parses `start_date` as local date parts (`new Date(year, month-1, day)`) to avoid UTC-vs-local mismatch. The day number is clamped to `1..totalDays` (not hardcoded 30).

### Nudge timezone alignment
`fetchTodaysNudges` uses UTC midnight (`Date.UTC()`) to match the `send_nudge` RPC's `date_trunc('day', NOW() AT TIME ZONE 'UTC')`.

### complete_reading RPC — critical details
- Duplicate check is **per quest_day_id** (not per calendar day). Migration 011.
- `check_and_award_badges()` returns **VOID** (changed in migration 007). Must use `PERFORM`, not assign to variable.
- Badges for the response are queried separately from `user_badges` where `earned_at >= NOW() - 10 seconds`.
- The client now shows actual RPC error messages instead of silently faking success.

### Push notifications
- Client subscribes via `subscribeToPush()` (must be user gesture)
- Subscription saved to `profiles.push_subscription` (JSONB)
- Edge Function `send-push-notification` implements RFC 8291 encryption (ECDH + HKDF + AES-128-GCM)
- Edge Function `daily-reminder-cron` runs every 15 min via pg_cron, sends reminders to users who haven't completed today's reading
- **All users assumed Central Time** for reminder scheduling (v1 simplification)

### Environment variables
```
# Client (.env.local)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_VAPID_PUBLIC_KEY=...
VITE_LAUNCH_CODE=TRANSFORM2026  # empty = no gate

# Supabase Edge Function secrets (set in Dashboard)
VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected
```

---

## 11. KNOWN ISSUES / DEBUGGING

- **Service worker cache**: After deploy, close/reopen PWA twice to get new code. Or clear Safari website data.
- **Push notifications**: Subscription saves to DB but delivery to iOS not yet confirmed. Check Edge Function logs in Supabase Dashboard.
- **`complete_reading` errors**: If you see `22P02 invalid input syntax for type json`, the migration 011 needs to be re-run. Verify with `SELECT prosrc FROM pg_proc WHERE proname = 'complete_reading'` — should contain `PERFORM public.check_and_award_badges` (not `v_new_badges :=`).
- **PostgREST schema cache**: After changing RPC functions, run `NOTIFY pgrst, 'reload schema'` in SQL Editor.

---

*Reference files: `docs/BRAND-GUIDELINES.md` (visual system) · `docs/TRANSFORM-QUEST-BLUEPRINT.md` (full architecture)*
