# IQ Test Redesign — Design Spec

**Date:** 2026-04-19  
**Status:** Approved

---

## Context

The existing IQ test was considered too weak and not engaging enough. The redesign replaces it entirely with a high-pressure, visually rich quiz featuring matrix puzzles, spatial reasoning, and tricky math — targeting adult users 18+. The primary business goal is lead capture (name, email, WhatsApp) before revealing results, maximizing CTA conversion by gating the score.

---

## Overview

- **10 versions** × **30 questions** = **300 unique exercises**
- Each version: **20 visual questions** + **10 math questions**
- **Decreasing timer** per question (30s → 10s) for escalating pressure
- **No back button** — forward only
- **Lead gate before results** — email captured first, then score revealed
- Results + lead data saved to **Supabase**

---

## Question Types

### Visual (20 per version)
| Type | Render | Description |
|------|--------|-------------|
| Matrix 3×3 | SVG | Find the missing piece in a 3×3 pattern grid |
| Shape Rotation | SVG | Identify the correctly rotated shape |
| Symbol Grid | SVG | Detect the rule governing a symbol grid |
| Mirror Reflection | Image asset | Which option is the correct mirror image |
| Sequence | SVG | What comes next in a visual sequence |

Each question has **6 answer options (A–F)**.

### Math (10 per version)
| Type | Description |
|------|-------------|
| Number Series | Find the pattern: e.g. 3, 6, 11, 18, 27, ? |
| Tricky Word Problems | Misleading language, cognitive traps, hard for 18+ |
| Visual Math | Shapes assigned values, calculate the missing one |

Each question has **4–6 answer options**. Difficulty: hard (adult level).

---

## Timer — Decreasing Pressure

| Questions | Time Allowed |
|-----------|-------------|
| Q 1–5 | 30 seconds |
| Q 6–10 | 26 seconds |
| Q 11–15 | 22 seconds |
| Q 16–20 | 18 seconds |
| Q 21–25 | 14 seconds |
| Q 26–30 | 10 seconds |

- **On timeout:** auto-advance, question marked wrong
- **Last 5 seconds:** timer badge turns red and pulses
- No back navigation at any point

---

## User Flow

```
Start → Random version assigned (1–10)
      → 30 Questions (no back button, decreasing timer)
      → Lead Gate (name + email + WhatsApp)
      → Results revealed (IQ score + percentile)
```

---

## Visual Design

- **Theme:** Green & black glassmorphism — matches existing site design system
- **Background:** Animated floating orbs (green `#48C59C`, deep green `#1a7a5a`) with blur
- **Card:** `IQTestShell` liquid glass card — `rgba(255,255,255,0.07)` + `backdrop-filter: blur(32px)`
- **Accent:** `#48C59C` / `#5DD4AE` for progress bar, timer, selected state, category label
- **Timer badge:** Green glass pill → turns red + pulsing glow in last 5s
- **Progress bar:** Green gradient with glow, top of card
- **Answer options:** 3×2 grid of glass buttons; selected = green border + green glow
- **Question card:** Inner glass pane with subtle top highlight border

---

## Database

**Model:** `IqTestResult` (Prisma — same DB as rest of app)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto |
| created_at | timestamptz | auto |
| name | text | from lead gate |
| email | text | from lead gate |
| whatsapp | text | from lead gate |
| iq_score | integer | 60–145 |
| version_number | integer | 1–10 |
| total_time_ms | integer | ms from Q1 start to last answer |

---

## Architecture — Files

### Rewrite (complete replacement)
- `src/app/iq-test/iqTestData.ts` — New 300-question bank (10 versions × 30 questions), version selector, scoring logic
- `src/app/iq-test/IQTestClient.tsx` — New orchestrator: 30-question flow, decreasing timer, no back, phase management
- `src/app/iq-test/IQQuestion.tsx` — New renderer: handles SVG question types + image question types

### Update
- `src/app/iq-test/IQResults.tsx` — Simplify to show IQ score + percentile (keep existing bell curve)

> **Note:** `src/app/api/quiz-leads/route.ts` uses Prisma for the general matching quiz and must NOT be modified. The IQ test gets its own dedicated API route.

### New
- `src/app/iq-test/IQTimer.tsx` — Countdown timer component; green → red transition, pulse animation
- `src/app/api/iq-leads/route.ts` — New dedicated API route (Prisma) for IQ test lead + result saving
- `public/iq-images/` — Image assets for mirror/reflection illusion questions
- Prisma migration — adds `IqTestResult` model to schema

### Keep unchanged
- `src/app/iq-test/IQLeadGate.tsx` — Lead capture form (already captures name, email, WhatsApp)
- `src/app/iq-test/IQTestShell.tsx` — Glass card wrapper with 3D tilt
- `src/app/iq-test/IQBackground.tsx` — Background component
- `src/app/iq-test/page.tsx` — Server entry point

---

## Data Structure

```typescript
interface IQQuestionData {
  id: string;                    // e.g. "v1_q01"
  version: number;               // 1–10
  position: number;              // 1–30 within version
  type: 'matrix' | 'rotation' | 'symbol_grid' | 'mirror' | 'sequence'
       | 'number_series' | 'word_problem' | 'visual_math';
  category: 'visual' | 'math';
  prompt: string;                // question text (math) or description (visual)
  renderType: 'svg' | 'image';
  svgData?: MatrixData | RotationData | SymbolGridData | SequenceData;
  imageSrc?: string;             // for mirror/reflection: public/iq-images/...
  options: string[];             // 4 or 6 options
  correctIndex: number;
  difficulty: 1 | 2 | 3;
}

// Version session
interface IQSession {
  version: number;
  questions: IQQuestionData[];   // 30 questions, pre-ordered
}
```

---

## Scoring

- **Correct answers:** 1 point each (weighted by difficulty: easy=1, medium=1.5, hard=2)
- **Weighted score normalized** to IQ range 60–145 using z-score distribution
- **Percentile** calculated from normal CDF (same as existing scoring logic — reuse)
- Version number does not affect scoring (all versions same difficulty distribution)

---

## Verification

1. Run `npm run dev` — navigate to `/iq-test`
2. Confirm 30 questions load, version is randomly assigned 1–10
3. Verify timer decrements correctly per group (30s on Q1, 10s on Q30)
4. Let timer expire on a question — confirm auto-advance and wrong mark
5. Confirm no back button exists
6. Complete all 30 → lead gate appears (not results)
7. Submit lead form → results reveal
8. Check Supabase `iq_test_results` table for saved row with correct version + total_time_ms
9. Test on mobile — ensure 3×2 option grid and matrix render correctly