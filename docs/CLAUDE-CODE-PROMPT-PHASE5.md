# Transform Quest — Phase 5 Build Prompt (Launch Readiness)

> **Paste this into Claude Code at the start of your Phase 5 session.**
> Phases 1–4 are complete and deployed (~542KB JS, 34KB CSS). This phase adds push notifications, install guidance, QR code invites, performance optimization, and everything needed for Clay's youth group launch.

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
find src -type f -name "*.tsx" -o -name "*.ts" | head -120
cat src/App.tsx
cat src/types/database.ts
cat src/hooks/useAuth.ts
cat src/hooks/useQuest.ts
cat src/pages/HomePage.tsx
cat src/pages/ProfilePage.tsx
cat src/pages/AuthPage.tsx
cat src/pages/CommunityPage.tsx
cat src/components/layout/BottomNav.tsx
cat src/lib/supabase.ts
cat vite.config.ts
cat src/index.css
```

---

## WHAT EXISTS (DO NOT REBUILD)

Phases 1–4 are complete and passing. Key existing pieces:

- **Auth:** Google OAuth + magic link via Supabase, `useAuth` context with `{ user, session, profile, loading, signOut, refreshProfile, patchProfile }`
- **Profiles:** `profiles` table with `role`, `onboarding_completed`, avatar fields, `push_subscription` (JSONB, currently unused), `daily_reminder_time` (TIME, default 19:00)
- **Quest system:** Multi-quest support, `useQuest` hook with `isCurrentDayCompleted`, `useQuestHistory` hook
- **Reading flow:** 6-8 step flow (passage → 3 questions → celebration → share → friend streaks → done)
- **Completion:** `complete_reading` RPC (atomic, supports re-completion without double XP)
- **Community:** Today's Wall feed, wall posts (reflection + thought), 4 emoji reactions, ComposeModal, `useCommunityFeed` hook
- **Friends:** Friend discovery via search, accept/decline, `useFriends` hook, `useNudge` hook
- **Badges:** 36 badges, `check_and_award_badges` RPC
- **Admin:** Quest builder, engagement dashboard (with wall post moderation), announcements manager
- **PWA:** `vite-plugin-pwa` with `registerType: 'autoUpdate'`, precaches static assets. `runtimeCaching` is empty — Supabase API calls are NOT cached.
- **Supabase client:** `createClient()` without Database generic — all results explicitly cast at call sites (this is intentional, do NOT change)

---

## PHASE 5 SCOPE — BUILD THESE FEATURES

### 5.1 — Push Notifications (Full Stack)

This is the biggest feature. The `push_subscription` JSONB column and `daily_reminder_time` TIME column already exist on `profiles`. We need the full delivery pipeline.

#### 5.1A — VAPID Key Generation & Environment Setup

**One-time setup (document in migration file comments):**
```bash
# Generate VAPID keys (Tim runs this locally once)
npx web-push generate-vapid-keys
```

**Environment variables needed:**
```
# Add to .env.local (client)
VITE_VAPID_PUBLIC_KEY=<generated-public-key>

# Add to Supabase Edge Function secrets (Dashboard → Edge Functions → Secrets)
VAPID_PUBLIC_KEY=<generated-public-key>
VAPID_PRIVATE_KEY=<generated-private-key>
VAPID_SUBJECT=mailto:tim@missionvox.ai
```

#### 5.1B — Service Worker Push Handler

**Modify the PWA service worker configuration** in `vite.config.ts` to add a custom service worker that handles push events.

The existing `vite-plugin-pwa` generates a service worker for precaching. We need to add push event handling. The approach:

1. Create `src/sw-custom.ts` (or `public/sw-push.js`) with the push event listener
2. Configure `vite-plugin-pwa` to use `injectManifest` mode (instead of `generateSW`) so we can include custom logic alongside the precache manifest

**`src/sw-custom.ts` (or equivalent):**
```typescript
// This runs in the service worker context

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Transform Quest';
  const options: NotificationOptions = {
    body: data.body || "Time for today's reading!",
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: data.tag || 'tq-notification',  // Prevents duplicate notifications
    data: {
      url: data.url || '/',  // Where to navigate on click
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open, otherwise open new one
      for (const client of windowClients) {
        if (client.url.includes('transform-quest') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
```

**Important:** When switching to `injectManifest` mode, the existing precaching behavior MUST continue working. The custom service worker should import and use `precacheAndRoute` from workbox. Test that `npm run build` still produces a working service worker with both precaching AND push handling.

#### 5.1C — Client-Side Push Subscription

**File: `src/lib/pushNotifications.ts`**

Utility functions for subscribing/unsubscribing:

```typescript
// Check if push is supported and the app is installed as a PWA
export function isPushSupported(): boolean;

// Check if running as installed PWA (needed for iOS)
export function isInstalledPWA(): boolean;

// Check current permission state: 'granted' | 'denied' | 'default'
export function getNotificationPermission(): NotificationPermission;

// Request permission and subscribe
// Returns the PushSubscription object or null if denied/failed
export async function subscribeToPush(): Promise<PushSubscription | null>;

// Unsubscribe and clear from Supabase
export async function unsubscribeFromPush(): Promise<void>;

// Save subscription to profiles.push_subscription
export async function savePushSubscription(subscription: PushSubscription): Promise<void>;

// Remove subscription from profiles.push_subscription
export async function clearPushSubscription(): Promise<void>;
```

**Key implementation details:**
- `subscribeToPush()` must call `Notification.requestPermission()` — this MUST be triggered by a user gesture (button tap). Do NOT call this automatically on page load.
- Use the VAPID public key from `import.meta.env.VITE_VAPID_PUBLIC_KEY` when calling `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) })`
- `savePushSubscription()` updates `profiles.push_subscription` with the JSON-serialized subscription object
- Include a `urlBase64ToUint8Array()` helper function for converting the VAPID key

#### 5.1D — Notification Opt-In UX

**DO NOT prompt on Day 1.** Let kids install, sign in, and do their first reading first. Prompt after the **2nd or 3rd completion** when they care about their streak.

**File: `src/components/home/NotificationPrompt.tsx`**

A banner/card that appears on the Home screen when conditions are met:

**Show the prompt when ALL of these are true:**
1. Push is supported in this browser (`isPushSupported()`)
2. Permission is `'default'` (not yet asked — don't re-ask if denied)
3. The user has completed at least 2 readings (check `profile.total_xp >= 50` as a proxy, or track completions count)
4. The user hasn't dismissed this prompt in this session (use `sessionStorage` or a React state flag)
5. The app is running as an installed PWA (`isInstalledPWA()`) — OR the user is on Android (Android doesn't require install for push)

**If the app is NOT installed (iPhone + Safari):**
- Instead of the notification prompt, show an **install guidance banner** (see Section 5.2 below)
- Do NOT show the notification prompt — it will fail on iOS Safari

**Prompt UI:**
- Card on Home screen, below announcements but above the reading card
- Icon: 🔔 or `Bell` from Lucide
- Text: "Want a daily reminder so you don't break your streak?"
- Subtext: "We'll send a nudge at [7:00 PM] if you haven't read yet." (use `profile.daily_reminder_time`, formatted)
- CTA: "Yes, remind me!" (tq-teal button)
- Dismiss: "Maybe later" text link
- On CTA tap: call `subscribeToPush()` → if granted, call `savePushSubscription()`, show brief success toast "Reminders enabled! 🔔", hide prompt
- On denied: hide prompt permanently (track in localStorage: `tq-push-denied`)
- On dismiss: hide for this session only

#### 5.1E — Notification Settings in Profile

**Modify `src/pages/ProfilePage.tsx`:**

Add a "Notifications" section to the profile/settings area:

- **Toggle: "Daily Reminders"** — on/off. When turning on: triggers `subscribeToPush()` if not already subscribed. When turning off: calls `unsubscribeFromPush()`.
- **Time picker: "Reminder Time"** — shown when reminders are on. Updates `profiles.daily_reminder_time`. Default 7:00 PM. Use a native `<input type="time">` (16px font to prevent iOS zoom) styled with brand colors.
- **Status indicator:** Show current state — "Enabled ✓" in tq-success, "Not enabled" in tq-text-muted, or "Not supported on this device" if push isn't available.
- If permission was denied at the browser level: show "Notifications were blocked. To enable them, go to your browser settings." in tq-text-muted.

#### 5.1F — Supabase Edge Function: `send-push-notification`

**File: `supabase/functions/send-push-notification/index.ts`**

This Edge Function sends a push notification to one or more users.

**IMPORTANT:** Supabase Edge Functions use Deno, not Node.js. Use Deno-compatible imports. The `web-push` npm package does NOT work in Deno. Instead, use the Web Push protocol directly or use a Deno-compatible library.

**Recommended approach for Deno:** Use the `web-push` protocol manually:
1. Import `jose` or use Deno's built-in crypto for JWT signing
2. Build the VAPID authorization header manually
3. Send the push message via `fetch()` to the push endpoint from the subscription

**Alternatively:** Use a lightweight Deno web-push library if one exists (check `deno.land/x`). If no good Deno library exists, consider using a simple HTTP-based approach where the Edge Function calls a small Node.js helper deployed on Vercel (as an API route).

**Function signature:**
```typescript
// POST /send-push-notification
// Body: { user_ids: string[], title: string, body: string, url?: string, tag?: string }
// Auth: requires service_role key (called from other Edge Functions or cron, not from client)
```

**Logic:**
1. Receive list of user IDs
2. Query `profiles` for those users where `push_subscription IS NOT NULL`
3. For each subscription, send the push message
4. If a subscription fails with 404/410 (expired), delete it from the profile
5. Return `{ sent: N, failed: N, expired_cleaned: N }`

#### 5.1G — Supabase Edge Function: `daily-reminder-cron`

**File: `supabase/functions/daily-reminder-cron/index.ts`**

A scheduled function that sends daily reading reminders.

**Schedule:** Run every 15 minutes via Supabase cron (Dashboard → Edge Functions → Schedules, or via `supabase/config.toml`).

**Logic:**
1. Get current UTC time, round to nearest 15-minute window
2. Query profiles where:
   - `push_subscription IS NOT NULL`
   - `daily_reminder_time` falls within the current 15-minute window (convert user's local time to UTC — this is tricky, see note below)
   - User has NOT completed today's reading (check completions table for today's quest day)
3. Call `send-push-notification` for matching users with message: "Hey [Name]! Today's reading is ready. Don't break your 🔥 [streak]-day streak!"

**Timezone note:** The `daily_reminder_time` is stored as a bare TIME without timezone. For v1, assume all users are in **Central Time** (Clay's youth group is in Andover, MN). This avoids needing a timezone column on profiles. Add a comment noting this assumption for future expansion.

#### 5.1H — Wire Nudges to Push Notifications

**Modify `send_nudge` RPC** (or add a database trigger / call from client):

When a nudge is sent, also trigger a push notification to the nudged user:
- After `send_nudge` RPC succeeds, the client calls a small helper that invokes `send-push-notification` Edge Function for the nudged user
- Message: "🔥 [Friend Name] nudged you! Don't break your streak!"
- **OR** add a Supabase database trigger on `nudges` INSERT that calls the Edge Function via `pg_net` (if available) or a webhook

For v1, the simplest approach: have the client call the Edge Function directly after a successful nudge. The Edge Function should accept a `service_role` key OR validate the caller is the nudge sender.

---

### 5.2 — Install Guidance (In-App + Home Screen Detection)

This makes the install guide we already created as a PDF into an in-app experience, and detects whether the user has installed the app.

#### 5.2A — PWA Install Detection

**File: `src/hooks/useInstallPrompt.ts`**

```typescript
// Returns:
// {
//   isInstalled: boolean,       // true if running as standalone PWA
//   isIOS: boolean,             // true if iOS device
//   isAndroid: boolean,         // true if Android device
//   canPromptInstall: boolean,  // true if beforeinstallprompt event was captured (Android)
//   promptInstall: () => void,  // triggers the native install prompt (Android only)
//   dismissInstallBanner: () => void,
//   showInstallBanner: boolean, // should the banner be shown
// }
```

**Detection logic:**
- **Installed:** `window.matchMedia('(display-mode: standalone)').matches` OR `window.navigator.standalone === true` (iOS)
- **iOS:** Check user agent for iPhone/iPad/iPod
- **Android:** Check user agent for Android
- **`beforeinstallprompt`:** Listen for this event (Android Chrome only). Store the event object so `promptInstall()` can call `event.prompt()` later.

**Show install banner when:**
1. The app is NOT running in standalone mode
2. The user has visited at least twice OR has completed 1 reading (use localStorage counter: `tq-visit-count`)
3. The user hasn't dismissed the banner (localStorage: `tq-install-dismissed`)

#### 5.2B — Install Banner Component

**File: `src/components/home/InstallBanner.tsx`**

Shown on the Home screen when `showInstallBanner` is true.

**iPhone version (Safari detected, not installed):**
- Card with `bg-tq-surface` styling
- Icon: Safari share icon (include as inline SVG — it's the square with up-arrow)
- Text: "Install Transform Quest"
- Instructions: "Tap the Share button below, then tap 'Add to Home Screen'"
- Visual: Small numbered steps with icons (1. Share icon → 2. "Add to Home Screen" → 3. "Add")
- "Got it" dismiss button
- Note: "You must use Safari for this to work" in `text-tq-gold` if we detect a non-Safari browser on iOS

**Android version (Chrome detected, not installed):**
- If `canPromptInstall` is true: show "Install Transform Quest" card with a "Install" button that calls `promptInstall()`
- If `canPromptInstall` is false: show manual instructions ("Tap ⋮ menu → Add to Home Screen")
- "Not now" dismiss link

**Already installed:** Never show the banner.

#### 5.2C — Non-Safari iOS Warning

**Modify `src/pages/AuthPage.tsx`** (or add to Home screen):

If the user is on iOS but NOT using Safari (e.g., opened the link in Chrome for iOS, Instagram in-app browser, etc.):
- Show a prominent warning: "For the best experience, open this link in Safari"
- Explain: "Only Safari can install web apps on iPhone. Copy this link and paste it in Safari:"
- Show the URL: `transform-quest.vercel.app` with a copy button
- Detection: check user agent for `CriOS` (Chrome on iOS), `FxiOS` (Firefox on iOS), `Instagram`, `FBAV` (Facebook), `Twitter`, `LinkedIn`

---

### 5.3 — QR Code for Friend Invites

**Install:** `npm install qrcode.react` (lightweight React QR code component, ~5KB gzipped)

#### 5.3A — QR Code Display

**File: `src/components/community/QRCodeModal.tsx`**

- Triggered by a "My QR Code" button in the Friends section of the Community page
- Shows a QR code encoding: `https://transform-quest.vercel.app/add/[USER_INVITE_CODE]`
- Below the QR: the user's display name and invite code in text
- "Share Code" button: uses Web Share API to share the invite link (fallback: copy to clipboard)
- Modal styling: centered, `bg-tq-surface`, QR code on white background for scannability

#### 5.3B — Invite Link Handler

**File: `src/pages/AddFriendPage.tsx`** (route: `/add/:inviteCode`)

**Add route in `App.tsx`:** `/add/:inviteCode` → `AddFriendPage`

**Logic:**
1. Extract `inviteCode` from URL params
2. If user is NOT logged in: redirect to `/auth` with a `returnTo=/add/[code]` param (so they come back after signing in)
3. If user IS logged in: look up the profile with that invite code, auto-send a friend request, show a success screen ("Friend request sent to [Name]!") with a "Go to Community" button
4. If invite code not found: show "Invalid invite code" error with a "Go Home" button
5. Handle edge case: user scanning their own QR code ("That's your own code!")

---

### 5.4 — Performance Optimization

#### 5.4A — Route-Level Code Splitting

**Modify `src/App.tsx`:**

Wrap heavy route components in `React.lazy()` + `Suspense`:

```tsx
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const ReadingFlowPage = React.lazy(() => import('./pages/ReadingFlowPage'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));
const QuestsPage = React.lazy(() => import('./pages/QuestsPage'));
const AddFriendPage = React.lazy(() => import('./pages/AddFriendPage'));
```

**Suspense fallback:** Use a minimal loading screen that matches the app's brand — dark background with a subtle loading indicator (skeleton or pulsing TQ logo). Do NOT use a plain white screen.

**Keep eager-loaded:** `HomePage`, `AuthPage`, `OnboardingPage`, `ProfilePage` — these are lightweight and should load instantly.

#### 5.4B — Component-Level Lazy Loading

Lazy-load heavy components that aren't always visible:

- `JourneyMap` (SVG-heavy) — lazy-load when user navigates to a quest detail
- `ComposeModal` — lazy-load on first open
- `canvas-confetti` — already imported dynamically? Check and confirm. If statically imported, make it dynamic.

#### 5.4C — Bundle Analysis

After implementing code splitting, run:
```bash
npx vite-bundle-visualizer
```
Document the results. Target: main chunk under 300KB, largest lazy chunk under 150KB.

---

### 5.5 — Invite-Code Gate for Controlled Rollout

For Clay's alpha launch with small group leaders before opening to the full youth group.

#### 5.5A — Environment Variable Gate

**Add to `.env.local`:**
```
VITE_LAUNCH_CODE=TRANSFORM2026
```

When this variable is set and non-empty, the app requires an access code before sign-in.

#### 5.5B — Auth Page Gate

**Modify `src/pages/AuthPage.tsx`:**

If `import.meta.env.VITE_LAUNCH_CODE` is set:
1. Before showing the sign-in buttons, show a code entry step
2. UI: "Enter your access code" with a text input and "Continue" button
3. Compare input (case-insensitive, trimmed) to the env var
4. If correct: store `tq-access-granted` in `localStorage`, proceed to sign-in buttons
5. If incorrect: show "Invalid code — ask your youth leader for the access code" error
6. On subsequent visits: check localStorage first, skip the code step if already granted

**To remove the gate for full launch:** Set `VITE_LAUNCH_CODE=` (empty) in the environment and redeploy. The code step disappears.

---

### 5.6 — Bug Fixes & Edge Cases

Address these known issues:

#### 5.6A — Quest End Handling
- When a quest's `end_date` has passed and no other quest is active, the Home screen should show a clean empty state: "No active quest right now. Check back soon!" with Clay's most recent announcement if any exist.
- The "Start Today's Reading" button should not appear.
- Community feed should still show posts from the last active day (don't break the wall).

#### 5.6B — Button Debouncing
- All submit buttons (`complete_reading`, `createPost`, `toggleReaction`, `sendFriendRequest`, `nudgeFriend`) must be disabled while the async operation is in progress.
- The `Button` component already has a `loading` prop — ensure it's used consistently everywhere.

#### 5.6C — Session Expiry Handling
- Supabase auth tokens expire. If a user opens the app after days of inactivity and their token is expired, `useAuth` should detect this and redirect to `/auth` gracefully instead of showing errors.
- Check that `supabase.auth.onAuthStateChange` properly handles `TOKEN_REFRESHED` and `SIGNED_OUT` events.

#### 5.6D — Long Content Overflow
- Verify that very long display names (30+ chars) don't break card layouts. Truncate with ellipsis where needed.
- Verify that reflection answers and thought text respect max-widths and wrap properly.

---

## IMPLEMENTATION ORDER

Build in this sequence to minimize dependency issues:

1. **Push notification utilities** — `src/lib/pushNotifications.ts` (client-side subscribe/unsubscribe)
2. **Service worker push handler** — modify `vite.config.ts` + create custom SW with push event listener
3. **Install detection hook** — `useInstallPrompt.ts`
4. **Install banner** — `InstallBanner.tsx` (iPhone + Android variants)
5. **Non-Safari iOS warning** — detection + warning UI on Auth page
6. **Notification opt-in prompt** — `NotificationPrompt.tsx` on Home screen
7. **Notification settings** — toggle + time picker on Profile page
8. **QR code** — install `qrcode.react`, build `QRCodeModal.tsx`
9. **Invite link handler** — `/add/:inviteCode` route + `AddFriendPage.tsx`
10. **Invite-code gate** — Auth page modification
11. **Performance optimization** — route code splitting + lazy loading
12. **Supabase Edge Functions** — `send-push-notification` + `daily-reminder-cron`
13. **Wire nudges to push** — trigger notification on nudge send
14. **Bug fixes** — quest end handling, debouncing, session expiry, overflow
15. **Bundle analysis** — verify chunk sizes

**Note on Edge Functions:** Items 12-13 require Supabase CLI or Dashboard access to deploy Edge Functions. If Edge Functions prove too complex for this session (Deno compatibility, VAPID signing), stub them out and focus on getting the client-side infrastructure working. The client should handle the case where push delivery isn't available yet (subscriptions still save to the DB, notifications just don't arrive until the Edge Functions are deployed).

---

## CRITICAL RULES

1. **Tailwind v3** — we are on Tailwind CSS v3, NOT v4. Do not use v4 syntax.
2. **Supabase client is untyped** — all query results must be explicitly cast using types from `src/types/database.ts`. Do NOT add a generic type parameter to `createClient()`.
3. **`null !== false`** — when checking booleans from the DB, check for truthiness carefully.
4. **Brand guidelines** — all new UI must follow `docs/BRAND-GUIDELINES.md`. Dark mode only. Use `tq-*` color classes. Nunito font. 16px card radius, 12px button/input radius.
5. **Mobile-first** — max content width 428px, 16px horizontal padding. Touch targets minimum 44×44px.
6. **No breaking changes** — Phases 1–4 features must continue working. The daily reading loop, community feed, and friend system are sacred.
7. **Font size 16px minimum on inputs** — prevents iOS auto-zoom.
8. **`npm run build` must pass** — no TypeScript errors, no unused imports that fail strict mode. Verify the build compiles cleanly after each major feature.
9. **Service worker must not break** — when switching to `injectManifest` mode, verify precaching still works. A broken service worker can cache a broken app permanently. Test thoroughly.
10. **Push permission requires user gesture** — NEVER call `Notification.requestPermission()` outside of a click/tap handler. It will be silently ignored on iOS and annoying on Android.
11. **Optimistic UI** — reactions, friend requests, and nudges should feel instant. Update local state before the server responds.
12. **Reuse existing components** — `Avatar.tsx`, `Button`, `Card`, skeleton loaders, entrance animations. Don't reinvent.
13. **Edge Functions use Deno** — no `require()`, no Node.js-only packages. Use ESM imports and Deno-compatible libraries.

---

## TESTING CHECKLIST

After building, verify:

**Push Notifications:**
- [ ] `npm run build` passes cleanly and service worker registers correctly
- [ ] Push notification prompt appears on Home screen after 2+ completions (not before)
- [ ] Push prompt does NOT appear if app is not installed as PWA on iPhone
- [ ] Tapping "Yes, remind me!" triggers browser permission request
- [ ] On permission grant: subscription saved to `profiles.push_subscription`
- [ ] On permission deny: prompt hidden permanently, no nagging
- [ ] Profile settings show notification toggle and time picker
- [ ] Toggling notifications off clears subscription from DB
- [ ] Service worker displays notifications when push message is received
- [ ] Clicking a notification opens/focuses the app

**Install Guidance:**
- [ ] Install banner appears on iPhone in Safari (with share icon instructions)
- [ ] Install banner appears on Android Chrome (with "Install" button if `beforeinstallprompt` fires)
- [ ] Banner does NOT appear when app is already installed as PWA
- [ ] Non-Safari warning appears on iOS when using Chrome/Instagram/Facebook browser
- [ ] Banner dismiss persists (doesn't reappear after dismissal)

**QR Code & Invites:**
- [ ] QR code modal shows in Community → Friends section
- [ ] QR code encodes correct URL with user's invite code
- [ ] `/add/:inviteCode` route works — sends friend request when logged in
- [ ] `/add/:inviteCode` redirects to auth when not logged in, returns after sign-in
- [ ] Scanning own QR code shows appropriate message
- [ ] Invalid invite code shows error

**Invite Gate:**
- [ ] When `VITE_LAUNCH_CODE` is set, Auth page requires code before sign-in
- [ ] Correct code allows through and remembers in localStorage
- [ ] Incorrect code shows error
- [ ] When `VITE_LAUNCH_CODE` is empty, no code step appears

**Performance:**
- [ ] Route code splitting works — AdminPage, ReadingFlowPage, CommunityPage load lazily
- [ ] Suspense fallback shows brand-styled loading screen (not white flash)
- [ ] Main bundle chunk is under 300KB

**Edge Cases:**
- [ ] No active quest shows clean empty state on Home screen
- [ ] All submit buttons disable during async operations
- [ ] Expired auth session redirects to `/auth` gracefully
- [ ] Long display names truncate properly
- [ ] Existing Phase 1–4 features all still work

---

## FILES YOU'LL CREATE OR MODIFY

**New files:**
- `src/lib/pushNotifications.ts` — subscribe/unsubscribe utilities
- `src/hooks/useInstallPrompt.ts` — PWA install detection + banner logic
- `src/components/home/NotificationPrompt.tsx` — push opt-in banner
- `src/components/home/InstallBanner.tsx` — platform-specific install guidance
- `src/components/community/QRCodeModal.tsx` — QR code display for invites
- `src/pages/AddFriendPage.tsx` — `/add/:inviteCode` handler
- `src/sw-custom.ts` (or equivalent) — custom service worker with push handler
- `supabase/functions/send-push-notification/index.ts` — Edge Function for sending push
- `supabase/functions/daily-reminder-cron/index.ts` — Edge Function for scheduled reminders

**Modified files:**
- `vite.config.ts` — switch to `injectManifest` mode for custom service worker
- `src/App.tsx` — add `/add/:inviteCode` route, lazy-load routes with `React.lazy`
- `src/pages/AuthPage.tsx` — invite-code gate + non-Safari iOS warning
- `src/pages/HomePage.tsx` — add NotificationPrompt + InstallBanner + quest-ended empty state
- `src/pages/ProfilePage.tsx` — add notification settings section (toggle + time picker)
- `src/pages/CommunityPage.tsx` — add QR code button to Friends tab
- `src/components/layout/BottomNav.tsx` — no changes expected, but verify after code splitting

**Install new dependency:**
- `qrcode.react` — for QR code generation (`npm install qrcode.react`)

---

*Phase 5 target: Launch Readiness — make Transform Quest bulletproof for 20–50+ students on launch day at Transform Church.*
