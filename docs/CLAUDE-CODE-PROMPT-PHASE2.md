# Transform Quest — Phase 2: Social & Gamification — Claude Code Prompt

> **How to use this file:** Copy everything below the `---` line and paste it as your first prompt in a new Claude Code session. Make sure Phase 1 is fully built and deployed before starting Phase 2.

---

## MISSION

You are continuing development on **Transform Quest**, a gamified daily Bible reading PWA. Phase 1 (the core daily loop) is complete and deployed. Phase 2 adds the **social layer** and **gamification depth** — friends, nudges, badges, sharing, celebration polish, and critical UX fixes from Phase 1.

Before writing ANY code, read these files in the project:
- `docs/BRAND-GUIDELINES.md` — Colors, typography, components, animation specs
- `docs/TRANSFORM-QUEST-BLUEPRINT.md` — Full architecture, database schema, screen specs
- `docs/SOURCE_OF_TRUTH.md` — Current state of the codebase, file structure, technical decisions

Follow the brand guidelines precisely. All visual decisions are already defined there.

---

## CURRENT STATE (Phase 1 Complete)

**What exists and works:**
- Vite + React 19 + TypeScript (strict) + Tailwind v3 + Supabase
- Auth (magic link + Google OAuth), onboarding (display name)
- Home screen (today's card, weekly streak bar, stats row)
- Reading & reflection flow (5-step, writes to Supabase via `complete_reading` RPC)
- XP + streak calculation (server-side atomic RPC)
- Profile screen (stats grid, streak calendar, sign out)
- Quests tab (active quest card + progress bar)
- Friends tab (currently a "Coming Soon" placeholder)
- PWA manifest + basic service worker

**Existing database tables:** `profiles`, `quests`, `quest_days`, `completions`
**Existing RPC:** `complete_reading()` — atomically inserts completion + updates streak/XP
**Existing hooks:** `useAuth`, `useQuest`, `useCompletion`, `useProfile`

**Key technical note from Phase 1:** The Supabase client in `src/lib/supabase.ts` uses `createClient()` WITHOUT a Database generic type. All query results are explicitly cast at call sites using types from `src/types/database.ts`. Do NOT change this pattern — continue using explicit casts.

---

## PHASE 2 SCOPE — BUILD THESE FEATURES

### 0. Phase 1 Fixes (Do These First)

Before building new features, fix these gaps identified in Phase 1:

**a) First-time user detection:**
In `useAuth.ts`, after loading the profile, check if `display_name` equals the email prefix (the part before `@`). If so, redirect to `/onboarding`. This handles magic link returns where the user hasn't set a name yet. Currently this redirect only happens manually after Google OAuth.

**b) Populate passage text:**
Update `supabase/seed.sql` to include real passage text for days 6–30 of the "Journey Through Matthew" quest. Use brief but real scripture summaries (3–5 sentences each) — not the full NIV text but enough to give a meaningful reading. Update the seed file so fresh installs get the full content.

**c) PWA icons:**
Create placeholder SVG icons at `public/icons/icon-192.png` and `public/icons/icon-512.png`. Use the "TQ" wordmark — "T" in white, "Q" in teal (#00C9A7) — on a `tq-bg` (#1A1D2E) background. Simple and bold. Update `vite.config.ts` to reference the correct icon paths.

---

### 1. Database Migration — New Tables

Create `supabase/migrations/003_phase2_social.sql` with:

**friendships table** (from blueprint §5):
```sql
CREATE TABLE friendships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a          UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_b          UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mutual_streak   INTEGER DEFAULT 0,
  status          TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);
```

**nudges table** (from blueprint §5):
```sql
CREATE TABLE nudges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quest_day_id    UUID REFERENCES quest_days(id) ON DELETE CASCADE,
  nudged_at       TIMESTAMPTZ DEFAULT NOW()
);
```

**badges table** (from blueprint §5):
```sql
CREATE TABLE badges (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  icon              TEXT,
  badge_type        TEXT CHECK (badge_type IN ('streak', 'quest', 'monthly', 'special')),
  requirement_value INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

**user_badges table** (from blueprint §5):
```sql
CREATE TABLE user_badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id        UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

**Add `invite_code` column to profiles:**
```sql
ALTER TABLE profiles ADD COLUMN invite_code TEXT UNIQUE;
```
Generate a random 8-character alphanumeric code for each user. Add it to the auth trigger so new users get one automatically.

**RLS Policies for new tables:**

friendships:
- Users can SELECT friendships where they are `user_a` OR `user_b`
- Users can INSERT a friendship where they are `user_a`
- Users can UPDATE friendships where they are `user_b` (to accept)
- Users can DELETE friendships where they are `user_a` OR `user_b`
- Users can SELECT `profiles` (display_name, avatar_url, current_streak, last_completed_at, level_title) for accepted friends — but NOT completions/answers (privacy)

nudges:
- Users can SELECT nudges where they are `from_user` or `to_user`
- Users can INSERT a nudge where they are `from_user`
- Add a constraint or check: max 1 nudge per (from_user, to_user) per calendar day

badges / user_badges:
- `badges` table: SELECT for all authenticated users (badges are public)
- `user_badges`: SELECT own rows; INSERT handled by server-side function only

---

### 2. Invite & Friend System

**Add friend via invite code (not public discovery — closed community):**

Each user has a unique `invite_code` on their profile. To add a friend:
- User A shares their invite code (text, QR, or link)
- User B enters the code on the Friends screen
- This creates a `friendships` row with `status: 'pending'`
- User A sees the pending request and taps "Accept"
- Status changes to `'accepted'`

**Friends screen (`FriendsPage.tsx` — replace the "Coming Soon" placeholder):**

Layout:
- **Header:** "Friends" as H1
- **Add Friend section:** Input field for invite code + "Add" button. Below it: "Your invite code: XXXXXXXX" with a copy button and a share button
- **Pending Requests:** Show incoming pending friendships with "Accept" / "Decline" buttons
- **Friends List:** Each friend shows:
  - Avatar (initials circle, same style as profile)
  - Display name
  - Their current streak with fire icon
  - Status indicator: gold fire icon if they completed today, gray if not yet
  - Nudge button (👋 emoji or Hand icon) — only shows if friend has NOT completed today
  - Mutual streak count if > 0

**New hook: `useFriends.ts`**
- `friends[]` — accepted friendships with friend profile data
- `pendingIncoming[]` — pending requests where current user is `user_b`
- `pendingSent[]` — pending requests where current user is `user_a`
- `addFriend(inviteCode)` — look up user by invite_code, create friendship
- `acceptFriend(friendshipId)` — update status to accepted
- `declineFriend(friendshipId)` — delete the friendship row
- `removeFriend(friendshipId)` — delete accepted friendship

**New components in `src/components/friends/`:**
- `FriendsList.tsx` — list of accepted friends with streak info
- `FriendCard.tsx` — single friend row (avatar, name, streak, nudge button)
- `AddFriendSection.tsx` — invite code input + user's own code display
- `PendingRequests.tsx` — incoming requests with accept/decline

---

### 3. Nudge System

When a user completes their daily reading, after the celebration screen, show a **Friend Streaks Screen** (this is step 6 in the reading flow from blueprint §3.2):

**New component: `FriendStreaksStep.tsx`** (add as step 6 in `ReadingFlowPage.tsx`):
- Header: "Your Friend Streaks" in `tq-gold`
- List of friends who have NOT completed today
- Each shows avatar, name, and a "Nudge" button (`tq-surface-2` bg, teal left border, 👋 icon)
- Below: list of friends who HAVE completed today (with checkmark, for encouragement)
- "Continue" button at bottom to return to Home

**Nudge behavior:**
- Tapping "Nudge" inserts a row into the `nudges` table
- Button changes to "Nudged ✓" and becomes disabled (tq-text-muted)
- Max 1 nudge per friend per day — check for existing nudge before allowing
- The nudge button on the Friends screen should work the same way

**New hook: `useNudge.ts`**
- `nudgeFriend(toUserId, questDayId)` — insert nudge
- `todaysNudges[]` — nudges sent today by current user (to disable buttons)
- `hasNudgedToday(friendId)` — boolean check

**Push notifications for nudges (basic — no Supabase Edge Functions yet):**
Skip actual push notification delivery for now. The nudge gets recorded in the database and shows as a visual state change. Push notification delivery will come in Phase 3. But DO set up the data model so it's ready.

---

### 4. Share Button

After the celebration screen (and optionally from the Friend Streaks screen), show a **Share** button.

**Behavior:**
- Uses the Web Share API (`navigator.share()`) if available
- Falls back to copying text to clipboard with a "Copied!" confirmation
- Share text format (from blueprint §3.2):

```
📖 Transform Quest — Day {dayNumber}
{passageReference}

💬 What it says: {answer1}
🎯 How it applies: {answer2}
⚡ What I'll do: {answer3}

🔥 {streakCount}-day streak!
```

**New component: `ShareButton.tsx`** in `src/components/reading/`
- `tq-teal` background, Share2 icon from Lucide
- Takes props: dayNumber, passageReference, answers, streakCount
- On tap: try `navigator.share()`, catch → `navigator.clipboard.writeText()`, show "Copied!" toast

Add this button to:
- `CelebrationStep.tsx` (below the Continue button)
- `FriendStreaksStep.tsx` (in the header area)

---

### 5. Badge System

**Seed the badges table** in a new seed file `supabase/seed_badges.sql`:

Streak badges:
| Name | Type | Requirement | Icon |
|------|------|-------------|------|
| Week Warrior | streak | 7 | 🔥 |
| Two-Week Titan | streak | 14 | 🔥 |
| Monthly Master | streak | 30 | 🔥 |
| Iron Will | streak | 60 | 💪 |
| Unstoppable | streak | 90 | ⚡ |
| Half-Year Hero | streak | 180 | 🌟 |
| Legendary | streak | 365 | 👑 |

Special badges:
| Name | Type | Requirement | Icon |
|------|------|-------------|------|
| First Steps | special | 1 | 📖 (first reading) |
| Friendly | special | 1 | 👋 (first friend added) |
| Encourager | special | 1 | 💬 (first nudge sent) |

Quest badges — these are created dynamically when quests are created. For the seed quest "Journey Through Matthew", add a badge:
| Name | Type | Icon |
|------|------|------|
| Matthew Scholar | quest | 📜 |

**Badge checking logic:**
Create a Supabase function `check_and_award_badges(p_user_id UUID)` that:
1. Checks current_streak against streak badge requirements
2. Checks if user has any completions (First Steps badge)
3. Checks if user has any accepted friendships (Friendly badge)
4. Checks if user has sent any nudges (Encourager badge)
5. Checks if user has completed all days in a quest (quest badge)
6. Awards any badges the user has earned but doesn't have yet

Call this function at the end of `complete_reading()` RPC.

**Badge display on Profile screen:**
Add a "Badges" section to `ProfilePage.tsx` between the stats grid and the streak calendar:
- Section header: "BADGES" in all-caps, `tq-text-sec`, `font-weight: 800`, `letter-spacing: 0.05em`
- Grid of badge circles (64px, per brand guidelines §5)
- Earned badges: full color with icon, subtle glow matching badge type (tq-gold for streak, tq-purple for quest, tq-teal for special)
- Unearned badges: grayscale silhouette, 40% opacity, on `tq-surface-2` background
- Tapping an earned badge shows a small tooltip/modal with the badge name and description

**New components in `src/components/profile/`:**
- `BadgesGrid.tsx` — grid layout of all badges
- `BadgeCircle.tsx` — single badge (earned vs unearned states)

**New hook: `useBadges.ts`**
- `allBadges[]` — all available badges
- `earnedBadges[]` — badges the user has earned
- `hasBadge(badgeId)` — boolean check

---

### 6. Post-Completion Friend Status on Home Screen

Update the Home screen to show friend activity below the Quick Stats Row:

**"Friend Activity" snippet (from blueprint §3.1):**
- If friends exist: "[X] friends completed today" with up to 3 tiny avatars (32px) stacked/overlapping
- Tapping it navigates to the Friends tab
- If no friends yet: "Add friends to see their progress!" with a teal "Add Friends" link to the Friends tab

**New component: `FriendActivitySnippet.tsx`** in `src/components/home/`

---

### 7. Celebration Animations

Upgrade the `CelebrationStep.tsx` from Phase 1's static screen to an animated celebration:

**Streak count-up animation:**
- Animate the streak number from (currentStreak - 1) → currentStreak
- Scale bounce: 1.0 → 1.2 → 1.0 over 500ms
- Brief color flash to `tq-gold-light` then back to `tq-gold`

**XP earned animation:**
- "+{xp} XP" text flies up from center, scales up slightly, fades out upward
- Duration: 800ms, color: `tq-gold` with glow

**Fire icon:**
- Apply the existing `.animate-fire-pulse` class
- Add the `.gradient-fire` background to the fire icon container
- Add `.glow-gold` for ambient glow

**Confetti:**
- Use `canvas-confetti` library (install via npm)
- Fire on celebration screen mount
- Colors: `#00C9A7` (teal), `#FFB830` (gold), `#8B5CF6` (purple), `#34D399` (success)
- Duration: 2 seconds, then stop
- Respect `prefers-reduced-motion`: if user prefers reduced motion, skip confetti and simplify animations to opacity-only

**Milestone celebration:**
- If today is a milestone day (`quest_days.is_milestone = true`), show extra flair:
  - "🎉 Quest Milestone!" text in `tq-purple`
  - "+50 XP Bonus!" below in `tq-gold`
  - Double confetti burst

---

### 8. Update Reading Flow Steps

The reading flow currently has 5 steps. Update it to 7:

1. Passage display (existing)
2. Question 1 (existing)
3. Question 2 (existing)
4. Question 3 (existing)
5. Celebration screen (existing — now with animations from §7)
6. **NEW: Friend Streaks screen** (from §3 — shows friends who need nudging)
7. **NEW: Done screen** with Share button + "Back to Home" CTA

Update `ProgressDots.tsx` to handle 7 steps. Steps 6 and 7 should only show if the user has friends — if no friends, skip directly from celebration to home (or show a brief "Add friends to cheer each other on!" with link to Friends tab).

---

### 9. Mutual Streak Tracking

Track "friend streaks" — consecutive days where BOTH users in a friendship completed their reading.

**Logic (add to `complete_reading()` RPC or a separate function called after it):**
- When user completes, check each accepted friendship
- For each friend: did the friend also complete today (or yesterday, depending on timing)?
- If both completed today: increment `friendships.mutual_streak`
- If either missed a day: reset `mutual_streak` to 0

Display the mutual streak on the `FriendCard.tsx`: small "🔥 {mutual_streak}" badge below the friend's name if mutual_streak > 0.

---

### 10. Update TypeScript Types

Add to `src/types/database.ts`:

```typescript
export interface Friendship {
  id: string;
  user_a: string;
  user_b: string;
  mutual_streak: number;
  status: 'pending' | 'accepted';
  created_at: string;
}

export interface Nudge {
  id: string;
  from_user: string;
  to_user: string;
  quest_day_id: string;
  nudged_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  badge_type: 'streak' | 'quest' | 'monthly' | 'special';
  requirement_value: number | null;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}
```

Also add `invite_code: string | null` to the existing `Profile` interface.

---

## DO NOT BUILD IN PHASE 2

Explicitly deferred to Phase 3+:
- Admin dashboard or quest builder
- Push notification delivery (Supabase Edge Functions + Web Push API) — we store nudges, but don't deliver pushes yet
- Multiple quest support (only one active quest for now)
- Journey map visualization (the winding trail with nodes)
- Discipline quests or event quests
- Streak freeze mechanic
- Announcements system
- QR code generation for invite codes (use text copy for now)
- Notification time settings

---

## NEW FILE STRUCTURE (additions to Phase 1)

```
src/
├── components/
│   ├── friends/
│   │   ├── FriendsList.tsx
│   │   ├── FriendCard.tsx
│   │   ├── AddFriendSection.tsx
│   │   └── PendingRequests.tsx
│   ├── reading/
│   │   ├── ... (existing)
│   │   ├── FriendStreaksStep.tsx    ← NEW
│   │   └── ShareButton.tsx         ← NEW
│   ├── home/
│   │   ├── ... (existing)
│   │   └── FriendActivitySnippet.tsx ← NEW
│   └── profile/
│       ├── ... (existing)
│       ├── BadgesGrid.tsx          ← NEW
│       └── BadgeCircle.tsx         ← NEW
│
├── hooks/
│   ├── ... (existing)
│   ├── useFriends.ts              ← NEW
│   ├── useNudge.ts                ← NEW
│   └── useBadges.ts               ← NEW
│
supabase/
├── migrations/
│   ├── 001_schema.sql             (existing)
│   ├── 002_auth_trigger.sql       (existing)
│   └── 003_phase2_social.sql      ← NEW (friendships, nudges, badges, user_badges, RLS, functions)
└── seed_badges.sql                ← NEW (badge definitions)
```

---

## CODE QUALITY EXPECTATIONS

Same as Phase 1:
- TypeScript strict mode, no `any` types
- Continue the existing pattern of explicit Supabase type casts
- Components in PascalCase files, utilities in camelCase
- Keep components small and focused
- New hooks follow the same pattern as existing ones (useAuth, useQuest, etc.)
- All interactive elements meet 44px minimum touch target
- Respect `prefers-reduced-motion` for all new animations
- Test the full flow: sign in → read → celebrate → nudge → share → check profile badges

---

## BUILD ORDER

Execute in this order. Get each step working before moving to the next:

1. **Phase 1 fixes** — first-time user detection, passage text, PWA icons
2. **Migration** — run 003_phase2_social.sql, seed badges, update auth trigger for invite_code
3. **TypeScript types** — add Friendship, Nudge, Badge, UserBadge interfaces
4. **Friends hooks + UI** — useFriends, FriendsPage replacement, AddFriendSection, PendingRequests, FriendsList
5. **Nudge system** — useNudge hook, nudge buttons on FriendCard, FriendStreaksStep in reading flow
6. **Badge system** — useBadges hook, check_and_award_badges function, BadgesGrid on profile
7. **Share button** — ShareButton component, add to celebration + friend streaks steps
8. **Celebration animations** — streak count-up, XP fly-up, confetti, milestone celebration
9. **Reading flow update** — expand to 7 steps, conditional friend steps
10. **Friend activity on Home** — FriendActivitySnippet below stats row
11. **Mutual streak tracking** — update complete_reading or add post-completion function
12. **Test full flow** — end-to-end: sign up → add friend → read → nudge → earn badge → share

---

## ENVIRONMENT VARIABLES

No new env vars needed for Phase 2. Continue using:
```
VITE_SUPABASE_URL=https://emvfbvdrezttiijmxrqy.supabase.co
VITE_SUPABASE_ANON_KEY=(existing key)
```

---

## FINAL NOTE

Phase 2 is what makes this app feel alive. Phase 1 proved the core loop works — now we're making it social and rewarding. The friend nudges, the confetti on completion, the badge grid filling up — these are the moments that will keep Clay's students coming back. Build it so it feels like a celebration every time they open the app.

When in doubt, re-read the brand guidelines. Reference the Duolingo screenshots in Clay's PDF for the vibe — friend streaks, nudge buttons, celebration screens. That's the energy we're going for.
