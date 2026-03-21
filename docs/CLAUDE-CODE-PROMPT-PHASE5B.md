# Transform Quest — Phase 5B Build Prompt (Polish & Delight)

> **Paste this into Claude Code at the start of your Phase 5B session.**
> Phases 1–5 are complete and deployed (~471KB JS, 36KB CSS). This phase adds premium animations, cosmetic unlocks, and UX polish to make the app feel alive and rewarding — not just functional.

---

## CONTEXT LOADING

Before writing ANY code, read these files in order:

```
cat docs/BRAND-GUIDELINES.md
cat docs/SOURCE_OF_TRUTH.md
```

Then read the specific files you'll be modifying:

```
cat src/components/quest/JourneyMap.tsx
cat src/pages/QuestsPage.tsx
cat src/pages/HomePage.tsx
cat src/pages/ProfilePage.tsx
cat src/components/reading/CelebrationStep.tsx
cat src/components/profile/Avatar.tsx
cat src/components/friends/FriendCard.tsx
cat src/components/community/WallPostCard.tsx
cat src/index.css
cat tailwind.config.js
```

---

## WHAT EXISTS (DO NOT REBUILD)

- **Phase 1–5 complete.** All features are working and deployed. Do not touch auth, onboarding, reading flow logic, RPCs, or push notification infrastructure.
- **Celebration:** `canvas-confetti` already installed. `CelebrationStep.tsx` already shows confetti, streak count-up, XP fly-up, and new badges.
- **Journey Map:** `JourneyMap.tsx` renders a winding SVG path with circular nodes. Completed nodes show a checkmark, upcoming nodes show a number, current node is the next unread day.
- **Avatar:** `Avatar.tsx` renders profile pictures (presets + custom photo uploads). Used in friends lists, wall posts, home screen snippet, and profile page.
- **Cosmetic system:** Does NOT exist yet — this phase introduces it.
- **Animations:** Basic CSS transitions exist. `Fire Icon Pulse` is documented in `BRAND-GUIDELINES.md` but not yet implemented anywhere.

---

## PHASE 5B SCOPE — BUILD THESE FEATURES

### 5B.1 — Journey Map: Animated Avatar Travel

This is the highest-priority feature. When a student lands on `QuestsPage` after completing a reading (i.e., `latestCompletedDayNumber` changed since last render), their avatar should visually travel along the SVG path from the previous node to the current completed node.

#### How it works

The `JourneyMap` SVG already has a winding path. We need to:

1. **Detect post-completion navigation.** Use `sessionStorage` to store the last known `completedDayCount` before reading. When `QuestsPage` mounts and detects `profile.quest_days_completed` (or similar) is higher than the stored value, trigger the travel animation, then update the stored value.

2. **Animate the avatar along the path.** Use CSS `offset-path` / `motion-path` to move a small avatar image along the SVG path from the "from" node position to the "to" node position. The avatar should:
   - Scale up slightly (1.0 → 1.2) as it departs
   - Follow the winding path curve (not a straight line)
   - Have a subtle glow trail behind it using a CSS radial gradient pseudo-element
   - Bounce/settle into the destination node (spring-like: overshoot by 10% then back)
   - Duration: ~1.2 seconds total

3. **Crowd cheer effect.** When the avatar lands on the new node:
   - Trigger a burst of small particle dots (use CSS keyframes, not a library — small colored dots that scatter outward from the node center and fade)
   - The destination node ring should pulse once with a larger ring that expands and fades (scale 1.0 → 2.0, opacity 1 → 0, 600ms)
   - The node fills from empty → tq-success green with a radial fill animation

4. **Camera follow.** The journey map is a scrollable container. When the travel animation starts, `scrollIntoView` the destination node smoothly before the avatar arrives.

**Implementation notes:**
- If `offset-path` has browser compatibility concerns, fall back to a JS-driven linear interpolation between node center coordinates
- The travel animation should only run once per completion — guard with a `hasAnimated` ref so it doesn't re-fire on tab re-focus or re-render
- Respect `prefers-reduced-motion` — if set, skip the travel and just show the node as completed immediately
- The avatar displayed during travel should be the user's actual avatar (from `profile`) — same source `src` as `Avatar.tsx` renders

#### Pulsing "next node" ring

On the journey map, the node for the **next unread day** (the one after the most recently completed) should always have a continuous pulsing ring:
- CSS keyframe: ring scales 1.0 → 1.4 at 25% opacity, repeating, 2s loop
- Color: `tq-teal` (`#00C9A7`)
- This replaces or augments the plain numbered circle for that node

---

### 5B.2 — Cosmetic Unlock: Animated Streak Flame

Introduce the first cosmetic unlock. Students who reach **Day 3** (3 consecutive days completed) automatically unlock the **Animated Flame** cosmetic.

#### What changes visually

When a user has unlocked this cosmetic (check: `profile.total_streak >= 3` OR `profile.max_streak >= 3` — use whichever is more accurate for "has ever hit Day 3"):

- The static `Flame` icon on the Home screen stats row is replaced with an **animated CSS flame**
- The streak count number in the header badge pulses gold when viewed on a day the streak was extended

#### Animated CSS Flame

Build a pure-CSS flame component (`src/components/ui/AnimatedFlame.tsx`) that renders without any library:

```
- 3 layered divs (outer/mid/inner flame) each with border-radius creating a teardrop shape
- Colors from bottom to top: #FF4444 → #FF6B35 → #FFB830 → #FFD470
- Each layer has its own keyframe: slight sway left-right + scale pulse, staggered by 100ms
- Total height: same as the current Flame icon (20px–24px)
- Outer layer sways ±3deg, mid layer ±5deg, inner ±8deg — creates organic feel
- Loop: 1.8s ease-in-out infinite
```

If user has NOT unlocked the animated flame, show the regular static `Flame` icon from Lucide (existing behavior — no regression).

#### How to check unlock in component

In `HomePage.tsx`, pass a prop or read from `profile` context:
```typescript
const hasAnimatedFlame = (profile?.streak_count ?? 0) >= 3 || (profile?.longest_streak ?? 0) >= 3;
```

Use whichever field actually exists in `profiles` — read `src/types/database.ts` to confirm the exact field names before writing this logic.

#### Future unlock scaffolding

Add a `src/lib/cosmeticUnlocks.ts` utility file with a clean interface for future unlocks:

```typescript
export type CosmeticUnlock = 'animated_flame' | 'gold_badge_border' | 'avatar_glow';

export function hasUnlock(profile: Profile, unlock: CosmeticUnlock): boolean {
  switch (unlock) {
    case 'animated_flame':
      return (profile.streak_count ?? 0) >= 3 || (profile.longest_streak ?? 0) >= 3;
    // Future unlocks added here
    default:
      return false;
  }
}
```

This file should be pure logic — no React, no Supabase calls. It just reads `profile` fields and returns boolean.

---

### 5B.3 — XP Level Progress Bar

Add a visual XP progress bar on the **Home screen** (below the stats row) and the **Profile screen** (in the stats section).

#### Design

```
[=====----] Level 4 · Seeker  →  Level 5 · Warrior  (235 / 500 XP)
```

- Pill-shaped track with `tq-surface-2` background
- Fill uses `gradient-quest` (purple → teal, left to right) with width animated via CSS transition
- Label above shows current level title (left) and next level title (right) in `tq-text-sec` caption style
- Label below or inline shows `{currentXP} / {nextLevelXP} XP` in `tq-gold` extrabold
- On page load, the bar should animate from 0% width to the current % over 600ms (`ease-out`)

#### XP to Level Thresholds

Read the existing `xp_to_level` SQL function to confirm exact thresholds. The typical Duolingo-style curve is approximately:

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Seedling | 0 |
| 2 | Seeker | 100 |
| 3 | Wanderer | 250 |
| 4 | Disciple | 500 |
| 5 | Warrior | 900 |
| ... | ... | ... |

**Do not hardcode — read the actual thresholds from `src/lib/` or the existing level calculation logic.** If the thresholds aren't already in a client-side constant, add them to `src/lib/levels.ts`.

#### Component

Create `src/components/ui/XPProgressBar.tsx`. Accept `currentXP: number` and `levelTitle: string` props (resolve next level title inside the component using the threshold table).

Use this component in:
- `src/pages/HomePage.tsx` — below the stats row (streak / XP / quest days cards)
- `src/pages/ProfilePage.tsx` — in the stats/header section near the current XP display

---

### 5B.4 — Profile Picture Tap-to-Expand (Lightbox)

Any profile avatar in the app can be tapped to show a larger version in a centered modal overlay.

#### Scope

Enable tap-to-expand on:
- Your own avatar on `ProfilePage.tsx` (header area)
- Friend avatars in `FriendCard.tsx` / Friends list
- Avatar thumbnails in `WallPostCard.tsx` (Community feed)
- The friend snippet avatars on `HomePage.tsx`

#### Lightbox Component

Create `src/components/ui/AvatarLightbox.tsx`:

```
- Full-screen overlay: rgba(0,0,0,0.85) background, tap anywhere to dismiss
- Centered avatar: 200px circle, white 3px border, subtle tq-purple glow
- Name displayed below the avatar in H2 (white, extrabold)
- Level title below name in tq-purple caption
- Streak count below that with flame icon in tq-gold
- Entrance: scale 0.7 → 1.0 + opacity 0 → 1, 250ms ease-out
- Exit: scale 1.0 → 0.85 + opacity 1 → 0, 150ms ease-in
```

#### Implementation

- Add an `onTap` prop to `Avatar.tsx` — if provided, render the avatar as a button and call `onTap` on click
- Manage lightbox state locally in each parent component (don't add global state) — `const [lightboxUser, setLightboxUser] = useState<{name, avatarUrl, levelTitle, streak} | null>(null)`
- Render `AvatarLightbox` conditionally at the bottom of each parent component
- For `WallPostCard`, the lightbox data is already available from the post's author profile

---

### 5B.5 — Micro-Animations Polish Pass

Implement these small but high-value animation improvements throughout the app. **Do not rebuild any components** — add CSS classes and keyframes to existing ones.

#### 5B.5A — Home Screen Stats Count-Up

The three stat cards on Home (streak / total XP / quest days) should count up from 0 to their current values when the Home screen first mounts.

- Use a custom `useCountUp(target: number, duration: number)` hook in `src/hooks/useCountUp.ts`
- Duration: 800ms, ease-out curve (use a `requestAnimationFrame` loop with an easing function)
- Only trigger on first mount — not on re-renders or tab refocus (use a `hasRun` ref)
- Respect `prefers-reduced-motion` — if set, skip animation and show final value immediately

#### 5B.5B — Weekly Streak Dots Pop-In

The day-of-week streak dots on the Home screen (M T W T F S S row) should pop in with a staggered entrance animation on mount:

```css
@keyframes dot-pop {
  0%   { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
```

Apply `animation-delay` of `0ms, 60ms, 120ms, 180ms, 240ms, 300ms, 360ms` to each dot (Mon–Sun order). Duration 300ms each.

#### 5B.5C — Quest Progress Bar Fill Animation

The progress bar on `QuestsPage` (inside `ActiveQuestCard`) should animate its width from 0% to the actual progress % on mount. Use a CSS `transition: width 600ms ease-out` with a `useEffect` that sets the width after a 1-frame delay (so the browser registers the 0% starting state before transitioning).

#### 5B.5D — Wall Post Slide-Up Entrance

Posts in `CommunityPage` Today's Wall should slide up with a staggered entrance when the feed first loads:

```css
@keyframes post-enter {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
```

Stagger: 80ms per post. Only animate on initial load, not on re-fetch.

#### 5B.5E — Reaction Emoji Bounce

When a user taps a reaction emoji on a `WallPostCard`:
- The emoji briefly scales 1.0 → 1.4 → 1.0 (200ms ease-out then ease-in)
- If this is a "new" reaction (user didn't previously react), show a small "+1" that floats up and fades out above the emoji over 600ms
- Use CSS classes toggled with `useState` — add the class on tap, remove it after the animation duration

#### 5B.5F — Fire Icon Pulse (already documented in Brand Guidelines, now implement it)

In `BRAND-GUIDELINES.md` Section 6, the Fire Icon Pulse is specified but not yet implemented:

> Continuous subtle scale pulse on the home screen when streak is active. `scale(1.0) → scale(1.08) → scale(1.0)`, 2s loop, ease-in-out

Add this to the flame icon in the Home screen header badge **and** in the stats row card, but only when `streak_count > 0`. Use a CSS class:

```css
@keyframes flame-pulse {
  0%, 100% { transform: scale(1.0); }
  50%       { transform: scale(1.08); }
}
.animate-flame-pulse {
  animation: flame-pulse 2s ease-in-out infinite;
}
```

---

### 5B.6 — Badge Reveal Card Flip

When the `CelebrationStep` awards a new badge, instead of just listing the badge name in a text list, reveal each new badge with a card flip animation.

#### Design

```
- Card front: dark surface with a ? icon (centered, tq-purple, 32px)
- Card back: badge icon + badge name + "Earned!" label in tq-gold
- Flip animation: CSS 3D rotateY 0deg → 180deg, 500ms, preserve-3d
- For multiple badges: stagger the flips by 400ms each
- After all badges have flipped, the existing "Continue" button appears
```

#### Implementation

Create `src/components/celebration/BadgeRevealCard.tsx`:
- Accepts `badge: { name: string, icon: string, description: string }` prop
- Accepts `delay: number` prop (ms) for stagger
- Self-manages flip state with `useEffect` + `setTimeout(onFlip, delay)`
- Parent (`CelebrationStep.tsx`) maps over `newBadges` array and renders one `BadgeRevealCard` per badge

Only show this when there are new badges to reveal. If no new badges, `CelebrationStep` continues to work exactly as before.

---

## CRITICAL RULES (carry forward from all prior phases)

1. **Tailwind v3** — we are on Tailwind CSS v3, NOT v4. Do not use v4 syntax.
2. **Supabase client is untyped** — all query results must be explicitly cast using types from `src/types/database.ts`. Do NOT add a generic type parameter to `createClient()`.
3. **`null !== false`** — when checking booleans from the DB, check for truthiness carefully (e.g. `profile.onboarding_completed === true`, not `!!profile.onboarding_completed` if the column could be null).
4. **Brand guidelines** — all new UI must follow `docs/BRAND-GUIDELINES.md`. Dark mode only. Use `tq-*` color classes. Nunito font. 16px card radius, 12px button/input radius.
5. **Mobile-first** — max content width 428px, 16px horizontal padding. Touch targets minimum 44×44px.
6. **No breaking changes** — every Phase 1–5 feature must continue working. Reading loop, community feed, friends, push notifications, install banner — all must remain intact.
7. **Respect `prefers-reduced-motion`** — every new animation must be gated with a `@media (prefers-reduced-motion: reduce)` rule that either removes it or reduces it to a simple opacity fade.
8. **`npm run build` must pass** — no TypeScript errors. Verify after each feature.
9. **Reuse existing components** — `Avatar.tsx`, `Button.tsx`, skeleton loaders, `canvas-confetti`. Don't reinvent.
10. **No new heavy dependencies** — all animations in this phase use CSS keyframes, `requestAnimationFrame`, or existing `canvas-confetti`. Do NOT add GSAP, Framer Motion, Lottie, or any animation library. CSS-only or vanilla JS only.
11. **Performance** — animation keyframes go in `src/index.css` (not inline styles). Use `will-change: transform` sparingly and only on elements that actually animate. Do not add `will-change` to static elements.
12. **Guard all animations with refs** — count-up, travel animation, staggered entrances should all use a `hasAnimated` ref to ensure they fire once, not on every re-render.

---

## IMPLEMENTATION ORDER

Build in this sequence:

1. **`src/lib/cosmeticUnlocks.ts`** — pure logic utility, no UI. Quick win, establishes the pattern.
2. **`src/lib/levels.ts`** — extract/confirm XP thresholds client-side. Needed for 5B.3.
3. **`src/hooks/useCountUp.ts`** — utility hook. Needed for 5B.5A.
4. **`AnimatedFlame.tsx`** + wire into `HomePage.tsx` — (5B.2). Visible immediately on Home.
5. **`XPProgressBar.tsx`** + wire into Home + Profile — (5B.3). Two locations.
6. **Micro-animation polish pass** — streak dots, progress bar fill, wall post entrances, reaction bounce, flame pulse (5B.5B–F). Work file by file: `HomePage.tsx`, `QuestsPage.tsx`, `CommunityPage.tsx`, `WallPostCard.tsx`.
7. **`AvatarLightbox.tsx`** + tap-to-expand on Avatar — (5B.4). Wire into Profile, FriendCard, WallPostCard, Home snippet.
8. **`BadgeRevealCard.tsx`** + wire into `CelebrationStep.tsx` — (5B.6).
9. **Journey Map travel animation** — (5B.1). Save for last — most complex. Read `JourneyMap.tsx` carefully before touching it.
10. **Final build check** — `npm run build` must pass cleanly. Check bundle size hasn't grown more than ~15KB.

---

## TESTING CHECKLIST

After building, verify each of the following:

**Journey Map (5B.1):**
- [ ] After completing a reading and navigating to Quests tab, avatar travels from previous node to new completed node along the winding path
- [ ] Travel animation only fires once — not on tab re-focus or re-render
- [ ] Destination node has particle burst + expanding ring on arrival
- [ ] Next unread day node has continuous pulsing teal ring
- [ ] With `prefers-reduced-motion` set, no travel animation — node just appears completed

**Animated Flame (5B.2):**
- [ ] Users with streak >= 3 see animated CSS flame on Home screen stats row
- [ ] Users with streak < 3 see the static Lucide `Flame` icon (no regression)
- [ ] `cosmeticUnlocks.ts` is importable and returns correct boolean for `animated_flame`
- [ ] Flame animation loops smoothly, no jank on low-end devices

**XP Progress Bar (5B.3):**
- [ ] Bar appears on Home screen below stats row
- [ ] Bar appears on Profile screen
- [ ] Width animates from 0% to correct % on mount (600ms)
- [ ] Shows correct current level title and next level title
- [ ] Shows `{currentXP} / {nextLevelXP} XP` label in tq-gold
- [ ] At max level, bar shows "Max level reached" or full bar gracefully

**Avatar Lightbox (5B.4):**
- [ ] Tapping your own avatar on Profile opens lightbox with your name + level + streak
- [ ] Tapping a friend's avatar in Friends list opens their lightbox
- [ ] Tapping an avatar in the Community wall opens that user's lightbox
- [ ] Tapping overlay background (outside avatar) dismisses lightbox
- [ ] Entrance and exit animations play correctly
- [ ] No crashes if avatar URL is null (show initials fallback)

**Micro-animations (5B.5):**
- [ ] Home stats count up from 0 on first mount (streak, XP, quest days)
- [ ] Weekly streak dots pop in with staggered timing on Home mount
- [ ] Quest progress bar animates to correct width on QuestsPage mount
- [ ] Community wall posts slide up staggered on initial feed load
- [ ] Reaction emoji bounces when tapped; "+1" appears for new reactions
- [ ] Flame icon pulses continuously on Home when streak > 0
- [ ] All animations respect `prefers-reduced-motion`

**Badge Reveal (5B.6):**
- [ ] After completing a reading that earns a badge, CelebrationStep shows card flip reveal
- [ ] Multiple badges flip with staggered timing (400ms between each)
- [ ] Card front shows ? icon; card back shows badge icon + name + "Earned!"
- [ ] "Continue" button only appears after all badge cards have flipped
- [ ] If no new badges, CelebrationStep works exactly as before (no regression)

**Build & Performance:**
- [ ] `npm run build` passes with no TypeScript errors
- [ ] Bundle size increase is under 15KB over Phase 5 baseline (~471KB JS)
- [ ] No new `console.error` warnings in the browser
- [ ] All Phase 1–5 features still work (quick smoke test: auth → home → read → complete → community → friends → profile)

---

## FILES YOU'LL CREATE OR MODIFY

**New files:**
- `src/lib/cosmeticUnlocks.ts` — cosmetic unlock logic
- `src/lib/levels.ts` — XP/level threshold constants
- `src/hooks/useCountUp.ts` — count-up animation hook
- `src/components/ui/AnimatedFlame.tsx` — CSS flame component
- `src/components/ui/XPProgressBar.tsx` — XP level progress bar
- `src/components/ui/AvatarLightbox.tsx` — tap-to-expand avatar modal
- `src/components/celebration/BadgeRevealCard.tsx` — card flip badge reveal

**Modified files:**
- `src/index.css` — new CSS keyframes for all animations (dot-pop, post-enter, flame-pulse, offset-path travel, card-flip, particle-burst, ring-pulse)
- `src/components/quest/JourneyMap.tsx` — travel animation + pulsing next-node ring
- `src/pages/QuestsPage.tsx` — detect post-completion and trigger map travel
- `src/pages/HomePage.tsx` — count-up stats, dot pop-in, flame pulse, animated flame, XP bar
- `src/pages/ProfilePage.tsx` — XP progress bar, avatar lightbox
- `src/components/reading/CelebrationStep.tsx` — badge reveal card flip
- `src/components/profile/Avatar.tsx` — add optional `onTap` prop
- `src/components/friends/FriendCard.tsx` — wire avatar tap → lightbox
- `src/components/community/WallPostCard.tsx` — reaction bounce, slide-up, avatar lightbox

---

*Phase 5B target: Make Transform Quest feel premium, alive, and rewarding. Every interaction should feel snappy and joyful. Students who open this app should feel like they're playing something worth coming back to every day.*
