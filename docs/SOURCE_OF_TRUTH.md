# Transform Quest — Source of Truth

> **This is the living reference document for the project.** Update it whenever the app's state meaningfully changes. Use it to orient any new Claude session, onboard collaborators, or remind yourself where things stand.

*Last updated: March 9, 2026 — Phase 2 complete, build passing (469KB JS). Awaiting Supabase project setup + migration 003.*

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
| Hosting | Vercel (planned) | — |
| Font | Nunito (Google Fonts) | 400/600/700/800/900 |

---

## 3. CURRENT PHASE STATUS

### ✅ Phase 1 — MVP (COMPLETE)
- Project scaffold, Tailwind config, PWA manifest
- Supabase SQL migrations + auth trigger + seed data (all 30 Matthew passages now filled in)
- Auth flow (magic link + Google OAuth, protected routes, first-time user auto-redirect)
- Onboarding (set display name on first sign-in)
- App shell (bottom nav, layout, routing)
- Home screen (today's card, weekly streak bar, stats row, friend activity snippet)
- Reading & reflection flow (writes to Supabase via RPC)
- XP & streak calculation (server-side atomic RPC)
- Profile screen (stats grid, streak calendar, badges grid, sign out)
- Quests tab (active quest card + progress bar)
- PWA icons (SVG)

### ✅ Phase 2 — Social Layer (COMPLETE, build passing)
`npm run build` → 469KB JS, 21KB CSS, PWA service worker.

**What is fully built:**
- [x] Friend system: invite codes, add/accept/decline friends (`useFriends`)
- [x] Nudge system: nudge buttons, `send_nudge` RPC, daily limit (`useNudge`)
- [x] Badge system: 11 badges seeded, `check_and_award_badges` RPC, badges grid on profile
- [x] Share button: Web Share API + clipboard fallback
- [x] Celebration animations: confetti, streak count-up, XP fly-up, milestone flair
- [x] New badges notification on celebration screen
- [x] Reading flow expanded to 7 steps (Friend Streaks + Done screens)
- [x] Friend activity snippet on Home screen
- [x] Mutual streak tracking (`update_mutual_streaks` RPC)
- [x] First-time user auto-redirect to onboarding

**What is NOT built (Phase 3+):**
- [ ] Push notification delivery (data model ready, delivery deferred)
- [ ] Admin dashboard / quest builder
- [ ] Multiple quest support / journey map visualization
- [ ] Discipline/event quest types
- [ ] Streak freeze mechanic
- [ ] Announcements system
- [ ] QR code for invite sharing
- [ ] Offline reading / advanced SW caching
- [ ] Onboarding carousel
- [ ] Streak freeze mechanic

---

## 4. SETUP CHECKLIST (required before the app works)

### One-time Supabase setup
1. Create project at [supabase.com](https://supabase.com)
2. In SQL Editor, run **in order**:
   - `supabase/migrations/001_schema.sql` — tables + RLS + `complete_reading` RPC
   - `supabase/migrations/002_auth_trigger.sql` — auto-creates profile on sign-up
   - `supabase/seed.sql` — "Journey Through Matthew" 30-day quest
3. Enable **Google OAuth**: Dashboard → Authentication → Providers → Google
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
│   ├── BRAND-GUIDELINES.md        ← Colors, typography, component specs (READ THIS FIRST)
│   ├── TRANSFORM-QUEST-BLUEPRINT.md ← Architecture, DB schema, screen specs, gamification rules
│   ├── CLAUDE-CODE-PROMPT.md      ← Phase 1 build instructions
│   └── SOURCE_OF_TRUTH.md         ← This file
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_schema.sql         ← Tables, RLS, complete_reading() RPC
│   │   └── 002_auth_trigger.sql   ← Auto-create profile on auth.users INSERT
│   └── seed.sql                   ← "Journey Through Matthew" quest + 30 days
│
├── src/
│   ├── App.tsx                    ← Router setup (all routes defined here)
│   ├── main.tsx                   ← React root render
│   ├── index.css                  ← Tailwind directives + CSS custom properties + utility classes
│   │
│   ├── types/
│   │   └── database.ts            ← TypeScript interfaces: Profile, Quest, QuestDay, Completion, etc.
│   │
│   ├── lib/
│   │   ├── supabase.ts            ← createClient() — untyped, explicit casts at call sites
│   │   ├── calculateXp.ts         ← calculateXp(date) → number (base 20 + early bird + weekend)
│   │   ├── levelUtils.ts          ← getLevelTitle(xp), xpToNextLevel(xp), formatXp(xp)
│   │   └── streakUtils.ts         ← isCompletedToday(), toLocalDateString(), getCurrentWeekDays()
│   │
│   ├── hooks/
│   │   ├── useAuth.ts             ← { user, session, profile, loading, signOut }
│   │   ├── useQuest.ts            ← { quest, questDay, dayNumber, totalDays, loading, error }
│   │   ├── useCompletion.ts       ← { isCompletedToday, submitCompletion(), loading, submitting }
│   │   └── useProfile.ts          ← { profile, completions[], loading, refetch() }
│   │
│   ├── pages/
│   │   ├── AuthPage.tsx           ← /auth — magic link + Google OAuth sign-in
│   │   ├── OnboardingPage.tsx     ← /onboarding — set display name on first sign-in
│   │   ├── HomePage.tsx           ← / — today's reading card, streak bar, stats
│   │   ├── ReadingFlowPage.tsx    ← /read/:questDayId — full-screen 5-step flow
│   │   ├── QuestsPage.tsx         ← /quests — active quest card + completed (empty state)
│   │   ├── FriendsPage.tsx        ← /friends — "Coming Soon" placeholder
│   │   └── ProfilePage.tsx        ← /profile — stats, calendar, sign out
│   │
│   └── components/
│       ├── ui/
│       │   ├── Button.tsx         ← variants: primary|secondary|danger|success, fullWidth prop
│       │   ├── Card.tsx           ← rounded-2xl tq-surface card, optional glow prop
│       │   ├── Input.tsx          ← 16px font (prevents iOS zoom), teal focus ring
│       │   └── Textarea.tsx       ← auto-grow (80px–160px), same style as Input
│       │
│       ├── layout/
│       │   ├── Layout.tsx         ← max-w-[428px] centered container + BottomNav
│       │   ├── BottomNav.tsx      ← 4 tabs: Home/Quests/Friends/Profile, 64px height
│       │   └── ProtectedRoute.tsx ← redirects to /auth if no session
│       │
│       ├── home/
│       │   ├── TodaysReadingCard.tsx  ← quest title, passage ref, Day X of Y, CTA button
│       │   ├── WeeklyStreakBar.tsx    ← 7 circles Mon-Sun, color-coded by completion status
│       │   └── QuickStatsRow.tsx     ← 3-col grid: streak | XP | day progress
│       │
│       ├── reading/
│       │   ├── PassageStep.tsx    ← step 1: passage text, continue button
│       │   ├── QuestionStep.tsx   ← steps 2-4: question + textarea + next/finish
│       │   ├── CelebrationStep.tsx ← step 5: fire icon, streak count (48px/900), +XP
│       │   └── ProgressDots.tsx   ← pill-shaped step indicator (active=wide teal, past=small, future=dim)
│       │
│       ├── quest/
│       │   └── ActiveQuestCard.tsx ← title, description, date range, gradient-quest progress bar
│       │
│       └── profile/
│           ├── ProfileHeader.tsx  ← 80px initials avatar (tq-purple bg), name, level title, join date
│           ├── StatsGrid.tsx      ← 2×2 grid: streak, XP, passages read, longest streak
│           └── StreakCalendar.tsx ← monthly calendar, teal = completed, gold border = today
│
├── .env.local.example             ← Copy to .env.local and fill in your keys
├── tailwind.config.js             ← Full tq-* color palette + Nunito font + borderRadius
├── postcss.config.js              ← tailwindcss + autoprefixer
├── vite.config.ts                 ← @vitejs/plugin-react + vite-plugin-pwa
└── index.html                     ← Nunito Google Font link, PWA meta tags
```

---

## 6. DATABASE SCHEMA

All tables live in `public` schema. Run `supabase/migrations/001_schema.sql` to create them.

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | References `auth.users(id)` |
| `display_name` | TEXT | Set on onboarding, default = email prefix |
| `avatar_url` | TEXT nullable | Not used in Phase 1 UI |
| `role` | TEXT | `'youth'` \| `'leader'` \| `'admin'`, default `'youth'` |
| `current_streak` | INT | Updated by `complete_reading()` RPC |
| `longest_streak` | INT | Auto-updated if current exceeds it |
| `total_xp` | INT | Cumulative XP |
| `level_title` | TEXT | Seedling → Sprout → Rooted → Branching → Flourishing → Mighty Oak |
| `last_completed_at` | TIMESTAMPTZ | Used for streak logic |
| `streak_freezes_available` | INT | Phase 2+ feature |
| `daily_reminder_time` | TIME | Default 19:00 — Phase 2+ |
| `created_at` | TIMESTAMPTZ | Join date |

### `quests`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `title` | TEXT | e.g. "Journey Through Matthew" |
| `description` | TEXT nullable | |
| `start_date` | DATE | |
| `end_date` | DATE | |
| `quest_type` | TEXT | `'reading'` \| `'discipline'` \| `'event'` |
| `is_active` | BOOLEAN | App fetches where `is_active = true` |
| `badge_name/icon` | TEXT | Phase 2+ |

### `quest_days`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | This is the `questDayId` used in `/read/:questDayId` |
| `quest_id` | UUID FK | → `quests.id` |
| `day_number` | INT | 1–30, used to find today's day |
| `passage_reference` | TEXT | e.g. "Matthew 5:1-16" |
| `passage_text` | TEXT | Full NIV text (days 1-5 seeded; 6-30 placeholder) |
| `is_milestone` | BOOLEAN | Days 7, 14, 21, 30 in seed |
| `milestone_note` | TEXT | Shown to user on milestone days |

### `completions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | → `profiles.id` |
| `quest_day_id` | UUID FK | → `quest_days.id` |
| `answer_1/2/3` | TEXT | Reflection answers |
| `xp_earned` | INT | Calculated client-side, validated server-side |
| `completed_at` | TIMESTAMPTZ | Defaults to NOW() |
| UNIQUE | (user_id, quest_day_id) | Prevents re-submission |

### RLS Policies
- `profiles`: SELECT/INSERT/UPDATE own row only
- `quests`: SELECT all (public)
- `quest_days`: SELECT all (public)
- `completions`: SELECT own row; INSERT own row only; no UPDATE/DELETE

### SQL Functions
- `xp_to_level(p_xp INT) → TEXT` — pure function, maps XP to level title
- `complete_reading(p_quest_day_id, p_answer_1/2/3, p_xp_earned) → JSON` — SECURITY DEFINER. Atomically inserts completion + updates profile streak/XP. Returns `{ new_streak, new_xp, new_level }`.

---

## 7. GAMIFICATION RULES

### XP per completion
| Condition | XP |
|-----------|-----|
| Base (always) | +20 |
| Before noon local time ("Early Bird") | +5 |
| Saturday or Sunday ("Weekend") | +10 |
| **Max possible per day** | **35** |

### Level titles
| XP Range | Title |
|----------|-------|
| 0 – 499 | Seedling |
| 500 – 1,999 | Sprout |
| 2,000 – 4,999 | Rooted |
| 5,000 – 9,999 | Branching |
| 10,000 – 24,999 | Flourishing |
| 25,000+ | Mighty Oak |

### Streak logic (server-side in `complete_reading()`)
- `last_completed_at` was **yesterday** → `current_streak + 1`
- `last_completed_at` was **today** → error: already completed
- `last_completed_at` was **older than yesterday** (or null) → reset to 1
- Dates compared in UTC in the RPC; client-side display uses local time

---

## 8. ROUTES

| Path | Component | Auth | Notes |
|------|-----------|------|-------|
| `/auth` | AuthPage | Public | Magic link + Google OAuth |
| `/onboarding` | OnboardingPage | Protected | Set display name |
| `/` | HomePage | Protected | Daily reading hub |
| `/quests` | QuestsPage | Protected | Active quest card |
| `/friends` | FriendsPage | Protected | "Coming Soon" |
| `/profile` | ProfilePage | Protected | Stats, calendar, sign out |
| `/read/:questDayId` | ReadingFlowPage | Protected | Full-screen, no bottom nav |
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

**Typography:** Nunito. Key sizes: 48px/900 (display/streak count) · 28px/800 (H1) · 16px/400 (body, inputs) · 12px min.

**Border radii:** `rounded-2xl` (16px) for cards · `rounded-xl` (12px) for buttons/inputs · `rounded-full` for circles.

---

## 10. IMPORTANT TECHNICAL NOTES

### Supabase client
The client in `src/lib/supabase.ts` uses `createClient()` **without** a Database generic type. This is because the handwritten `Database` interface in `src/types/database.ts` doesn't fully satisfy Supabase v2's internal `GenericSchema` constraint. **All query results are explicitly cast** at each call site using the types exported from `database.ts`. This is intentional and correct — do not "fix" it by adding the generic back without first generating types via the Supabase CLI.

### Seed data — passage text
Days 1–5 have real NIV passage text in the seed. Days 6–30 have placeholder text (`[Passage text coming soon] ...summary`). Before launch, populate the remaining passages by updating `passage_text` in the `quest_days` table.

### Reading flow — "already completed" guard
The `complete_reading` RPC will throw an error if the user tries to submit twice on the same day. The `ReadingFlowPage` catches this error and still advances to the celebration screen (so the user doesn't see an error on a day they already completed earlier).

### Quest day lookup
`useQuest.ts` determines today's day number by computing the diff in calendar days between `quest.start_date` and today, clamped to 1–30. If the app is used before the quest starts or after it ends, it clamps to day 1 or day 30 respectively.

### ProtectedRoute
Does NOT handle the onboarding redirect automatically. The onboarding screen is navigated to manually after Google OAuth sign-in if the user's `display_name` is still their email prefix. This is a known gap — in Phase 2, add logic to `useAuth` to detect first-time users and redirect to `/onboarding`.

---

## 11. WHAT TO DO NEXT (Phase 2 priorities)

1. **Populate passage text** — fill in days 6–30 in `quest_days.passage_text`
2. **Vercel deploy** — connect GitHub repo, add env vars in Vercel dashboard
3. **PWA icons** — replace placeholder icon paths in `vite.config.ts` with real TQ-branded PNGs at `/public/icons/icon-192.png` and `icon-512.png`
4. **First-time user detection** — in `useAuth`, check if `display_name` equals the email prefix and redirect to `/onboarding` automatically
5. **Onboarding redirect after magic link** — handle the case where user returns from magic link email and hasn't set a name yet
6. **Friend system** — see blueprint §3.4 and Phase 2 scope
7. **Push notifications** — Supabase Edge Functions + Web Push API
8. **Badge system** — `badges` + `user_badges` tables (skip Phase 1)

---

*Reference files: `docs/BRAND-GUIDELINES.md` (visual system) · `docs/TRANSFORM-QUEST-BLUEPRINT.md` (full architecture)*
