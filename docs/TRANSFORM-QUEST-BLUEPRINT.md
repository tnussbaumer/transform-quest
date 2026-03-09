# Transform Quest — Full Project Blueprint

**A gamified discipleship PWA for Transform Church Youth (Andover, MN)**

> This document is the single source of truth for the Transform Quest project. Reference it throughout development to stay on track with scope, architecture, and design decisions.

---

## 1. VISION & PURPOSE

Transform Quest takes the proven habit-forming mechanics of Duolingo (daily streaks, XP, badges) and wraps them in a quest/journey framework tied to Clay Knight's teaching calendar at Transform Church. The core daily loop is:

**Open the app → Read today's passage → Answer three reflection questions → Earn streak + XP → Progress through the current quest**

The social layer (friend streaks, nudges, shareable summaries) creates accountability without requiring a full social feed in v1.

### Target Audience
- **Primary:** Transform Church youth, 6th–12th graders (ages 11–18)
- **Secondary:** Clay and youth leaders who need visibility into engagement

### The Three Daily Reflection Questions
1. **What does the passage say?** (observation)
2. **How does the passage apply to you?** (application)
3. **What does this passage require me to do?** (action)

Each response is kept to 1–2 sentences — quick, honest, shareable.

### Why a PWA
- Installable to home screen on iOS and Android — feels native
- No App Store review or publishing process
- Single codebase, instant updates
- Push notifications supported (with iOS opt-in flow)
- Plays to our existing web development strengths
- 90% of native experience at 20% of the complexity

---

## 2. TECH STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Component framework, PWA support |
| **Styling** | Tailwind CSS | Utility-first responsive styling |
| **Build Tool** | Vite + vite-plugin-pwa | Fast builds, service worker generation |
| **Backend/DB** | Supabase | Auth, Postgres DB, real-time, RLS, edge functions |
| **Hosting** | Vercel | Zero-config deploys, edge network |
| **Push Notifications** | Web Push API + Supabase Edge Functions | Daily reminders, nudges |
| **Email** | Resend | Welcome emails, optional weekly digest |
| **Bible Text** | API.Bible or pre-loaded in Supabase | Passage retrieval |

---

## 3. INFORMATION ARCHITECTURE

### Bottom Navigation (4 tabs)
1. **Home** (book icon) — Today's reading + streak status
2. **Quests** (compass icon) — Quest journey map + progress
3. **Friends** (people icon) — Friend streaks + nudges
4. **Profile** (user icon) — Stats, badges, settings

### Screen Inventory

#### 3.1 HOME SCREEN — "Today"
The primary daily touchpoint. Layout top to bottom:

- **Header bar:** TC logo (small) + greeting ("Hey [Name]!") + streak fire icon with count
- **Today's Reading Card:** Large prominent card with:
  - Current quest name (e.g., "Journey Through Matthew")
  - Today's passage (e.g., "Matthew 5:1-16")
  - Progress indicator ("Day 12 of 30")
  - Big teal CTA button: "Start Today's Reading"
- **Weekly Streak Bar:** 7-day row (Mon–Sun) with checkmarks for completed, glowing circle for today, gray for upcoming
- **Quick Stats Row:** XP earned today | Current streak | Quest progress
- **Friend Activity Snippet:** "3 friends completed today" with tiny avatars — tapping goes to Friends tab

#### 3.2 READING & REFLECTION FLOW
Triggered when user taps "Start Today's Reading":

1. **Passage Display:** Scripture text shown in a readable, scrollable view
2. **Question 1:** "What does this passage say?" — text input (1-2 sentences)
3. **Question 2:** "How does this apply to you?" — text input (1-2 sentences)
4. **Question 3:** "What does this require you to do?" — text input (1-2 sentences)
5. **Celebration Screen:** Streak count animates up, XP earned with count-up animation, fire icon glows. Quest milestone bonus if applicable.
6. **Friend Streaks Screen:** Shows friends who still need to complete today. "Nudge" button next to each.
7. **Share Button:** Generates formatted text block for native share sheet:

```
📖 Transform Quest — Day 12
Matthew 5:1-16

💬 What it says: Jesus teaches about being salt and light...
🎯 How it applies: I need to be bolder about my faith at school...
⚡ What I'll do: Start a conversation with someone new at lunch

🔥 12-day streak!
```

#### 3.3 QUESTS SCREEN — "Journey Map"
The longer-arc engagement layer. Clay creates quests aligned with his teaching.

- **Active Quest** shown at top with visual progress bar
- **Quest Card:** Title, description, date range, progress (e.g., "18/30 days"), badge preview
- **Journey Path:** Vertical winding trail with nodes per day. Completed = teal + checkmark. Today = pulsing. Future = dimmed. Milestones (every 7 days) = larger nodes with special icons.
- **Milestone Rewards:** Bonus content from Clay, special badges, or double XP
- **Completed Quests:** Scrollable section showing past quests with earned badges

**Quest Types:**
- **Reading Quests:** Follow a Bible reading plan (primary type)
- **Discipline Quests:** Weekly spiritual discipline challenges (prayer, fasting, service, memorization) — bonus XP
- **Event Quests:** Tied to specific events (summer camp, mission trip, retreat)

#### 3.4 FRIENDS SCREEN
- **Streak Partners List:** Friends with avatars, names, current streak. Gold fire = completed today, gray = not yet.
- **Nudge Button:** One per friend per day. Sends push notification.
- **Add Friends:** Invite link or QR code (closed community, no public discovery)
- **Friend Streaks:** Mutual streak counter (consecutive days both completed)

#### 3.5 PROFILE SCREEN
- **Profile Header:** Avatar (initials or uploaded photo), display name, join date, role badge
- **Stats Grid:**
  - 🔥 Current Streak (+ longest streak)
  - ⚡ Total XP
  - 📖 Passages Read
  - 🏆 Quests Completed
- **Badges Collection:** Grid of earned badges
- **Streak Calendar:** Monthly view showing completed days (teal/green highlights)
- **Settings:** Notification time, sign out

#### 3.6 ADMIN/LEADER DASHBOARD (route: `/admin`)
Accessible to leader/admin role accounts.

- **Quest Builder:** Create/edit quests (title, description, dates, daily reading assignments, milestones)
- **Engagement Dashboard:** Active today, streak leaderboard, avg completion rate, inactive users (3+ days)
- **Nudge All:** Push reminder to everyone who hasn't completed today
- **Announcements:** Post messages shown on Home screen

---

## 4. GAMIFICATION SYSTEM

### XP Rewards
| Action | XP |
|--------|-----|
| Complete daily reading + all 3 questions | +20 XP |
| Complete before noon ("Early Bird") | +5 XP |
| Weekend completion (Sat/Sun) | +10 XP bonus |
| Quest milestone (every 7 days) | +50 XP |
| Quest completion | +200 XP |
| Discipline quest task | +30 XP |

### Streaks
- **Personal Streak:** Consecutive days completing daily reading
- **Friend Streak:** Consecutive days where both you AND a friend complete
- **Streak Freeze:** Earn 1 free freeze every 7 consecutive days. Preserves streak for 1 missed day.
- **Streak Milestones:** 7, 14, 30, 60, 90, 180, 365 days — each earns a badge

### Level Titles (based on total XP)
| Level | XP Range | Title |
|-------|----------|-------|
| 1 | 0 – 500 | Seedling |
| 2 | 500 – 2,000 | Sprout |
| 3 | 2,000 – 5,000 | Rooted |
| 4 | 5,000 – 10,000 | Branching |
| 5 | 10,000 – 25,000 | Flourishing |
| 6 | 25,000+ | Mighty Oak |

### Badges
- **Streak badges:** 7-day, 14-day, 30-day, 60-day, 90-day, 180-day, 365-day
- **Quest badges:** Unique badge per completed quest
- **Monthly badges:** "Perfect Month" for completing every day in a calendar month
- **Special badges:** First reading, first nudge, first friend, 10 shares, etc.

### Nudges
- Appear after completing daily reading (shows friends who haven't completed)
- Sends push notification: "🔥 [Name] nudged you! Don't break your streak!"
- Max 1 nudge per friend per day

---

## 5. DATABASE SCHEMA (Supabase / Postgres)

### profiles
```sql
CREATE TABLE profiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name            TEXT NOT NULL,
  avatar_url              TEXT,
  role                    TEXT CHECK (role IN ('youth', 'leader', 'admin')) DEFAULT 'youth',
  current_streak          INTEGER DEFAULT 0,
  longest_streak          INTEGER DEFAULT 0,
  total_xp                INTEGER DEFAULT 0,
  level_title             TEXT DEFAULT 'Seedling',
  last_completed_at       TIMESTAMPTZ,
  streak_freezes_available INTEGER DEFAULT 0,
  daily_reminder_time     TIME DEFAULT '19:00',
  push_subscription       JSONB,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);
```

### quests
```sql
CREATE TABLE quests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  quest_type      TEXT CHECK (quest_type IN ('reading', 'discipline', 'event')) DEFAULT 'reading',
  created_by      UUID REFERENCES profiles(id),
  badge_name      TEXT,
  badge_icon      TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### quest_days
```sql
CREATE TABLE quest_days (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id          UUID REFERENCES quests(id) ON DELETE CASCADE,
  day_number        INTEGER NOT NULL,
  passage_reference TEXT,
  passage_text      TEXT,
  is_milestone      BOOLEAN DEFAULT false,
  milestone_note    TEXT,
  UNIQUE(quest_id, day_number)
);
```

### completions
```sql
CREATE TABLE completions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id),
  quest_day_id    UUID REFERENCES quest_days(id),
  answer_1        TEXT NOT NULL,
  answer_2        TEXT NOT NULL,
  answer_3        TEXT NOT NULL,
  xp_earned       INTEGER NOT NULL,
  completed_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_day_id)
);
```

### friendships
```sql
CREATE TABLE friendships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a          UUID REFERENCES profiles(id),
  user_b          UUID REFERENCES profiles(id),
  mutual_streak   INTEGER DEFAULT 0,
  status          TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);
```

### nudges
```sql
CREATE TABLE nudges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user       UUID REFERENCES profiles(id),
  to_user         UUID REFERENCES profiles(id),
  quest_day_id    UUID REFERENCES quest_days(id),
  nudged_at       TIMESTAMPTZ DEFAULT NOW()
);
```

### badges
```sql
CREATE TABLE badges (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  icon              TEXT,
  badge_type        TEXT CHECK (badge_type IN ('streak', 'quest', 'monthly', 'special')),
  requirement_value INTEGER
);
```

### user_badges
```sql
CREATE TABLE user_badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id),
  badge_id        UUID REFERENCES badges(id),
  earned_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

### announcements
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

### Row-Level Security (RLS) Policies
- Users can read/write their own completions only
- Users can read friends' streak/profile data (but NOT reflection answers — privacy)
- Leaders can read all user data for dashboard
- Only admin/leader roles can create/edit quests and announcements
- Friendships require mutual acceptance

---

## 6. AUTHENTICATION

- **Primary:** Supabase Auth with magic link (email-based, no password — ideal for teens)
- **Secondary:** "Sign in with Google" for convenience
- **Leader accounts:** Created via admin panel or invite code with elevated role
- **Onboarding flow:** Sign in → Set display name → Choose avatar → Join active quest → See first reading

---

## 7. PWA CONFIGURATION

- **Service Worker:** Cache static assets + recent quest data for offline reading
- **Web App Manifest:**
  - `name`: "Transform Quest"
  - `short_name`: "TQ"
  - `theme_color`: `#1A1D2E`
  - `background_color`: `#1A1D2E`
  - `display`: `standalone`
  - Icons at 192px and 512px (TC-branded)
- **Install Prompt:** Custom banner after 3rd visit encouraging home screen install
- **Push Notifications:** Web Push API via Supabase Edge Functions
  - Daily reminder (user-configured time, default 7pm)
  - Nudge from friend
  - New quest available
  - Quest milestone reached

---

## 8. RESEND (EMAIL — LIMITED USE)

- Welcome email on account creation
- Optional weekly digest to parents/leaders summarizing student engagement
- Quest launch notification email
- These are nice-to-haves, not critical for MVP

---

## 9. DEVELOPMENT PHASES

### Phase 1 — MVP (Weeks 1–3)
Core daily loop that proves the concept.

- [ ] Supabase project setup (auth, database tables, RLS policies)
- [ ] PWA shell with React + TypeScript + Tailwind + Vite
- [ ] Auth flow (magic link + Google sign-in)
- [ ] Home screen with today's reading card + weekly streak bar
- [ ] Reading + 3-question reflection flow
- [ ] Celebration screen (basic)
- [ ] Streak tracking (personal streak, weekly bar, calendar view)
- [ ] XP system (basic earning + level titles)
- [ ] Profile screen with stats
- [ ] Basic quest structure (one active quest)
- [ ] Deploy to Vercel

**Skip for now:** Friends, nudges, push notifications, admin dashboard, badges, share

### Phase 2 — Social & Gamification (Weeks 4–5)

- [ ] Friend system (add via invite link / QR code)
- [ ] Friend streaks (mutual streak counter)
- [ ] Nudge system with push notifications
- [ ] Post-completion friend status screen
- [ ] Share button (native share sheet with formatted text)
- [ ] Badge system (earning + profile display)
- [ ] Push notification infrastructure (daily reminders, nudges)

### Phase 3 — Quest Engine & Admin (Weeks 6–7)

- [ ] Admin dashboard (`/admin` route)
- [ ] Quest builder (create/edit quests + daily readings)
- [ ] Engagement dashboard (active users, streaks, dropoffs)
- [ ] Multiple quest support (active + completed history)
- [ ] Journey map visualization
- [ ] Quest milestones with bonus XP
- [ ] Discipline quests (non-reading challenges)
- [ ] Streak freeze mechanic
- [ ] Announcements system
- [ ] "Nudge All" for leaders

### Phase 4 — Polish & Launch (Week 8)

- [ ] Onboarding flow (first-time UX)
- [ ] Celebration animations (confetti, streak fire, level-up)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Offline reading support (cached passages via service worker)
- [ ] Install prompt optimization
- [ ] Weekly email digest via Resend (optional)
- [ ] Bug fixes + edge case handling
- [ ] Invite-code system for controlled rollout

---

## 10. LAUNCH STRATEGY

1. **Alpha:** Clay's small group leaders (5–10 people) test for bugs and UX feedback
2. **Youth Group Launch:** Clay announces at Wednesday night, walks kids through PWA install, everyone adds friends on the spot
3. **First Quest:** Short (7–14 days) so kids experience the full loop and earn their first badge quickly
4. **Ongoing:** Clay creates new quests aligned with teaching series, seasonal events, retreats

---

## 11. FUTURE IDEAS (POST-LAUNCH)
- Community feed with shared reflections, hearts, comments
- Group/small group challenges (teams competing for XP)
- Parent/guardian visibility dashboard
- Integration with Planning Center (church management)
- Audio devotional option
- Memory verse mini-game
- Light mode toggle
- Leaderboard seasons (monthly reset)

---

## 12. KEY REFERENCE FILES
- **`BRAND-GUIDELINES.md`** — Colors, typography, component styling, visual rules for Claude Code
- **This file (`TRANSFORM-QUEST-BLUEPRINT.md`)** — Architecture, features, phasing, database schema

---

*Last updated: March 9, 2026*
*Project leads: Tim (dev) + Clay Knight (product/content, Youth Pastor @ Transform Church)*
