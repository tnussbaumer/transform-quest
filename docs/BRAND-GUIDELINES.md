# Transform Quest — Brand & Design Guidelines

> **For Claude Code / Developer Reference**
> This file defines the visual identity, component patterns, and design rules for the Transform Quest PWA. Follow these guidelines for every screen, component, and interaction built in this project. When in doubt, reference this file.

---

## 1. BRAND CONTEXT

Transform Quest is the youth discipleship app for **Transform Church** (Andover, MN — transform.tc). The church uses a clean, modern aesthetic with a bold sans-serif logo mark. The app should feel like an extension of the Transform Church brand but tuned for a teen audience — more energetic, more playful, darker, gamified.

**Brand personality keywords:** Bold, encouraging, fun, community-driven, growth-oriented, modern, youthful but not childish.

**Inspiration references:** Duolingo (gamification, dark UI, celebrations), Wordle (share mechanic), modern fitness apps (streaks, progress visualization). The app should feel premium and well-designed — not like a generic church app.

---

## 2. COLOR SYSTEM

### Core Palette

```css
:root {
  /* === BASE (Dark Mode Default) === */
  --color-bg-primary:     #1A1D2E;   /* Deep navy — main background */
  --color-bg-surface:     #232740;   /* Elevated cards, modals, inputs */
  --color-bg-surface-2:   #2D3154;   /* Secondary surface, hover states */
  --color-bg-overlay:     rgba(26, 29, 46, 0.85); /* Frosted overlays */

  /* === ACCENT COLORS === */
  --color-teal:           #00C9A7;   /* Primary CTA, streaks active, success */
  --color-teal-light:     #33FFD4;   /* Teal glow, highlights */
  --color-teal-dark:      #009B82;   /* Teal pressed/active state */

  --color-gold:           #FFB830;   /* XP, streak fire, achievements */
  --color-gold-light:     #FFD470;   /* Gold glow, celebration accents */
  --color-gold-dark:      #E09800;   /* Gold pressed state */

  --color-purple:         #8B5CF6;   /* Quests, journey, badges, level-ups */
  --color-purple-light:   #A78BFA;   /* Purple glow */
  --color-purple-dark:    #7340E0;   /* Purple pressed state */

  /* === SEMANTIC COLORS === */
  --color-success:        #34D399;   /* Completed states, checkmarks */
  --color-warning:        #FBBF24;   /* Caution, streak-at-risk */
  --color-error:          #F87171;   /* Errors, destructive actions */
  --color-info:           #60A5FA;   /* Informational */

  /* === TEXT === */
  --color-text-primary:   #F1F5F9;   /* Primary text — high contrast on dark */
  --color-text-secondary: #94A3B8;   /* Labels, metadata, placeholders */
  --color-text-muted:     #64748B;   /* Disabled, tertiary text */
  --color-text-inverse:   #1A1D2E;   /* Text on light/accent backgrounds */

  /* === BORDERS & DIVIDERS === */
  --color-border:         #334155;   /* Default border */
  --color-border-subtle:  #1E293B;   /* Subtle dividers */
  --color-border-focus:   #00C9A7;   /* Focus rings */
}
```

### Tailwind Config Mapping

When configuring `tailwind.config.js`, map the above variables to custom theme colors:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'tq-bg':         '#1A1D2E',
        'tq-surface':    '#232740',
        'tq-surface-2':  '#2D3154',
        'tq-teal':       '#00C9A7',
        'tq-teal-light': '#33FFD4',
        'tq-teal-dark':  '#009B82',
        'tq-gold':       '#FFB830',
        'tq-gold-light': '#FFD470',
        'tq-gold-dark':  '#E09800',
        'tq-purple':     '#8B5CF6',
        'tq-purple-light':'#A78BFA',
        'tq-purple-dark':'#7340E0',
        'tq-success':    '#34D399',
        'tq-warning':    '#FBBF24',
        'tq-error':      '#F87171',
        'tq-text':       '#F1F5F9',
        'tq-text-sec':   '#94A3B8',
        'tq-text-muted': '#64748B',
        'tq-border':     '#334155',
      }
    }
  }
}
```

### Color Usage Rules

| Element | Color | Notes |
|---------|-------|-------|
| Page background | `tq-bg` | Always dark |
| Cards, modals, inputs | `tq-surface` | Slightly lifted from bg |
| Hover/pressed surfaces | `tq-surface-2` | One step lighter |
| Primary CTA buttons | `tq-teal` | White or dark text |
| Streak fire, XP numbers | `tq-gold` | The "reward" color |
| Quest path, badges, levels | `tq-purple` | The "journey" color |
| Completed checkmarks | `tq-success` | Green confirmation |
| Body text | `tq-text` | Near-white for readability |
| Labels, metadata | `tq-text-sec` | Muted slate |
| Disabled elements | `tq-text-muted` | Clearly inactive |
| Focus rings on inputs | `tq-teal` | Consistent with brand accent |

### Gradient Recipes

```css
/* Streak Fire Gradient — for fire icons, streak celebrations */
.gradient-fire {
  background: linear-gradient(135deg, #FFB830 0%, #FF6B35 50%, #FF4444 100%);
}

/* Quest Progress Gradient — for progress bars, journey path */
.gradient-quest {
  background: linear-gradient(135deg, #8B5CF6 0%, #00C9A7 100%);
}

/* XP Celebration Gradient — for XP popups, level-up moments */
.gradient-xp {
  background: linear-gradient(135deg, #FFB830 0%, #FFD470 100%);
}

/* Card Glow — subtle radial glow on active cards */
.glow-teal {
  box-shadow: 0 0 40px rgba(0, 201, 167, 0.15);
}

.glow-gold {
  box-shadow: 0 0 40px rgba(255, 184, 48, 0.15);
}

.glow-purple {
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.15);
}
```

---

## 3. TYPOGRAPHY

### Font Stack

```css
/* Primary — Used for everything */
font-family: 'Nunito', 'Nunito Sans', system-ui, -apple-system, sans-serif;
```

**Why Nunito:** Rounded terminals feel friendly and approachable for teens without being childish. It's highly legible at small sizes on mobile, has excellent weight range (400–900), and feels distinct from generic UI fonts. It's available on Google Fonts for free.

### Font Import

```html
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **Display** | 48px / 3rem | 900 (Black) | 1.1 | Streak numbers, big celebrations |
| **H1** | 28px / 1.75rem | 800 (ExtraBold) | 1.2 | Screen titles |
| **H2** | 22px / 1.375rem | 700 (Bold) | 1.3 | Section headers |
| **H3** | 18px / 1.125rem | 700 (Bold) | 1.4 | Card titles, quest names |
| **Body** | 16px / 1rem | 400 (Regular) | 1.5 | Body text, descriptions |
| **Body Strong** | 16px / 1rem | 600 (SemiBold) | 1.5 | Emphasized body text |
| **Caption** | 14px / 0.875rem | 600 (SemiBold) | 1.4 | Labels, metadata, stats |
| **Small** | 12px / 0.75rem | 400 (Regular) | 1.4 | Timestamps, fine print |
| **XP/Numbers** | Varies | 800 (ExtraBold) | 1.0 | Use tabular-nums for aligned numbers |

### Typography Rules
- **Numbers** (streaks, XP, stats): Always use `font-variant-numeric: tabular-nums` for clean alignment
- **All caps:** Used sparingly for labels like "OVERVIEW", "FRIEND STREAKS", "MONTHLY BADGES" — always with `letter-spacing: 0.05em` and `font-weight: 800`
- **Scripture text:** Slightly larger body (18px), with `font-style: italic` optional for verse references
- **Never** use font sizes below 12px
- **Reflection question prompts:** 16px bold, with the question text in `tq-teal`

---

## 4. SPACING & LAYOUT

### Base Unit
All spacing uses a **4px base unit**. Standard increments: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

### Page Layout
- **Max content width:** 428px (iPhone 14 Pro Max width — optimized for mobile)
- **Horizontal padding:** 16px (Tailwind `px-4`)
- **Section spacing:** 24px between major sections (Tailwind `space-y-6`)
- **Card internal padding:** 16px–20px (Tailwind `p-4` or `p-5`)

### Bottom Navigation
- Height: 64px + safe area inset
- Always visible except during reading/reflection flow (which is full-screen)
- Active tab: teal icon + teal label
- Inactive tab: muted gray icon + gray label

### Safe Areas
- Respect `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` for notch/home indicator
- Bottom nav sits above the home indicator
- Top header accounts for status bar

---

## 5. COMPONENT PATTERNS

### Cards
```
Border radius:    16px (rounded-2xl)
Background:       tq-surface (#232740)
Border:           1px solid tq-border (#334155) — optional, subtle
Padding:          16px–20px
Shadow:           none by default (dark mode doesn't need shadows)
Hover/Press:      bg shifts to tq-surface-2
Active card glow: Add .glow-teal or .glow-purple for emphasis
```

### Buttons

**Primary (CTA):**
```
Background:       tq-teal (#00C9A7)
Text:             tq-bg (#1A1D2E) — dark text on bright bg
Font:             16px, weight 700
Padding:          14px 24px
Border radius:    12px (rounded-xl)
Hover:            tq-teal-dark (#009B82)
Active:           Scale down slightly (transform: scale(0.97))
Full-width:       On mobile, most CTAs are full-width
```

**Secondary:**
```
Background:       tq-surface-2 (#2D3154)
Text:             tq-text (#F1F5F9)
Border:           1px solid tq-border (#334155)
Same radius and padding as primary
Hover:            border-color shifts to tq-teal
```

**Nudge Button:**
```
Background:       tq-surface-2 with teal left border (4px)
Text:             tq-teal
Icon:             👋 wave emoji or hand icon
```

**Danger/Destructive:**
```
Background:       transparent
Text:             tq-error (#F87171)
Border:           1px solid tq-error
```

### Input Fields
```
Background:       tq-surface (#232740)
Border:           1px solid tq-border (#334155)
Border radius:    12px
Padding:          12px 16px
Text:             tq-text
Placeholder:      tq-text-muted
Focus:            border-color → tq-teal, ring → 2px tq-teal/20%
Font:             16px (prevents iOS zoom on focus)
```

For the reflection question inputs, use `<textarea>` with auto-grow behavior. Min height 80px, max 160px.

### Streak Fire Icon
- Use an SVG or emoji 🔥 for the streak indicator
- When streak is active: gradient-fire background with glow
- When streak count displayed: `tq-gold` text, `font-weight: 800`
- Animate the fire icon with a subtle flicker/pulse on the celebration screen

### Weekly Streak Bar
```
Layout:           Horizontal row of 7 circles (Mon–Sun)
Completed day:    tq-success (#34D399) background, white checkmark
Today (done):     tq-teal with glow ring
Today (not done): tq-gold pulsing ring (call to action)
Future:           tq-surface-2 (#2D3154) — dimmed
Size:             36px circles with 8px gaps
Day labels:       12px, tq-text-sec, above each circle
```

### Badge Components
```
Size:             64px × 64px (grid display), 48px (inline)
Shape:            Circle with 4px border
Earned:           Full color with subtle glow matching badge type color
Unearned:         Grayscale/silhouette on tq-surface-2, 40% opacity
Border:           tq-gold for streak, tq-purple for quest, tq-teal for special
```

### Progress Bars
```
Track:            tq-surface-2 (#2D3154), rounded-full, h-3
Fill:             gradient-quest (purple → teal), rounded-full
Animation:        Width transitions with ease-out, 600ms
Milestone marks:  Small diamond shapes at 25%, 50%, 75%
```

### Avatar / Profile Image
```
Shape:            Circle
Size:             48px (list), 80px (profile header), 32px (inline/small)
Border:           2px solid tq-border
Default:          Initials on tq-purple background, white text
With image:       object-fit: cover, rounded-full
```

---

## 6. ANIMATION & MICRO-INTERACTIONS

### General Principles
- Animations should feel **snappy and rewarding**, not slow or floaty
- Default transition duration: 200ms for UI state changes, 400ms for reveals
- Use `ease-out` for entrances, `ease-in` for exits
- Celebrate wins enthusiastically — this is gamification, joy is the point

### Key Animations

**Streak Count-Up:**
- When streak number increases, animate from old → new with a scale bounce (1.0 → 1.2 → 1.0)
- Duration: 500ms
- Color flash: briefly shift to tq-gold-light then back to tq-gold

**XP Earned:**
- "+20 XP" text flies up from the center, scales up, then fades out upward
- Duration: 800ms
- Use tq-gold color with a slight glow

**Celebration Confetti:**
- On milestone completions and quest completions
- Use a lightweight confetti library (canvas-confetti or CSS-only)
- Colors: tq-teal, tq-gold, tq-purple, tq-success
- Duration: 2 seconds, then fade

**Completion Checkmark:**
- Draws in with an SVG stroke animation (stroke-dashoffset technique)
- Circle fills with tq-success, checkmark draws white
- Duration: 400ms

**Card Entrance:**
- Stagger cards with `animation-delay` on page load
- Fade up from 20px below + opacity 0 → 1
- 100ms stagger between cards

**Nudge Button:**
- On tap: slight shake animation (CSS keyframes, 3 quick left-right oscillations)
- Then show brief "Sent!" confirmation with tq-success color

**Fire Icon Pulse:**
- Continuous subtle scale pulse on the home screen when streak is active
- `scale(1.0) → scale(1.08) → scale(1.0)`, 2s loop, ease-in-out

**Journey Path Nodes:**
- Today's node: pulsing ring animation (ring scales 1.0 → 1.3 at 30% opacity, loops)
- Completing a node: fills with tq-success + brief burst of particle dots

---

## 7. ICONOGRAPHY

### Icon Source
Use **Lucide React** (`lucide-react`) as the primary icon set. It's clean, consistent, and lightweight.

### Key Icon Mappings
| Concept | Icon | Color |
|---------|------|-------|
| Home/Today | `BookOpen` | Tab color |
| Quests | `Compass` | Tab color |
| Friends | `Users` | Tab color |
| Profile | `User` | Tab color |
| Streak Fire | Custom SVG or `Flame` | tq-gold |
| XP Lightning | `Zap` | tq-gold |
| Completed | `Check` or `CheckCircle` | tq-success |
| Nudge | `Hand` or 👋 emoji | tq-teal |
| Share | `Share2` | tq-text-sec |
| Settings | `Settings` | tq-text-sec |
| Add Friend | `UserPlus` | tq-teal |
| Badge/Trophy | `Trophy` or `Award` | tq-purple |
| Calendar | `Calendar` | tq-text-sec |
| Lock (future nodes) | `Lock` | tq-text-muted |
| Back arrow | `ChevronLeft` | tq-text |
| Close | `X` | tq-text-sec |

### Icon Sizing
- Navigation tabs: 24px
- Inline with text: 16px–20px
- Feature icons (stats, etc.): 20px–24px
- Large decorative: 32px–48px

---

## 8. DARK MODE (DEFAULT & ONLY FOR V1)

The app is **dark mode only** in v1. This is intentional:
- Matches the Duolingo dark UI that inspired the concept
- Teens overwhelmingly prefer dark mode
- Looks better on OLED screens (true blacks around the edges)
- Reduces eye strain for evening Bible reading
- Creates a premium, app-like feel

Light mode can be added as a toggle in a future version.

### Dark Mode Rules
- Never use pure black (`#000000`) — always use the navy base (`#1A1D2E`) for warmth
- Never use pure white (`#FFFFFF`) for text — use `#F1F5F9` to reduce harshness
- Accent colors (teal, gold, purple) should feel like they glow against the dark background
- Card surfaces should be clearly distinct from the page background (at least 1 step lighter)
- Images and avatars get a subtle dark vignette or border to blend with the dark UI

---

## 9. MOBILE-FIRST RESPONSIVE RULES

### Breakpoints
The app is designed mobile-first. The primary viewport is phone-sized (375px–428px).

```
Mobile (default):  0px – 640px    → Full mobile layout
Tablet:            641px – 1024px → Centered container, max-width 428px
Desktop:           1025px+        → Centered container, max-width 428px with dark bg flanks
```

### Touch Targets
- Minimum touch target: 44px × 44px (Apple HIG standard)
- Buttons: minimum height 48px
- List items: minimum height 56px
- Bottom nav icons: 48px touch area
- Add generous padding around tappable elements

### Input Handling
- All text inputs use `font-size: 16px` minimum (prevents iOS auto-zoom)
- Use `inputmode="text"` for reflection questions
- Auto-focus the first input when entering the reflection flow
- Show character count or gentle limit indicator (not a hard limit — encourage brevity, don't enforce it)

### Gestures
- Swipe between reflection questions (optional, with dots indicator)
- Pull-to-refresh on Home screen
- No horizontal scrolling on any screen

---

## 10. ACCESSIBILITY BASELINE

- Color contrast ratios meet WCAG AA (4.5:1 for body text, 3:1 for large text)
- All interactive elements have visible focus states (teal focus ring)
- Images have alt text
- Buttons have descriptive aria-labels where icon-only
- Semantic HTML structure (proper heading hierarchy, landmarks)
- Reduced motion: respect `prefers-reduced-motion` — disable confetti, simplify animations to opacity-only transitions

---

## 11. TRANSFORM CHURCH BRAND INTEGRATION

### TC Logo Usage
- Small TC logo in the app header (top-left corner) — SVG format
- Do not modify, stretch, or recolor the logo
- On the dark background, use the white/light version of the TC mark
- The logo is a subtle brand anchor, not the star — the app has its own identity

### Transform Quest Wordmark
- "Transform Quest" in Nunito ExtraBold (800)
- "Transform" in `tq-text` (white), "Quest" in `tq-teal`
- Used on loading screen, onboarding, and share cards
- Can be abbreviated to "TQ" with the same color split

### Church Alignment
- The app feels connected to Transform Church but isn't overly "churchy" in visual tone
- No stained glass, crosses as design elements, or traditional religious imagery in the UI chrome
- The spiritual content comes through the scripture and reflections — the UI is modern and gamified
- Tone of copy is encouraging, casual, youth-friendly: "You're on fire!" not "God bless your diligence"

---

## 12. FILE & FOLDER NAMING

When building components, follow this structure:

```
src/
├── components/
│   ├── ui/              # Reusable primitives (Button, Card, Input, Badge, etc.)
│   ├── home/            # Home screen specific components
│   ├── quest/           # Quest screen components
│   ├── friends/         # Friends screen components
│   ├── profile/         # Profile screen components
│   ├── reading/         # Reading + reflection flow components
│   ├── celebration/     # Celebration/reward components
│   ├── admin/           # Admin dashboard components
│   └── layout/          # Navigation, headers, page shells
├── pages/               # Top-level route pages
├── hooks/               # Custom React hooks
├── lib/                 # Supabase client, utilities, helpers
├── styles/              # Global CSS, Tailwind config
└── assets/              # Icons, images, static files
```

Component files: PascalCase (e.g., `StreakBar.tsx`, `QuestCard.tsx`)
Utility files: camelCase (e.g., `calculateXp.ts`, `useStreak.ts`)

---

## QUICK REFERENCE CHEAT SHEET

```
BACKGROUND:        #1A1D2E (tq-bg)
CARDS:             #232740 (tq-surface)
PRIMARY ACCENT:    #00C9A7 (tq-teal) — CTAs, active streaks
REWARD ACCENT:     #FFB830 (tq-gold) — XP, fire, achievements
JOURNEY ACCENT:    #8B5CF6 (tq-purple) — quests, badges, levels
TEXT:              #F1F5F9 (tq-text)
TEXT SECONDARY:    #94A3B8 (tq-text-sec)
FONT:              Nunito (400, 600, 700, 800, 900)
BORDER RADIUS:     16px cards, 12px buttons/inputs, full for circles
TRANSITIONS:       200ms UI changes, 400ms reveals, 600ms celebrations
```

---

*Last updated: March 9, 2026*
*Reference this file in every Claude Code session when working on Transform Quest.*
