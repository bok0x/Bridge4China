# IQ Test Landing Page — Design Spec
**Date:** 2026-04-18  
**Branch:** feature/bridge4china-transformation

---

## Context

ChinaUniMatch needs a conversion-focused IQ test experience. Users see a banner across the entire site ("TEST YOUR IQ →"), click it, take a 15-question adaptive cognitive test, then must register/login to see their results. This gates valuable psychometric data behind account creation — driving signups without friction.

---

## Visual Design

**Style:** iOS 26 Liquid Glass — dark `#030806` background, green `#48C59C` accents, glassmorphic cards with real `backdrop-filter: url(#water-lens) blur(32px) saturate(210%)` distortion. When colored balls drift behind the glass card, they visually refract/warp like water.

**Background layers (HTML divs, not canvas, so backdrop-filter works):**
- 4 large green nebula orbs (CSS animated, slow drift)
- 5 glowing red/orange balls bouncing randomly across the full viewport — they pass behind the card so the liquid lens effect is visible
- 180 CSS-animated twinkling stars
- Mouse parallax: all layers shift at different depths on cursor move

**Card:** 3D tilt follows cursor (`perspective rotateX/Y`), dynamic shadow tracks mouse position, animated shimmer sweep across surface every 6s.

**UI sounds:** hover chime (660Hz), answer select triad (523→659→784Hz), next-question swoosh — all Web Audio API, no files.

---

## Route & Entry Point

| Item | Value |
|------|-------|
| Route | `/iq-test` |
| Entry | Banner at top of every page (replaces or sits below existing `BeforeChinaBanner`) |
| Banner text | `🧠 TEST YOUR IQ — Free 15-min cognitive assessment →` |
| Banner style | Green glassmorphic pill, same CSS system as rest of site |

---

## Test Structure

**15 questions total**, across 4 cognitive indices:

| Index | Type | Count | Description |
|-------|------|-------|-------------|
| FRI | Matrix Reasoning | 4 | 3×3 visual pattern grids (SVG-based) |
| QRI | Number Series | 4 | Numeric sequences, find the next value |
| VCI | Verbal Analogies | 4 | "A is to B as C is to ___" |
| VSI | Spatial Rotation | 3 | 2D shape rotation, pick correct rotated version |

**Adaptive difficulty:** Questions start at medium difficulty. Correct → harder next. Wrong → easier next. Implemented via a `difficulty` field (1–5) on each question object and a simple theta tracker.

**Question data:** Static JSON/TS file (`src/app/iq-test/iqTestData.ts`) — no DB queries during the test. ~60 questions seeded (15 served per session, selected by difficulty tier).

**Flashcard UX:**
- One question fills the card at a time
- Framer Motion slide transition (direction-aware: forward slides left-to-right, back slides right-to-left)
- Auto-advance 350ms after selection
- Slim progress bar at top (`5 / 15`)
- Category label (`MATRIX REASONING`, etc.)

---

## Auth Gate

**After the last question is answered:**

1. Answers are stored in `localStorage` (keyed by session ID)
2. Page transitions to a "results locked" screen:
   - Blurred IQ score preview card (visible but unreadable)
   - Lock icon + "Create a free account to see your score"
   - Two buttons: **Sign Up** | **Log In**
3. **If already logged in:** skip gate entirely, go straight to results

**After auth completes:**
- Supabase OAuth callback redirects to `/iq-test?unlock=true`
- Page reads answers from `localStorage`, scores them, saves result to `iq_results` table
- Renders full results dashboard

---

## Scoring Algorithm

```
Raw score = sum of weighted correct answers (weight = difficulty of question)
Scaled IQ = 100 + 15 × ((rawScore - meanScore) / stdDev)
Clamped to [60, 145]
```

Per-index scores (FRI, QRI, VCI, VSI) computed separately for the radar chart.

---

## Results Dashboard (post-auth)

**Layout (single scrollable page):**

1. **Hero score** — Large IQ number (e.g. `IQ 127`), percentile (`98th percentile`), classification label (`Superior Range`)
2. **Bell curve** — SVG showing population distribution with a marker at user's score, sigma markings at 70/85/100/115/130/145
3. **Radar chart** — 5-axis: FRI / VCI / VSI / QRI / WMI (WMI estimated from response-time variance). Built with a lightweight SVG radar, no chart library needed.
4. **Written analysis** — 3–4 sentences generated from score bands (static copy mapped to score ranges, not AI-generated)
5. **CTA** — "See universities matched to students like you →" linking back to `/discover`

Same Liquid Glass aesthetic: dark bg, green accents, glassmorphic cards.

---

## Database

**New table: `iq_results`**
```sql
id            uuid primary key
user_id       uuid references auth.users
session_id    text          -- for anonymous pre-auth tracking
iq_score      int
fri_score     int
vci_score     int
vsi_score     int
qri_score     int
wmi_score     int           -- estimated
percentile    int
completed_at  timestamp
answers       jsonb         -- full answer log for audit
```

Migration via Prisma schema addition.

---

## Files to Create / Modify

| Action | Path |
|--------|------|
| Create | `src/app/iq-test/page.tsx` |
| Create | `src/app/iq-test/IQTestClient.tsx` — orchestrator |
| Create | `src/app/iq-test/IQTestShell.tsx` — progress bar + card wrapper |
| Create | `src/app/iq-test/IQQuestion.tsx` — flashcard renderer |
| Create | `src/app/iq-test/IQResults.tsx` — full results dashboard |
| Create | `src/app/iq-test/IQLockScreen.tsx` — blurred teaser + auth CTA |
| Create | `src/app/iq-test/iqTestData.ts` — questions + scoring algorithm |
| Create | `src/app/api/iq-results/route.ts` — save result to DB |
| Create | `prisma/migrations/…_add_iq_results.sql` |
| Modify | `src/components/ui/BeforeChinaBanner.tsx` — add IQ test banner |
| Modify | `src/app/globals.css` — add `.liquid-glass` variant if needed |

**Reuse:** `GlassCard`, Supabase client (`@/lib/supabase/client`), existing auth flow (`/login`, `/signup`), Framer Motion already installed, middleware already protects dashboard routes.

---

## Verification

1. `npm run dev` — visit `/iq-test`, confirm background + card renders with liquid glass effect
2. Move mouse over card — 3D tilt + shadow follows cursor
3. Complete all 15 questions — confirm gate screen appears
4. Register new account — confirm redirect to `/iq-test?unlock=true` and results render
5. Log in with existing account — confirm gate is skipped
6. Check Supabase dashboard — `iq_results` row created with correct scores
7. Confirm banner appears on `/`, `/discover`, `/cost-of-living`
