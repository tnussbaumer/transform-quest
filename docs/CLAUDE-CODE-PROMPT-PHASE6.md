# Transform Quest — Phase 6 Build Prompt (Passage Helper & Reading Guide)

> **Paste this into Claude Code at the start of your Phase 6 session.**
> Phases 1–5B are complete and deployed (~478KB JS, 40KB CSS). This phase adds two reading support features: a per-passage "Reading Hint" system and a static "How to Read the Bible" guide carousel — both designed to help 6th–12th graders engage more deeply with daily passages.

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
find src -type f -name "*.tsx" -o -name "*.ts" | head -130
cat src/App.tsx
cat src/types/database.ts
cat src/hooks/useAuth.ts
cat src/hooks/useQuest.ts
cat src/pages/HomePage.tsx
cat src/pages/ReadingFlowPage.tsx
cat src/components/reading/PassageStep.tsx
cat src/pages/ProfilePage.tsx
cat src/components/admin/QuestBuilder.tsx
cat src/lib/supabase.ts
cat src/index.css
```

---

## WHAT EXISTS (DO NOT REBUILD)

Phases 1–5B are complete and passing. Key existing pieces:

- **Auth:** Google OAuth + magic link via Supabase, `useAuth` context with `{ user, session, profile, loading, signOut, refreshProfile, patchProfile }`
- **Profiles:** `profiles` table with `role`, `onboarding_completed`, avatar fields, `push_subscription` (JSONB), `daily_reminder_time` (TIME, default 19:00)
- **Quest system:** Multi-quest support, `useQuest` hook with `isCurrentDayCompleted`, `useQuestHistory` hook
- **Reading flow:** 9-step flow (Passage → Q1 → Q2 → Q3 → Celebrate → Journey → Share → Friends → Done)
- **PassageStep:** Currently shows passage reference, rotating "open your Bible" encouragement messages, a BibleGateway link, and a "Scripture Summary" section when `passage_text` exists on the quest_day
- **Completion:** `complete_reading` RPC (atomic, supports re-completion without double XP)
- **Community:** Today's Wall feed, wall posts (reflection + thought), 4 emoji reactions, ComposeModal, `useCommunityFeed` hook
- **Friends:** Friend discovery via search, accept/decline, `useFriends` hook, `useNudge` hook
- **Badges:** 36 badges, `check_and_award_badges` RPC
- **Admin:** Quest builder (CRUD for quests + daily readings), engagement dashboard (with wall post moderation), announcements manager
- **Quest Builder fields:** Currently supports `passage_reference`, `passage_text`, `is_milestone`, `milestone_note` per quest_day
- **PWA:** `vite-plugin-pwa` with `injectManifest` mode, custom service worker for push + precache
- **Supabase client:** `createClient()` without Database generic — all results explicitly cast at call sites (this is intentional, do NOT change)

---

## PHASE 6 SCOPE — BUILD THESE FEATURES

### 6.1 — SQL Migration: `supabase/migrations/013_phase6_reading_hints.sql`

Create a single migration file that adds the reading hint column:

```sql
-- Migration 013: Add reading_hint column to quest_days
-- Run this in Supabase SQL Editor BEFORE deploying the new frontend code.

-- A short 1-2 sentence prompt/question to help students engage with the passage.
-- Example: "What do you think Luke meant when he said 'it was handed down' and why was that important?"
-- Can be populated by Clay manually, by AI, or left NULL (hint button won't show).
ALTER TABLE quest_days ADD COLUMN IF NOT EXISTS reading_hint TEXT;

-- Notify PostgREST to pick up the schema change
NOTIFY pgrst, 'reload schema';
```

**That's it for the migration.** One column. No new tables, no RPC changes, no RLS changes (quest_days already has authenticated SELECT + leader/admin write policies).

---

### 6.2 — Update TypeScript Types

In `src/types/database.ts`, add `reading_hint` to the QuestDay type:

```typescript
// Add to existing QuestDay interface:
reading_hint?: string | null;
```

---

### 6.3 — Reading Hint on PassageStep

Modify `src/components/reading/PassageStep.tsx` to show a "Reading Hint" section.

**Behavior:**
- Only visible when the current quest_day has a non-null, non-empty `reading_hint` value
- Appears as a collapsible section on the PassageStep, below the Scripture Summary (if present) and above the "Continue" button
- **Collapsed by default** — shows a button/row: 💡 "Help with this passage" (or similar)
- Tapping expands to reveal the hint text in a styled card
- The hint is a short prompt/question (1-2 sentences) designed to guide the student's reading
- Use a gentle expand/collapse animation (CSS transition on max-height, similar to existing patterns)

**Design:**
- Hint toggle row: lightbulb icon (💡 or Lucide `Lightbulb`) + "Help with this passage" text, teal accent
- Expanded hint card: `bg-tq-navy-light` (or similar card background), rounded-xl, 16px padding, the hint text in `text-tq-text-secondary` or `text-tq-text-primary`, slightly smaller font (14-15px)
- The tone should feel like a friend whispering a helpful tip, not like homework instructions
- Keep it visually lightweight — this is optional help, not a required step

**Example hints (for reference — Clay will write these):**
- Luke 1:1-4: "Luke is writing to a specific person named Theophilus. Why do you think he felt it was important to get the facts straight before telling this story?"
- Matthew 5:1-12: "Each 'blessed' statement flips what the world values upside down. Which one surprises you the most?"
- Acts 2:1-13: "The disciples went from hiding in fear to speaking boldly in public. What changed between Friday and this moment?"

---

### 6.4 — "How to Read the Bible" Guide (Static Carousel)

Create a new component that shows a simple multi-step guide for students who are new to reading the Bible or need a refresher.

**New file:** `src/components/reading/BibleReadingGuide.tsx`

**This is a modal/overlay carousel** with 5-6 slides. It is triggered from THREE places:

1. **Home screen** — A small tappable link/row near the Today's Reading Card (below the card or in a help section): 📖 "How to Read the Bible" — visible to all users, especially helpful for first-timers landing on the Home screen
2. **PassageStep** — A secondary button/link below the reading hint (or in its place if no hint): 📖 "How to read the Bible" — tappable text link
3. **Profile page** — In the settings/info area: 📖 "How to Read the Bible" link (so students can revisit it anytime)

**Carousel slides (content — keep each slide short, 2-4 sentences max):**

**Slide 1: "Don't Overthink It"**
> The Bible can feel overwhelming, but you don't need to understand everything at once. Just start reading today's passage slowly. If something stands out to you, that's enough.

**Slide 2: "Read It More Than Once"**
> Try reading the passage twice. The first time, just let it wash over you. The second time, look for something that surprises you or makes you curious.

**Slide 3: "Ask Simple Questions"**
> As you read, ask yourself: Who is talking? What's happening? Why does this matter? These are the same questions you'll answer in the app — just start noticing them while you read.

**Slide 4: "It's OK to Not Understand"**
> The Bible was written thousands of years ago to people in very different cultures. If something confuses you, that's normal! Write what you DO understand, and ask Clay or a leader about the rest.

**Slide 5: "Make It Personal"**
> The Bible isn't just an old book — it's God's way of speaking to you today. As you read, ask: "What is this saying to ME right now?" Your honest answer is always the right answer.

**Slide 6: "You're Not Behind"**
> Whether this is your first time reading the Bible or your hundredth, you belong here. Every day you show up is a win. God meets you where you are.

**Design:**
- Full-screen modal overlay with `bg-tq-bg/90` backdrop (dark, semi-transparent)
- **Slide cards are WHITE** (`bg-white` or `#FFFFFF`) with dark text — this is an intentional contrast break from the dark theme to make the guide feel special, like a spotlight moment. The white cards pop against the dark overlay and make the content feel clean and easy to read.
- Slide card: `rounded-2xl`, `p-6`, `mx-4`, centered vertically with `max-w-sm`, subtle shadow (`shadow-xl`)
- Title text: `text-tq-bg` (dark navy, #1A1D2E) or `text-gray-900`, bold (700-800 weight)
- Body text: `text-gray-700` or `text-gray-600`, regular weight, 15-16px
- Each slide has a small emoji/icon at top (centered, ~32-40px), the bold title below it, then the body text
- Navigation: dot indicators below the card (teal for active, gray for inactive) + "Next" / "Back" buttons
- Buttons: "Back" as text-only (muted), "Next" as teal filled button. On final slide, "Next" becomes "Got It!" 
- Brand teal accents on dots and primary button — the white card + teal buttons still feel on-brand
- Nunito font, mobile-first
- Slide transitions: simple fade or slide-left animation (200-300ms)

**Implementation notes:**
- This is 100% static content — no database, no API, no state persistence
- Use React state for current slide index
- The carousel content is hardcoded in the component (or a constants file)
- Touch swipe support is nice-to-have, not required — buttons are sufficient
- The guide should be **accessible from both PassageStep and ProfilePage** via the same component

---

### 6.5 — Update Quest Builder for Reading Hints

Modify `src/components/admin/QuestBuilder.tsx` to include the reading hint field in the quest day editor.

**Changes:**
- Add a `reading_hint` textarea field to each quest day row in the editor
- Label: "Reading Hint (optional)" with helper text: "A short question or tip to help students engage with this passage. 1-2 sentences."
- Place it below the existing `passage_text` (Scripture Summary) field
- Same styling as other textareas in the quest builder
- Character limit indicator (suggest max ~200 chars, but don't hard-enforce — just show the count)
- The field saves to `quest_days.reading_hint` alongside other quest day data

**Make sure** the Quest Builder's existing save/update logic includes `reading_hint` in the INSERT and UPDATE queries for quest_days.

---

### 6.6 — Verify Devotional Summaries Still Work

The existing `passage_text` field on `quest_days` stores devotional summaries (populated from `seed_summaries_matthew.sql` and `seed_summaries_luke_acts.sql`). These show on `PassageStep` under a "Scripture Summary" heading.

**Verify that:**
- The Scripture Summary section still renders correctly on PassageStep
- The new reading hint section doesn't conflict with or replace the summary section
- Both can coexist: a passage can have BOTH a summary (passage_text) AND a reading hint (reading_hint)
- If a passage has neither, PassageStep just shows the passage reference + Bible encouragement (existing behavior)

---

## BUILD ORDER

Build in this order to minimize risk and allow incremental testing:

1. **Migration** (`013_phase6_reading_hints.sql`) — write the file, add comment that it must be run manually
2. **TypeScript types** — update `database.ts` with `reading_hint` field
3. **BibleReadingGuide carousel** — build as standalone component first, test in isolation
4. **PassageStep modifications** — add reading hint section + "How to Read the Bible" link, wire up BibleReadingGuide
5. **Quest Builder update** — add reading_hint field to the editor
6. **HomePage link** — add "How to Read the Bible" link near the Today's Reading Card
7. **ProfilePage link** — add "How to Read the Bible" link to profile settings area
8. **Verify existing summaries** — confirm passage_text/Scripture Summary still works alongside new features
9. **`npm run build`** — verify clean build, no TypeScript errors

---

## TESTING CHECKLIST

After building, verify:

- [ ] `npm run build` passes cleanly
- [ ] PassageStep with reading_hint shows the collapsed "Help with this passage" button
- [ ] Tapping the button expands to show the hint text
- [ ] PassageStep WITHOUT reading_hint does NOT show the hint button (no empty state, no broken UI)
- [ ] PassageStep with BOTH passage_text AND reading_hint shows both sections correctly
- [ ] PassageStep with ONLY passage_text (no reading_hint) still shows Scripture Summary normally
- [ ] "How to Read the Bible" link on HomePage opens the carousel modal
- [ ] "How to Read the Bible" link on PassageStep opens the carousel modal
- [ ] "How to Read the Bible" link on ProfilePage opens the same carousel modal
- [ ] Carousel slides have WHITE backgrounds with dark text (not dark theme)
- [ ] Carousel navigates through all 6 slides with Next/Back buttons
- [ ] Final slide "Got It!" button closes the modal
- [ ] Dot indicators show teal for active slide, gray for others
- [ ] Carousel respects brand guidelines (teal accents, Nunito font) while using white cards
- [ ] Quest Builder shows reading_hint textarea for each quest day
- [ ] Quest Builder saves reading_hint to the database
- [ ] Quest Builder loads existing reading_hint values when editing a quest
- [ ] Existing Phase 1–5B features all still work (daily reading loop, community feed, friends, badges, journey map, etc.)
- [ ] Mobile layout looks correct (no overflow, proper padding, touch targets ≥ 44×44px)

---

## FILES YOU'LL CREATE OR MODIFY

**New files:**
- `supabase/migrations/013_phase6_reading_hints.sql`
- `src/components/reading/BibleReadingGuide.tsx`

**Modified files:**
- `src/types/database.ts` — add `reading_hint` to QuestDay type
- `src/components/reading/PassageStep.tsx` — add reading hint section + Bible guide link
- `src/components/admin/QuestBuilder.tsx` — add reading_hint field to quest day editor
- `src/pages/HomePage.tsx` — add "How to Read the Bible" link near Today's Reading Card
- `src/pages/ProfilePage.tsx` — add "How to Read the Bible" link in settings area

---

## CRITICAL RULES

1. **Tailwind v3** — we are on Tailwind CSS v3, NOT v4. Do not use v4 syntax.
2. **Supabase client is untyped** — all query results must be explicitly cast using types from `src/types/database.ts`. Do NOT add a generic type parameter to `createClient()`.
3. **Migrations don't auto-run** — add clear comments in the SQL file that it must be manually run in Supabase SQL Editor.
4. **`null !== false`** — when checking booleans or nullable strings from the DB, check for truthiness carefully. `reading_hint` will be `null` for existing quest_days — handle this gracefully (don't show the hint section).
5. **Brand guidelines** — all new UI must follow `docs/BRAND-GUIDELINES.md`. Dark mode only. Use `tq-*` color classes. Nunito font. 16px card radius, 12px button/input radius.
6. **Mobile-first** — max content width 428px, 16px horizontal padding. Touch targets minimum 44×44px.
7. **No breaking changes** — Phases 1–5B features must continue working. The daily reading loop is sacred. The Scripture Summary (passage_text) must still display correctly.
8. **Font size 16px minimum on inputs** — prevents iOS auto-zoom.
9. **`npm run build` must pass** — no TypeScript errors, no unused imports that fail strict mode. Verify the build compiles cleanly after each feature.
10. **Reuse existing components** — `Button`, `Card`, modal patterns, entrance animations. Don't reinvent. Match the visual language of existing modals (like AvatarLightbox or QRCodeModal).
11. **Keep it lightweight** — this phase is small and focused. No new dependencies needed. No new hooks needed (the quest_day data already comes through `useQuest`). No RPC changes.

---

## TONE GUIDANCE FOR STATIC CONTENT

The "How to Read the Bible" guide is written for 6th–12th graders (ages 11–18). The tone should be:
- **Warm and encouraging**, never preachy or condescending
- **Short sentences**, casual language, contractions are good
- **Reassuring** — many of these kids may be reading the Bible for the first time and feel intimidated
- **Honest** — acknowledge that the Bible can be confusing, that's OK
- Written like a cool youth leader talking to you, not a textbook

The reading hints (per-passage) follow the same tone. They're meant to be a **conversation starter**, not a quiz question. Think: "Here's something interesting to look for" not "Answer the following comprehension question."

---

*Phase 6 target: Passage Helper & Reading Guide — give students the tools to engage with Scripture confidently, even when it's unfamiliar.*
