# Transform Quest — Phase 1 MVP: Claude Code Prompt

> **How to use this file:** Copy the entire contents below the `---` line and paste it as your first prompt in a Claude Code session. Before starting, make sure the `docs/BRAND-GUIDELINES.md` and `docs/TRANSFORM-QUEST-BLUEPRINT.md` files exist in the repo root. Claude Code should read those files before writing any code.

---

## MISSION

You are building **Transform Quest**, a gamified daily Bible reading PWA for Transform Church youth (ages 11–18). This is **Phase 1 — MVP**. The goal is to ship the core daily loop: open the app → read today's passage → answer 3 reflection questions → earn streak + XP → see progress.

Before writing ANY code, read these two reference files in the project:
- `docs/BRAND-GUIDELINES.md` — Colors, typography, components, animation specs
- `docs/TRANSFORM-QUEST-BLUEPRINT.md` — Full architecture, database schema, screen specs, gamification rules

Follow the brand guidelines precisely. Every color, font weight, border radius, and spacing value is defined there. Do not improvise the visual system.

---

## TECH STACK

- **Framework:** React 18 + TypeScript (strict mode)
- **Build:** Vite with `vite-plugin-pwa`
- **Styling:** Tailwind CSS v3 with custom theme (colors defined in brand guidelines)
- **Backend:** Supabase (Auth, Postgres, RLS, Edge Functions)
- **Routing:** React Router v6
- **Fonts:** Nunito from Google Fonts (weights: 400, 600, 700, 800, 900)
- **Icons:** Lucide React
- **Hosting:** Vercel

---

## PHASE 1 SCOPE — BUILD ONLY THESE FEATURES

### 1. Project Scaffolding
- Vite + React + TypeScript project (already initialized — configure it)
- Tailwind CSS with the full custom color palette from brand guidelines (`tq-bg`, `tq-surface`, `tq-teal`, `tq-gold`, `tq-purple`, etc.)
- Google Fonts import for Nunito
- PWA manifest (`name: "Transform Quest"`, `short_name: "TQ"`, `theme_color: #1A1D2E`, `display: standalone`)
- Basic service worker via `vite-plugin-pwa` (cache static assets only for now)
- Global CSS with the CSS custom properties from the brand guidelines color system
- File structure following the pattern in brand guidelines section 12

### 2. Supabase Setup
Create these tables with the EXACT schemas from the blueprint (Section 5):
- `profiles` — user data, streak, XP, level
- `quests` — quest definitions
- `quest_days` — daily reading assignments within a quest
- `completions` — user's daily reading responses

**Skip these tables for Phase 1:** `friendships`, `nudges`, `badges`, `user_badges`, `announcements`

RLS Policies for Phase 1:
- Users can SELECT/INSERT/UPDATE their own `profiles` row
- Users can SELECT `quests` and `quest_days` (all rows — quests are public)
- Users can SELECT their own `completions`
- Users can INSERT a `completion` only if `user_id` matches their auth ID
- No UPDATE/DELETE on `completions` (once submitted, it's final)

Create a trigger function: when a new auth user signs up, auto-create a `profiles` row with their `id` and a default `display_name` from their email prefix.

### 3. Authentication
- Supabase Auth with **magic link** (email) as primary method
- **Google OAuth** as secondary sign-in option
- Simple auth page: "Transform Quest" wordmark at top ("Transform" in white, "Quest" in teal), email input, "Send Magic Link" button, Google sign-in button, brief tagline
- Auth state managed via Supabase `onAuthStateChange`
- Protected routes: redirect to auth page if not logged in
- Simple onboarding after first sign-in: set display name (single input + "Let's Go" button)

### 4. App Shell & Navigation
- Bottom tab navigation with 4 tabs: Home (BookOpen), Quests (Compass), Friends (Users), Profile (User)
- Home and Profile are fully functional in Phase 1
- Quests tab shows a simple active quest card with progress (not the full journey map yet)
- Friends tab shows a "Coming Soon" placeholder with the tq-purple color and Users icon
- Active tab: teal icon + teal label. Inactive: `tq-text-muted` icon + label
- Nav height: 64px + safe area inset bottom
- Page content scrolls independently above the nav
- Max content width: 428px, centered on larger screens with `tq-bg` flanks

### 5. Home Screen
Build exactly as described in blueprint Section 3.1:
- **Header:** Greeting ("Hey [display_name]!") on left, streak fire icon (Flame from Lucide) with count on right in `tq-gold`
- **Today's Reading Card:** `tq-surface` card with:
  - Quest title (e.g., "Journey Through Matthew") in `tq-purple`
  - Passage reference (e.g., "Matthew 5:1-16") as H2
  - Progress text ("Day 12 of 30") in `tq-text-sec`
  - Full-width teal CTA button: "Start Today's Reading"
  - If already completed today: button changes to "Completed ✓" in `tq-success`, disabled
- **Weekly Streak Bar:** 7 circles for Mon–Sun per brand guidelines spec (36px circles, 8px gaps, day labels above)
- **Quick Stats Row:** 3-column grid showing: streak fire + count, lightning bolt + XP, book + "Day X of Y"
- If no active quest exists, show an empty state: "No active quest yet — check back soon!" with a compass icon

### 6. Reading & Reflection Flow
Full-screen flow (hides bottom nav) triggered by tapping the CTA button:
- **Step 1 — Passage:** Show the passage reference as header + passage text below in a scrollable view. "Continue" button at bottom.
- **Step 2 — Question 1:** "What does this passage say?" with textarea input (min-height 80px, max 160px, auto-grow). "Next" button.
- **Step 3 — Question 2:** "How does this apply to you?" Same input pattern. "Next" button.
- **Step 4 — Question 3:** "What does this require you to do?" Same input pattern. "Finish" button.
- **Step 5 — Celebration:** 
  - Streak count displayed large (Display size from type scale: 48px, weight 900) in `tq-gold`
  - "day streak!" text below in `tq-gold`
  - Flame icon with gradient-fire background
  - "+20 XP" text in `tq-gold` (or higher if early bird / weekend bonus)
  - "Continue" button returns to Home screen

On submission:
- INSERT into `completions` table with the 3 answers + calculated XP
- UPDATE `profiles`: increment `total_xp`, update `current_streak` (increment if last_completed_at was yesterday, reset to 1 if gap > 1 day), update `longest_streak` if current exceeds it, set `last_completed_at` to now, recalculate `level_title` based on XP thresholds
- All in a single Supabase RPC or edge function to keep it atomic

Progress indicator: show dots or a step counter (1/5, 2/5, etc.) at the top of the flow.

### 7. XP & Streak Logic
Implement the XP rules from blueprint Section 4:
- Base completion: +20 XP
- Early bird (before noon local time): +5 XP bonus
- Weekend (Saturday/Sunday): +10 XP bonus
- These stack (e.g., Sunday morning = 20 + 5 + 10 = 35 XP)

Level titles from blueprint:
| XP Range | Title |
|----------|-------|
| 0–499 | Seedling |
| 500–1,999 | Sprout |
| 2,000–4,999 | Rooted |
| 5,000–9,999 | Branching |
| 10,000–24,999 | Flourishing |
| 25,000+ | Mighty Oak |

Streak logic:
- If `last_completed_at` is yesterday → increment `current_streak`
- If `last_completed_at` is today → already completed, don't allow re-submission
- If `last_completed_at` is older than yesterday → reset streak to 1
- Always compare dates in user's local timezone

### 8. Profile Screen
Build per blueprint Section 3.5 (Phase 1 subset):
- **Profile header:** Circle avatar with initials on `tq-purple` background (80px), display name, level title below in `tq-text-sec`, join date
- **Stats grid:** 2×2 grid of stat cards on `tq-surface`:
  - 🔥 Current Streak (number large, "day streak" label below)
  - ⚡ Total XP (formatted with commas)
  - 📖 Passages Read (count of completions)
  - 🏆 Longest Streak
- **Streak Calendar:** Monthly calendar view. Days with completions highlighted in `tq-teal`. Today highlighted differently. Navigate between months.
- **Settings section:** Sign out button (danger/destructive style per brand guidelines)

### 9. Quests Tab (Basic)
Not the full journey map — just a simple view:
- Show the active quest as a card: title, description, date range, progress bar (gradient-quest), "Day X of Y"
- Below: "Completed Quests" section (empty state for now: "Complete your first quest to see it here!")

### 10. Seed Data
Create a Supabase seed script or SQL file that inserts:
- One sample quest: "Journey Through Matthew" — 30 days, starting from a reasonable date
- 30 `quest_days` rows with real Matthew passage references (Matthew 1:1-25, Matthew 2:1-23, etc.) and passage text for at least the first 5 days (the rest can have placeholder text)
- Mark day 7, 14, 21, 30 as milestones

---

## DO NOT BUILD IN PHASE 1

These are explicitly deferred. Do not implement them, but do not write code that would make them hard to add later:
- Friend system, nudges, friend streaks
- Push notifications
- Admin dashboard or quest builder
- Badge earning or display
- Share button / native share sheet
- Celebration animations (confetti, fire flicker) — keep the celebration screen static for now
- Offline reading / advanced service worker caching
- Onboarding carousel or multi-step tutorial
- Streak freeze mechanic

---

## CODE QUALITY EXPECTATIONS

- TypeScript strict mode, no `any` types
- Components in PascalCase files, utilities in camelCase
- Extract Supabase client to `src/lib/supabase.ts`
- Extract auth logic to a custom hook: `useAuth()`
- Extract quest/completion data to hooks: `useQuest()`, `useCompletion()`
- Responsive: mobile-first, centered container on tablet/desktop
- All text inputs at 16px minimum (prevents iOS zoom)
- Use semantic HTML and proper heading hierarchy
- Keep components small and focused — no 500-line mega-components

---

## BUILD ORDER

Execute in this order. Get each step working before moving to the next:

1. **Scaffold + Config** — Tailwind theme, fonts, PWA manifest, global styles, file structure
2. **Supabase** — Tables, RLS policies, auth trigger, seed data
3. **Auth flow** — Sign in page, magic link, Google OAuth, auth state, protected routes
4. **App shell** — Layout component, bottom nav, routing
5. **Home screen** — Today's card, weekly streak bar, stats row (with mock data first, then wired to Supabase)
6. **Reading flow** — Full 5-step flow with form submission writing to Supabase
7. **XP + Streak** — Server-side logic for calculating and updating XP/streaks on completion
8. **Profile screen** — Stats, calendar, sign out
9. **Quests tab** — Basic active quest view
10. **Deploy** — Vercel connected to GitHub repo, environment variables configured

---

## ENVIRONMENT VARIABLES

The project will need these env vars (in `.env.local`, NOT committed to git):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Make sure `.env.local` is in `.gitignore`.

---

## FINAL NOTE

This is a real app for real teenagers at a real church. Clay Knight (youth pastor) is counting on this to help his students build a Bible reading habit. Build it with care. Make it feel polished, fast, and fun — even in MVP form. The dark UI should feel premium. The gamification should feel rewarding. The reading flow should feel smooth and focused.

When in doubt, re-read the brand guidelines. They have the answer.
