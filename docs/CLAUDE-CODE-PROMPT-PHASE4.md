# Transform Quest — Phase 4 Build Prompt (Community Feed)

> **Paste this into Claude Code at the start of your Phase 4 session.**
> Phases 1–3B are complete and deployed. This phase renames the Friends tab to "Community" and adds a daily reflection-sharing feed with emoji reactions, while preserving all existing friend functionality.

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
cat src/hooks/useAuth.ts
cat src/hooks/useQuest.ts
cat src/pages/FriendsPage.tsx
cat src/components/reading/CelebrationStep.tsx
cat src/components/friends/FriendCard.tsx
cat src/components/friends/FriendsList.tsx
cat src/lib/supabase.ts
```

---

## WHAT EXISTS (DO NOT REBUILD)

Phases 1–3B are complete and passing (`npm run build` → ~546KB JS, 32KB CSS). Key existing pieces:

- **Auth:** Google OAuth + magic link via Supabase, `useAuth` hook with `{ user, session, profile, loading, signOut, refreshProfile, patchProfile }`
- **Profiles:** `profiles` table with `role`, `onboarding_completed`, `avatar_type`, `avatar_preset`, `avatar_url`
- **Quest system:** Multi-quest support (`quests` + `quest_days` tables), `useQuest` + `useQuestHistory` hooks
- **Reading flow:** 7-step flow (passage → 3 questions → celebration → friend streaks → done) in `ReadingFlowPage.tsx`
- **Completion:** `complete_reading` RPC (atomic insert + streak/XP/level + milestone/quest bonuses + badges + mutual streaks)
- **Friends:** Friend discovery via user search, accept/decline, `useFriends` hook. `FriendsPage.tsx` with friend list, pending requests, and nudge buttons.
- **Nudges:** `send_nudge` RPC, daily limit, `useNudge` hook
- **Badges:** 36 badges, `check_and_award_badges` RPC, badges grid on profile
- **Celebration:** Confetti, streak count-up, XP fly-up, milestone flair, new badges notification
- **Share:** Web Share API + clipboard fallback via `ShareButton.tsx`
- **Admin:** Quest builder, engagement dashboard, announcements manager at `/admin`
- **Avatar:** `Avatar.tsx` component with preset emoji + custom photo support, sm/md/lg sizes
- **Supabase client:** `createClient()` without Database generic — all results explicitly cast at call sites (this is intentional, do NOT change)

---

## PHASE 4 SCOPE — BUILD THESE FEATURES

### 4.1 — SQL Migration: `supabase/migrations/008_phase4_community.sql`

Create a single migration file that adds everything the community feed needs:

**A. `wall_posts` table:**
```sql
CREATE TABLE wall_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quest_day_id    UUID REFERENCES quest_days(id) ON DELETE CASCADE,
  post_type       TEXT NOT NULL CHECK (post_type IN ('reflection', 'thought')),
  visibility      TEXT NOT NULL CHECK (visibility IN ('friends', 'everyone')) DEFAULT 'friends',
  -- For 'reflection' type: which answers are shared (booleans)
  share_answer_1  BOOLEAN DEFAULT false,
  share_answer_2  BOOLEAN DEFAULT false,
  share_answer_3  BOOLEAN DEFAULT false,
  -- For 'thought' type: freeform text
  thought_text    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  -- Constraints
  CONSTRAINT valid_post_content CHECK (
    (post_type = 'reflection' AND (share_answer_1 OR share_answer_2 OR share_answer_3))
    OR
    (post_type = 'thought' AND thought_text IS NOT NULL AND LENGTH(TRIM(thought_text)) > 0)
  )
);

-- Index for efficient feed queries (today's posts, most recent first)
CREATE INDEX idx_wall_posts_quest_day ON wall_posts(quest_day_id, created_at DESC);
CREATE INDEX idx_wall_posts_user ON wall_posts(user_id, created_at DESC);
```

**B. `wall_reactions` table:**
```sql
CREATE TABLE wall_reactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type   TEXT NOT NULL CHECK (reaction_type IN ('heart', 'prayer', 'fire', 'me_too')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)  -- one of each type per user per post
);

CREATE INDEX idx_wall_reactions_post ON wall_reactions(post_id);
```

**C. RLS policies for `wall_posts`:**

SELECT policy — a user can see a post if:
1. They are the author, OR
2. The post `visibility = 'everyone'` AND the user is on the same quest (has the same `quest_day_id`'s quest), OR
3. The post `visibility = 'friends'` AND the user has an accepted friendship with the author

Implementation note: For the "friends" visibility check, join against `friendships` where `status = 'accepted'` and the current user is either `user_a` or `user_b`. For the "everyone" visibility, no friendship check needed — just verify the viewer is authenticated.

```sql
-- SELECT: author can always see own posts; others based on visibility
CREATE POLICY wall_posts_select ON wall_posts FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR visibility = 'everyone'
  OR (
    visibility = 'friends' AND EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
      AND (
        (user_a = auth.uid() AND user_b = wall_posts.user_id)
        OR (user_a = wall_posts.user_id AND user_b = auth.uid())
      )
    )
  )
);

-- INSERT: authenticated users can create their own posts
CREATE POLICY wall_posts_insert ON wall_posts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- DELETE: users can delete their own posts
CREATE POLICY wall_posts_delete ON wall_posts FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Leaders/admins can see and delete any post (moderation)
CREATE POLICY wall_posts_leader_select ON wall_posts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('leader', 'admin'))
);
CREATE POLICY wall_posts_leader_delete ON wall_posts FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('leader', 'admin'))
);
```

**D. RLS policies for `wall_reactions`:**
```sql
-- SELECT: if you can see the post, you can see its reactions
-- (simplify: all authenticated can SELECT — the post-level RLS already gates visibility)
CREATE POLICY wall_reactions_select ON wall_reactions FOR SELECT TO authenticated USING (true);

-- INSERT: authenticated users can react to posts they can see
CREATE POLICY wall_reactions_insert ON wall_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- DELETE: users can remove their own reactions
CREATE POLICY wall_reactions_delete ON wall_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

**E. Enable RLS on both tables:**
```sql
ALTER TABLE wall_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wall_reactions ENABLE ROW LEVEL SECURITY;
```

**F. Helper view or function — `get_wall_feed`:**

Create an RPC that returns today's wall posts with joined data (author profile, reaction counts, user's own reactions, and the actual answer text from completions). This avoids complex client-side joins.

```sql
CREATE OR REPLACE FUNCTION get_wall_feed(p_quest_day_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_user_id UUID := auth.uid();
BEGIN
  SELECT COALESCE(jsonb_agg(post_data ORDER BY post_data->>'created_at' DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT jsonb_build_object(
      'id', wp.id,
      'user_id', wp.user_id,
      'post_type', wp.post_type,
      'visibility', wp.visibility,
      'share_answer_1', wp.share_answer_1,
      'share_answer_2', wp.share_answer_2,
      'share_answer_3', wp.share_answer_3,
      'thought_text', wp.thought_text,
      'created_at', wp.created_at,
      -- Author info
      'author_name', p.display_name,
      'author_avatar_type', p.avatar_type,
      'author_avatar_preset', p.avatar_preset,
      'author_avatar_url', p.avatar_url,
      -- Shared answers (from the user's completion for this quest_day)
      'answer_1', CASE WHEN wp.share_answer_1 THEN c.answer_1 ELSE NULL END,
      'answer_2', CASE WHEN wp.share_answer_2 THEN c.answer_2 ELSE NULL END,
      'answer_3', CASE WHEN wp.share_answer_3 THEN c.answer_3 ELSE NULL END,
      -- Reaction counts
      'reactions', (
        SELECT COALESCE(jsonb_object_agg(reaction_type, cnt), '{}'::jsonb)
        FROM (
          SELECT reaction_type, COUNT(*) as cnt
          FROM wall_reactions WHERE post_id = wp.id
          GROUP BY reaction_type
        ) rc
      ),
      -- Current user's reactions on this post
      'my_reactions', (
        SELECT COALESCE(jsonb_agg(reaction_type), '[]'::jsonb)
        FROM wall_reactions WHERE post_id = wp.id AND user_id = v_user_id
      ),
      -- Whether current user is the author
      'is_mine', (wp.user_id = v_user_id)
    ) as post_data
    FROM wall_posts wp
    JOIN profiles p ON p.id = wp.user_id
    LEFT JOIN completions c ON c.user_id = wp.user_id AND c.quest_day_id = wp.quest_day_id
    WHERE wp.quest_day_id = p_quest_day_id
    -- Visibility filtering
    AND (
      wp.user_id = v_user_id
      OR wp.visibility = 'everyone'
      OR (
        wp.visibility = 'friends' AND EXISTS (
          SELECT 1 FROM friendships
          WHERE status = 'accepted'
          AND (
            (user_a = v_user_id AND user_b = wp.user_id)
            OR (user_a = wp.user_id AND user_b = v_user_id)
          )
        )
      )
    )
  ) sub;

  RETURN v_result;
END;
$$;
```

**G. `toggle_reaction` RPC:**
```sql
CREATE OR REPLACE FUNCTION toggle_reaction(p_post_id UUID, p_reaction_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing UUID;
BEGIN
  -- Check if reaction already exists
  SELECT id INTO v_existing
  FROM wall_reactions
  WHERE post_id = p_post_id AND user_id = v_user_id AND reaction_type = p_reaction_type;

  IF v_existing IS NOT NULL THEN
    -- Remove it (toggle off)
    DELETE FROM wall_reactions WHERE id = v_existing;
    RETURN jsonb_build_object('action', 'removed', 'reaction_type', p_reaction_type);
  ELSE
    -- Add it (toggle on)
    INSERT INTO wall_reactions (post_id, user_id, reaction_type)
    VALUES (p_post_id, v_user_id, p_reaction_type);
    RETURN jsonb_build_object('action', 'added', 'reaction_type', p_reaction_type);
  END IF;
END;
$$;
```

**H. `create_wall_post` RPC:**
```sql
CREATE OR REPLACE FUNCTION create_wall_post(
  p_quest_day_id UUID,
  p_post_type TEXT,
  p_visibility TEXT DEFAULT 'friends',
  p_share_answer_1 BOOLEAN DEFAULT false,
  p_share_answer_2 BOOLEAN DEFAULT false,
  p_share_answer_3 BOOLEAN DEFAULT false,
  p_thought_text TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  -- For reflection posts, verify user actually has a completion for this quest_day
  IF p_post_type = 'reflection' THEN
    IF NOT EXISTS (
      SELECT 1 FROM completions WHERE user_id = v_user_id AND quest_day_id = p_quest_day_id
    ) THEN
      RAISE EXCEPTION 'Cannot share reflections without completing the reading first';
    END IF;
  END IF;

  INSERT INTO wall_posts (user_id, quest_day_id, post_type, visibility, share_answer_1, share_answer_2, share_answer_3, thought_text)
  VALUES (v_user_id, p_quest_day_id, p_post_type, p_visibility, p_share_answer_1, p_share_answer_2, p_share_answer_3, p_thought_text)
  RETURNING id INTO v_post_id;

  RETURN v_post_id;
END;
$$;
```

**Important:** This migration must be manually run in the Supabase SQL Editor dashboard. Add a comment at the top of the file reminding Tim of this.

---

### 4.2 — TypeScript Types

**Update `src/types/database.ts`** — add these interfaces:

```typescript
export interface WallPost {
  id: string;
  user_id: string;
  quest_day_id: string;
  post_type: 'reflection' | 'thought';
  visibility: 'friends' | 'everyone';
  share_answer_1: boolean;
  share_answer_2: boolean;
  share_answer_3: boolean;
  thought_text: string | null;
  created_at: string;
  // Joined fields from get_wall_feed RPC
  author_name: string;
  author_avatar_type: string;
  author_avatar_preset: string;
  author_avatar_url: string | null;
  answer_1: string | null;
  answer_2: string | null;
  answer_3: string | null;
  reactions: Record<string, number>; // e.g. { heart: 3, prayer: 1 }
  my_reactions: string[]; // e.g. ['heart', 'fire']
  is_mine: boolean;
}

export interface WallReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: 'heart' | 'prayer' | 'fire' | 'me_too';
  created_at: string;
}
```

---

### 4.3 — Community Feed Hook

**File: `src/hooks/useCommunityFeed.ts`**

This is the primary data hook for the Community tab's feed.

```typescript
// Returns:
// {
//   posts: WallPost[],
//   loading: boolean,
//   refetch: () => void,
//   createPost: (params) => Promise<void>,
//   toggleReaction: (postId, reactionType) => Promise<void>,
//   deletePost: (postId) => Promise<void>,
// }
```

Key implementation details:
- Calls `get_wall_feed` RPC with today's `quest_day_id` (get this from `useQuest`)
- `createPost` calls `create_wall_post` RPC, then refetches
- `toggleReaction` calls `toggle_reaction` RPC. **Optimistic UI update:** immediately toggle the reaction in local state before the RPC responds, then reconcile on response. This makes reactions feel instant.
- `deletePost` deletes from `wall_posts` where `id = postId AND user_id = auth.uid()`, then refetches
- Auto-refetch on mount and when the quest day changes
- Handle the case where there is no active quest or no quest day (return empty array)

---

### 4.4 — Rename Friends Tab → Community

**Modify `src/components/layout/BottomNav.tsx`:**
- Change the "Friends" tab label to **"Community"**
- Change the icon from `Users` to `MessageCircle` (from Lucide React) — this better represents a feed/discussion space
- Route remains `/friends` for now (or rename to `/community` — see routing note below)

**Modify `src/App.tsx`:**
- Add route: `/community` → `CommunityPage` (new page)
- Keep `/friends` as a redirect to `/community` for backwards compatibility (or just rename in place — your call based on how the existing routes are set up)

**Modify all references** to "Friends" in navigation, routing, and any text that references the tab name.

---

### 4.5 — Community Page (Redesigned FriendsPage)

**File: `src/pages/CommunityPage.tsx`** (replaces or wraps `FriendsPage.tsx`)

The Community page has two sections accessed via a **segmented control** (pill toggle) at the top:

**Tab 1: "Today's Wall"** (default, shown first)
- Header: today's passage reference (e.g., "Matthew 5:1-16") as context
- If user has completed today's reading: show the feed of posts
- If user has NOT completed today's reading: show a friendly message ("Complete today's reading to see what others are sharing!" with a CTA button to start reading)
- Compose button (floating or at top): "Share a thought..." — opens the compose modal
- Post cards listed newest-first

**Tab 2: "Friends"**
- This is the **existing FriendsPage content**, moved here as a sub-view
- Friend discovery/search, pending requests, friend list with streaks + nudge buttons
- All existing `useFriends` and `useNudge` functionality stays intact

**Segmented control styling:**
- Two pills side by side: "Today's Wall" | "Friends"
- Active pill: `bg-tq-teal text-tq-bg` (dark text on teal)
- Inactive pill: `bg-tq-surface text-tq-text-sec`
- Full width, `rounded-xl`, height 40px
- Use the same brand system — reference `BRAND-GUIDELINES.md`

---

### 4.6 — Wall Post Card Component

**File: `src/components/community/WallPostCard.tsx`**

Each post in the feed is a card showing:

**Header row:**
- `Avatar` component (sm size) — reuse existing `Avatar.tsx`
- Author display name (bold, `text-tq-text`)
- Timestamp (relative: "2m ago", "1h ago", "5h ago") in `text-tq-text-muted`
- If `is_mine`: a small delete button (trash icon, `text-tq-text-muted`, confirms before deleting)
- Visibility indicator: small icon — lock for "friends", globe for "everyone" — in `text-tq-text-muted`

**Body:**
- If `post_type === 'reflection'`: show shared answers with question labels
  - For each shared answer (1, 2, 3), show:
    - **Label** in `text-tq-text-sec` + `text-xs`: "What it says", "How it applies", "What I'll do"
    - **Answer text** in `text-tq-text` + `text-sm`
  - Only show answers where `share_answer_N` is true
- If `post_type === 'thought'`: show `thought_text` in `text-tq-text` + `text-sm`

**Reaction bar (bottom of card):**
- Four emoji buttons in a row: ❤️ 🙏 🔥 🤝
- Each shows the emoji + count (if > 0)
- If the current user has reacted with that type, the button gets a subtle highlight (`bg-tq-surface-2` or a light tint of the emoji's associated color)
- Tapping toggles the reaction (calls `toggleReaction` from the hook)
- Reactions should feel snappy — optimistic update, no loading spinner

**Card styling:**
- `bg-tq-surface rounded-2xl p-4` with `border border-tq-border` (subtle)
- Consistent with other cards in the app
- Cards should have the same stagger entrance animation used elsewhere in the app

---

### 4.7 — Compose / Share Modal

**File: `src/components/community/ComposeModal.tsx`**

A bottom-sheet style modal for creating a new wall post. Two entry points trigger this:

**Entry point 1: From the celebration flow (after completing a reading)**
- Add a new step in the reading flow (between CelebrationStep and FriendStreaksStep, or integrated into CelebrationStep)
- Shows: "Share with the community?" with options to toggle which answers to share
- Pre-selects all three answers; user can deselect any
- "Or write a thought instead" link that switches to freeform input
- Visibility toggle: "Friends" | "Everyone" (pill selector, defaults to "Friends")
- "Share" button (tq-teal CTA) + "Skip" link
- On submit: calls `createPost`, then continues the reading flow

**Entry point 2: From the Community tab (compose button)**
- Same modal, but opened via a floating action button or "Share a thought..." prompt card at the top of the feed
- If user has completed today's reading: shows both reflection sharing AND freeform thought options
- If user has NOT completed today's reading: only shows the freeform thought option (they can't share reflections they haven't written yet)
- Same visibility toggle and submit behavior

**Modal design:**
- Slides up from bottom (like a native action sheet)
- Dark overlay behind it (`bg-black/50`)
- `bg-tq-surface rounded-t-2xl` with a grab handle bar at top
- Smooth transition (use CSS transition or framer-motion if already in the project — check first)
- Closes on overlay tap or swipe down

**Compose content:**
- **Reflection sharing mode:**
  - Three toggle rows, one per answer:
    - Checkbox/toggle + question label + first ~60 chars of the answer as preview
    - Example: `[✓] What it says: "Jesus teaches about being salt and light..."` (truncated)
  - At least one must be selected to submit
- **Thought mode:**
  - Textarea with placeholder "What's on your mind about today's reading?"
  - Character count (max 280 characters — keeps it concise like the reflection answers)
  - 16px minimum font size on the textarea (prevents iOS zoom)
- **Visibility toggle:** Two-option pill selector: 🔒 Friends | 🌍 Everyone
- **Submit button:** "Share" — `bg-tq-teal`, full width, disabled until valid content exists

---

### 4.8 — Integration with Reading Flow

**Modify `src/pages/ReadingFlowPage.tsx`:**

Add a new step to the reading flow. The current flow is:
1. PassageStep
2. QuestionStep (×3)
3. CelebrationStep
4. FriendStreaksStep
5. DoneStep (or similar final step)

Insert a **ShareStep** between CelebrationStep and FriendStreaksStep:

**File: `src/components/reading/ShareStep.tsx`**

- Header: "Share with the community?" in brand heading style
- Shows the three reflection answers the user just wrote, each with a toggle to share
- All three default to ON (encourage sharing)
- "Or write a thought instead" toggle to switch to freeform
- Visibility selector: Friends | Everyone
- Two CTAs: "Share" (tq-teal) and "Skip" (text link below)
- After sharing or skipping, advance to the next step in the flow
- This step is optional — skipping is always prominent and easy

**Important:** The reading flow step count changes. Update `ProgressDots.tsx` if it hardcodes the number of steps, or make it dynamic based on the steps array.

---

### 4.9 — Empty States & Edge Cases

**No posts yet today:**
- Show a friendly illustration or icon (e.g., `MessageCircle` from Lucide at 48px, `text-tq-text-muted`)
- Text: "No one has shared yet today. Be the first!" with a "Share a thought" CTA button
- Use the same empty state styling as elsewhere in the app

**User hasn't completed today's reading:**
- Feed is still visible (they can see others' posts — this motivates them to complete!)
- But the compose button only allows freeform thoughts, not reflection sharing
- Show a subtle banner at top: "Complete today's reading to share your reflections" with a "Start Reading" button

**No active quest:**
- Show: "No active quest right now. Check back soon!" (same pattern as existing empty states)

**Post deletion:**
- Confirm dialog: "Delete this post?" with "Delete" (red/destructive) and "Cancel" buttons
- On delete: optimistic removal from feed, then API call

**Long answer text:**
- Truncate shared answers at ~200 characters with a "Show more" toggle if they exceed that
- Thought text is already limited to 280 characters at input time

---

### 4.10 — Admin Moderation (Lightweight)

**Update `src/components/admin/EngagementDashboard.tsx`** (or add a new admin tab):

Leaders/admins should be able to see all wall posts (regardless of visibility) and delete inappropriate ones. This can be lightweight for now:

- Add a "Recent Posts" section to the Engagement Dashboard showing the last 20 wall posts across all users
- Each post shows: author name, post type, visibility, content preview, timestamp
- Delete button on each post (with confirmation)
- This uses the leader RLS policies defined in the migration

---

## IMPLEMENTATION ORDER

Build in this sequence to minimize dependency issues:

1. **Migration `008_phase4_community.sql`** — all DB changes, RLS, RPCs
2. **TypeScript types** — update `src/types/database.ts` with WallPost, WallReaction
3. **`useCommunityFeed` hook** — data layer for feed
4. **`WallPostCard` component** — individual post card with reactions
5. **`ComposeModal` component** — bottom sheet for creating posts
6. **`CommunityPage`** — new page with segmented control (Today's Wall + Friends)
7. **Rename Friends → Community** — BottomNav, routing, all references
8. **`ShareStep` in reading flow** — new step between celebration and friend streaks
9. **Empty states and edge cases** — no posts, no quest, hasn't completed
10. **Admin moderation** — recent posts in engagement dashboard
11. **Polish** — animations, loading states, optimistic updates

---

## CRITICAL RULES

1. **Tailwind v3** — we are on Tailwind CSS v3, NOT v4. Do not use v4 syntax.
2. **Supabase client is untyped** — all query results must be explicitly cast using types from `src/types/database.ts`. Do NOT add a generic type parameter to `createClient()`.
3. **Migrations don't auto-run** — add clear comments in the SQL file that it must be manually run in Supabase SQL Editor.
4. **`null !== false`** — when checking booleans from the DB (like `share_answer_1`), check for truthiness carefully.
5. **Brand guidelines** — all new UI must follow `docs/BRAND-GUIDELINES.md`. Dark mode only. Use `tq-*` color classes. Nunito font. 16px card radius, 12px button/input radius.
6. **Mobile-first** — max content width 428px, 16px horizontal padding. Touch targets minimum 44×44px.
7. **No breaking changes** — Phases 1–3B features must continue working. The daily reading loop is sacred.
8. **Font size 16px minimum on inputs** — prevents iOS auto-zoom.
9. **`npm run build` must pass** — no TypeScript errors, no unused imports that fail strict mode. Verify the build compiles cleanly after each major feature.
10. **File organization** — community components go in `src/components/community/`. New hooks go in `src/hooks/`. Follow PascalCase for components, camelCase for utilities.
11. **Optimistic UI for reactions** — reactions must feel instant. Update local state immediately, reconcile with server response.
12. **Reuse existing components** — `Avatar.tsx`, `Button`, `Card`, skeleton loaders, entrance animations. Don't reinvent.

---

## TESTING CHECKLIST

After building, verify:

- [ ] `npm run build` passes cleanly
- [ ] Bottom nav shows "Community" with MessageCircle icon (not "Friends")
- [ ] Community page loads with "Today's Wall" and "Friends" tabs
- [ ] Friends tab contains all existing friend functionality (discovery, requests, list, nudge)
- [ ] Feed shows posts from friends when visibility = 'friends'
- [ ] Feed shows posts from all quest participants when visibility = 'everyone'
- [ ] User can share reflection answers after completing a reading (via ShareStep)
- [ ] User can post a freeform thought from the Community tab
- [ ] User can toggle visibility between Friends and Everyone when composing
- [ ] All four emoji reactions work (heart, prayer, fire, me_too) with toggle behavior
- [ ] Reactions update optimistically (no loading delay)
- [ ] User can delete their own posts (with confirmation)
- [ ] Feed shows empty state when no posts exist
- [ ] User who hasn't completed today's reading can still see posts but can only post thoughts (not reflections)
- [ ] ShareStep in reading flow works (share or skip, then continue to friend streaks)
- [ ] Leaders/admins can see and delete any post in the engagement dashboard
- [ ] Existing Phase 1–3B features still work (reading flow, friends, nudges, badges, share, admin, quests, journey map)

---

## FILES YOU'LL CREATE OR MODIFY

**New files:**
- `supabase/migrations/008_phase4_community.sql`
- `src/pages/CommunityPage.tsx`
- `src/hooks/useCommunityFeed.ts`
- `src/components/community/WallPostCard.tsx`
- `src/components/community/ComposeModal.tsx`
- `src/components/community/TodaysWall.tsx` (feed container component)
- `src/components/community/ComposeButton.tsx` (floating or inline compose trigger)
- `src/components/reading/ShareStep.tsx`

**Modified files:**
- `src/types/database.ts` — add WallPost, WallReaction interfaces
- `src/App.tsx` — add `/community` route (and redirect from `/friends` if renaming)
- `src/components/layout/BottomNav.tsx` — rename Friends → Community, update icon
- `src/pages/ReadingFlowPage.tsx` — add ShareStep to the flow
- `src/components/reading/ProgressDots.tsx` — handle updated step count
- `src/components/admin/EngagementDashboard.tsx` — add recent posts moderation section

**Preserved files (move existing content into CommunityPage):**
- `src/pages/FriendsPage.tsx` — content moves into the "Friends" tab of CommunityPage. Either refactor FriendsPage into a sub-component or import its content. Do not lose any existing functionality.

---

*Phase 4 target: Community Feed — give students a reason to come back to the app between readings and build the peer accountability Clay wants.*
