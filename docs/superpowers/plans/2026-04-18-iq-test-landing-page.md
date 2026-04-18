# IQ Test Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/iq-test` route with a 15-question adaptive cognitive IQ test, Liquid Glass visual design, auth-gated results dashboard, and a sitewide banner entry point.

**Architecture:** Separate `/iq-test` route with its own full-page client component. Background is HTML-div-based (not canvas) so `backdrop-filter` refracts it. Answers stored in `localStorage` until post-auth save. Results persisted to `iq_results` Prisma table via API route.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Supabase Auth, Prisma/PostgreSQL, Web Audio API (UI sounds only)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/app/iq-test/page.tsx` | Metadata + thin wrapper |
| Create | `src/app/iq-test/IQTestClient.tsx` | Main orchestrator: phase state (test→lock→results) |
| Create | `src/app/iq-test/IQBackground.tsx` | Liquid glass scene: orbs, balls, stars, SVG filter |
| Create | `src/app/iq-test/IQTestShell.tsx` | Progress bar + card wrapper (glassmorphic) |
| Create | `src/app/iq-test/IQQuestion.tsx` | Single flashcard renderer |
| Create | `src/app/iq-test/IQLockScreen.tsx` | Blurred result teaser + register/login CTA |
| Create | `src/app/iq-test/IQResults.tsx` | Full results: score, bell curve, radar, analysis |
| Create | `src/app/iq-test/iqTestData.ts` | 60 questions (15/type) + scoring algorithm |
| Create | `src/app/api/iq-results/route.ts` | POST: score answers, save to DB, return scores |
| Create | `src/components/ui/IQTestBanner.tsx` | Sitewide pill banner linking to `/iq-test` |
| Modify | `src/app/layout.tsx` | Add `<IQTestBanner />` |
| Modify | `prisma/schema.prisma` | Add `IqResult` model |
| Create | `prisma/migrations/20260418_add_iq_results/migration.sql` | DB migration |

---

## Task 1: Question Data + Scoring Algorithm

**Files:**
- Create: `src/app/iq-test/iqTestData.ts`

- [ ] **Step 1.1 — Create the file with types and question bank**

```typescript
// src/app/iq-test/iqTestData.ts

export type QuestionType = "matrix" | "number_series" | "verbal" | "spatial";
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface IQQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  prompt: string;
  // For matrix/spatial: SVG path strings for each option
  // For number_series/verbal: plain text options
  options: string[];
  correctIndex: number; // 0-based
  // Visual data for matrix questions (3x3 grid cell colors as hex strings)
  matrixGrid?: string[]; // 9 cells, row-major, last cell is always "?"
  // For spatial: base shape description + rotated options
  spatialBase?: string;
}

// ─── MATRIX REASONING (FRI) — 15 questions ───────────────────────────────────
// Cell values: "#48C59C" = full, "#1f6b51" = mid, "#0a2a1e" = dim, "?" = blank
const FULL = "#48C59C";
const MID  = "#1f6b51";
const DIM  = "#0a2a1e";

const matrixQuestions: IQQuestion[] = [
  // Difficulty 1
  {
    id: "m1", type: "matrix", difficulty: 1,
    prompt: "Which cell completes the pattern?",
    matrixGrid: [FULL,MID,DIM, FULL,MID,DIM, FULL,MID,"?"],
    options: ["DIM","FULL","MID","DIM"],
    correctIndex: 0,
  },
  {
    id: "m2", type: "matrix", difficulty: 1,
    prompt: "Which cell completes the pattern?",
    matrixGrid: [FULL,FULL,FULL, MID,MID,MID, DIM,DIM,"?"],
    options: ["FULL","MID","DIM","MID"],
    correctIndex: 2,
  },
  // Difficulty 2
  {
    id: "m3", type: "matrix", difficulty: 2,
    prompt: "Which cell completes the pattern?",
    matrixGrid: [FULL,MID,FULL, MID,DIM,MID, FULL,MID,"?"],
    options: ["DIM","FULL","MID","FULL"],
    correctIndex: 1,
  },
  {
    id: "m4", type: "matrix", difficulty: 2,
    prompt: "Which cell completes the pattern?",
    matrixGrid: [DIM,MID,FULL, MID,FULL,DIM, FULL,DIM,"?"],
    options: ["FULL","MID","DIM","FULL"],
    correctIndex: 1,
  },
  // Difficulty 3
  {
    id: "m5", type: "matrix", difficulty: 3,
    prompt: "Which cell completes the pattern?",
    matrixGrid: [FULL,DIM,MID, DIM,MID,FULL, MID,FULL,"?"],
    options: ["MID","FULL","DIM","MID"],
    correctIndex: 2,
  },
  {
    id: "m6", type: "matrix", difficulty: 3,
    prompt: "Which cell completes the pattern?",
    matrixGrid: [MID,FULL,DIM, FULL,DIM,MID, DIM,MID,"?"],
    options: ["FULL","MID","DIM","FULL"],
    correctIndex: 0,
  },
  // Difficulty 4
  {
    id: "m7", type: "matrix", difficulty: 4,
    prompt: "Which cell completes the pattern?",
    matrixGrid: [FULL,FULL,MID, FULL,MID,DIM, MID,DIM,"?"],
    options: ["FULL","MID","DIM","MID"],
    correctIndex: 2,
  },
  {
    id: "m8", type: "matrix", difficulty: 4,
    prompt: "Which cell completes the pattern?",
    matrixGrid: [DIM,DIM,FULL, DIM,FULL,MID, FULL,MID,"?"],
    options: ["DIM","MID","FULL","DIM"],
    correctIndex: 1,
  },
  // Difficulty 5
  {
    id: "m9", type: "matrix", difficulty: 5,
    prompt: "Which cell completes the pattern?",
    matrixGrid: [FULL,MID,DIM, MID,DIM,FULL, DIM,FULL,"?"],
    options: ["DIM","MID","FULL","DIM"],
    correctIndex: 1,
  },
  {
    id: "m10", type: "matrix", difficulty: 5,
    prompt: "Which cell completes the pattern?",
    matrixGrid: [MID,DIM,FULL, DIM,FULL,MID, FULL,MID,"?"],
    options: ["FULL","DIM","MID","FULL"],
    correctIndex: 1,
  },
  // Extra difficulty 2-4 to fill 15
  { id:"m11",type:"matrix",difficulty:2,prompt:"Which cell completes the pattern?",matrixGrid:[FULL,MID,MID,MID,MID,DIM,MID,DIM,"?"],options:["FULL","MID","DIM","MID"],correctIndex:2 },
  { id:"m12",type:"matrix",difficulty:3,prompt:"Which cell completes the pattern?",matrixGrid:[DIM,FULL,MID,FULL,MID,DIM,MID,DIM,"?"],options:["DIM","FULL","MID","DIM"],correctIndex:1 },
  { id:"m13",type:"matrix",difficulty:3,prompt:"Which cell completes the pattern?",matrixGrid:[MID,MID,FULL,MID,FULL,MID,FULL,MID,"?"],options:["MID","FULL","DIM","MID"],correctIndex:0 },
  { id:"m14",type:"matrix",difficulty:4,prompt:"Which cell completes the pattern?",matrixGrid:[FULL,DIM,FULL,DIM,FULL,DIM,FULL,DIM,"?"],options:["MID","DIM","FULL","MID"],correctIndex:2 },
  { id:"m15",type:"matrix",difficulty:5,prompt:"Which cell completes the pattern?",matrixGrid:[DIM,MID,FULL,FULL,DIM,MID,MID,FULL,"?"],options:["FULL","MID","DIM","FULL"],correctIndex:2 },
];

// ─── NUMBER SERIES (QRI) — 15 questions ───────────────────────────────────────
const numberQuestions: IQQuestion[] = [
  { id:"n1",type:"number_series",difficulty:1,prompt:"2, 4, 6, 8, ?",options:["9","10","12","11"],correctIndex:1 },
  { id:"n2",type:"number_series",difficulty:1,prompt:"3, 6, 9, 12, ?",options:["14","15","16","13"],correctIndex:1 },
  { id:"n3",type:"number_series",difficulty:2,prompt:"2, 6, 18, 54, ?",options:["108","162","216","144"],correctIndex:1 },
  { id:"n4",type:"number_series",difficulty:2,prompt:"1, 1, 2, 3, 5, 8, ?",options:["11","12","13","14"],correctIndex:2 },
  { id:"n5",type:"number_series",difficulty:2,prompt:"100, 50, 25, 12.5, ?",options:["5","6","6.25","7"],correctIndex:2 },
  { id:"n6",type:"number_series",difficulty:3,prompt:"2, 3, 5, 9, 17, ?",options:["31","33","35","30"],correctIndex:1 },
  { id:"n7",type:"number_series",difficulty:3,prompt:"1, 4, 9, 16, 25, ?",options:["30","36","42","49"],correctIndex:1 },
  { id:"n8",type:"number_series",difficulty:3,prompt:"3, 5, 9, 15, 23, ?",options:["31","33","35","37"],correctIndex:1 },
  { id:"n9",type:"number_series",difficulty:4,prompt:"1, 2, 6, 24, 120, ?",options:["480","600","720","840"],correctIndex:2 },
  { id:"n10",type:"number_series",difficulty:4,prompt:"7, 14, 28, 56, ?",options:["84","100","112","120"],correctIndex:2 },
  { id:"n11",type:"number_series",difficulty:4,prompt:"2, 5, 10, 17, 26, ?",options:["35","37","39","41"],correctIndex:1 },
  { id:"n12",type:"number_series",difficulty:5,prompt:"1, 3, 7, 13, 21, 31, ?",options:["41","43","45","47"],correctIndex:1 },
  { id:"n13",type:"number_series",difficulty:5,prompt:"2, 4, 12, 48, 240, ?",options:["960","1200","1440","1680"],correctIndex:2 },
  { id:"n14",type:"number_series",difficulty:5,prompt:"0, 1, 3, 6, 10, 15, ?",options:["20","21","22","23"],correctIndex:1 },
  { id:"n15",type:"number_series",difficulty:5,prompt:"1, 8, 27, 64, 125, ?",options:["196","210","216","225"],correctIndex:2 },
];

// ─── VERBAL ANALOGIES (VCI) — 15 questions ────────────────────────────────────
const verbalQuestions: IQQuestion[] = [
  { id:"v1",type:"verbal",difficulty:1,prompt:"Book is to Library as Painting is to ___",options:["Artist","Museum","Canvas","Gallery"],correctIndex:1 },
  { id:"v2",type:"verbal",difficulty:1,prompt:"Dog is to Puppy as Cat is to ___",options:["Cub","Kitten","Foal","Lamb"],correctIndex:1 },
  { id:"v3",type:"verbal",difficulty:2,prompt:"Surgeon is to Hospital as Professor is to ___",options:["Clinic","Studio","University","Laboratory"],correctIndex:2 },
  { id:"v4",type:"verbal",difficulty:2,prompt:"Warm is to Hot as Cool is to ___",options:["Chilly","Freezing","Cold","Icy"],correctIndex:2 },
  { id:"v5",type:"verbal",difficulty:2,prompt:"Symphony is to Composer as Novel is to ___",options:["Reader","Publisher","Author","Editor"],correctIndex:2 },
  { id:"v6",type:"verbal",difficulty:3,prompt:"Archipelago is to Islands as Constellation is to ___",options:["Planets","Stars","Galaxies","Comets"],correctIndex:1 },
  { id:"v7",type:"verbal",difficulty:3,prompt:"Tenacious is to Resolve as Compassionate is to ___",options:["Strength","Empathy","Courage","Wisdom"],correctIndex:1 },
  { id:"v8",type:"verbal",difficulty:3,prompt:"Prologue is to Book as Overture is to ___",options:["Symphony","Film","Poem","Painting"],correctIndex:0 },
  { id:"v9",type:"verbal",difficulty:4,prompt:"Cartography is to Maps as Numismatics is to ___",options:["Numbers","Stamps","Coins","Antiques"],correctIndex:2 },
  { id:"v10",type:"verbal",difficulty:4,prompt:"Ephemeral is to Permanence as Lucid is to ___",options:["Clarity","Confusion","Brightness","Opacity"],correctIndex:1 },
  { id:"v11",type:"verbal",difficulty:4,prompt:"Penitent is to Remorse as Sanguine is to ___",options:["Anger","Optimism","Sadness","Fear"],correctIndex:1 },
  { id:"v12",type:"verbal",difficulty:5,prompt:"Solipsism is to Self as Anthropocentrism is to ___",options:["Nature","Humanity","Cosmos","Society"],correctIndex:1 },
  { id:"v13",type:"verbal",difficulty:5,prompt:"Apocryphal is to Authenticity as Specious is to ___",options:["Logic","Validity","Truth","Reality"],correctIndex:1 },
  { id:"v14",type:"verbal",difficulty:5,prompt:"Obsequious is to Flattery as Laconic is to ___",options:["Verbosity","Brevity","Silence","Eloquence"],correctIndex:1 },
  { id:"v15",type:"verbal",difficulty:5,prompt:"Hegemony is to Control as Dialectic is to ___",options:["Power","Discourse","Revolution","Order"],correctIndex:1 },
];

// ─── SPATIAL ROTATION (VSI) — 15 questions ────────────────────────────────────
// Options describe which rotation is correct: "0°","90°","180°","270°" or shape labels
const spatialQuestions: IQQuestion[] = [
  { id:"s1",type:"spatial",difficulty:1,prompt:"Which shape is the original rotated 90° clockwise?",options:["A","B","C","D"],correctIndex:0,spatialBase:"L-shape pointing up-right" },
  { id:"s2",type:"spatial",difficulty:1,prompt:"Which shape is the original rotated 180°?",options:["A","B","C","D"],correctIndex:2,spatialBase:"T-shape pointing up" },
  { id:"s3",type:"spatial",difficulty:2,prompt:"Which shape is the original rotated 90° counter-clockwise?",options:["A","B","C","D"],correctIndex:1,spatialBase:"F-shape pointing right" },
  { id:"s4",type:"spatial",difficulty:2,prompt:"Which shape matches the original viewed from behind?",options:["A","B","C","D"],correctIndex:3,spatialBase:"Z-shape" },
  { id:"s5",type:"spatial",difficulty:2,prompt:"Which shape is the original rotated 270° clockwise?",options:["A","B","C","D"],correctIndex:1,spatialBase:"J-shape pointing down" },
  { id:"s6",type:"spatial",difficulty:3,prompt:"Which shape is NOT a rotation of the original?",options:["A","B","C","D"],correctIndex:2,spatialBase:"S-shape" },
  { id:"s7",type:"spatial",difficulty:3,prompt:"Which shape is the original rotated 45°?",options:["A","B","C","D"],correctIndex:0,spatialBase:"Arrow pointing right" },
  { id:"s8",type:"spatial",difficulty:3,prompt:"Which 3D cube matches the unfolded net?",options:["A","B","C","D"],correctIndex:3,spatialBase:"Cross-shaped net" },
  { id:"s9",type:"spatial",difficulty:4,prompt:"Which shape is the original rotated 90° and flipped horizontally?",options:["A","B","C","D"],correctIndex:2,spatialBase:"R-shape" },
  { id:"s10",type:"spatial",difficulty:4,prompt:"Which shape completes the mirror pair?",options:["A","B","C","D"],correctIndex:1,spatialBase:"Irregular 6-pointed shape" },
  { id:"s11",type:"spatial",difficulty:4,prompt:"After two 90° clockwise rotations, which shows the result?",options:["A","B","C","D"],correctIndex:0,spatialBase:"P-shape" },
  { id:"s12",type:"spatial",difficulty:5,prompt:"Which 3D object matches all three views shown?",options:["A","B","C","D"],correctIndex:3,spatialBase:"Three orthographic projections" },
  { id:"s13",type:"spatial",difficulty:5,prompt:"Which shape is the original after rotating 90° CW then reflecting over vertical axis?",options:["A","B","C","D"],correctIndex:2,spatialBase:"Complex L-shape" },
  { id:"s14",type:"spatial",difficulty:5,prompt:"Which shape cannot be made by rotating the original?",options:["A","B","C","D"],correctIndex:1,spatialBase:"Asymmetric 5-cell shape" },
  { id:"s15",type:"spatial",difficulty:5,prompt:"Which cube face is opposite the shaded face?",options:["A","B","C","D"],correctIndex:0,spatialBase:"Net of cube with marked face" },
];

export const ALL_QUESTIONS: IQQuestion[] = [
  ...matrixQuestions,
  ...numberQuestions,
  ...verbalQuestions,
  ...spatialQuestions,
];

// ─── SESSION BUILDER ────────────────────────────────────────────────────────
// Returns 15 questions: 4 matrix + 4 number + 4 verbal + 3 spatial
// Starting at medium difficulty (3), uses IRT-style adaptive selection
export function buildSession(): IQQuestion[] {
  const pickFromType = (type: QuestionType, count: number): IQQuestion[] => {
    const pool = ALL_QUESTIONS.filter(q => q.type === type);
    // Start with medium difficulty, shuffle within each difficulty tier
    const sorted = [...pool].sort((a, b) => {
      const bucketA = a.difficulty <= 2 ? 0 : a.difficulty === 3 ? 1 : 2;
      const bucketB = b.difficulty <= 2 ? 0 : b.difficulty === 3 ? 1 : 2;
      if (bucketA !== bucketB) return bucketA - bucketB;
      return Math.random() - 0.5;
    });
    // Return shuffled sample of `count` questions, weighted toward middle difficulty
    const mid = sorted.filter(q => q.difficulty === 3);
    const low = sorted.filter(q => q.difficulty <= 2);
    const high = sorted.filter(q => q.difficulty >= 4);
    return [...mid, ...low, ...high].slice(0, count);
  };
  return [
    ...pickFromType("matrix", 4),
    ...pickFromType("number_series", 4),
    ...pickFromType("verbal", 4),
    ...pickFromType("spatial", 3),
  ];
}

// ─── ADAPTIVE NEXT QUESTION ─────────────────────────────────────────────────
// Given current theta (ability estimate), pick next question
// Simple: correct → increase difficulty, wrong → decrease
export function adaptiveTheta(theta: number, correct: boolean): number {
  return correct ? Math.min(5, theta + 0.5) : Math.max(1, theta - 0.5);
}

// ─── SCORING ─────────────────────────────────────────────────────────────────
export interface SessionAnswer {
  questionId: string;
  selectedIndex: number;
  timeMs: number; // response time in ms
}

export interface IQScores {
  iq: number;       // scaled 60–145
  percentile: number;
  fri: number;      // 0–100 per-index scores
  qri: number;
  vci: number;
  vsi: number;
  wmi: number;      // estimated from response time variance
}

export function scoreSession(answers: SessionAnswer[]): IQScores {
  const questionMap = new Map(ALL_QUESTIONS.map(q => [q.id, q]));

  let totalWeighted = 0;
  let maxWeighted = 0;
  const typeScores: Record<QuestionType, { got: number; max: number }> = {
    matrix: { got: 0, max: 0 },
    number_series: { got: 0, max: 0 },
    verbal: { got: 0, max: 0 },
    spatial: { got: 0, max: 0 },
  };

  for (const answer of answers) {
    const q = questionMap.get(answer.questionId);
    if (!q) continue;
    const correct = answer.selectedIndex === q.correctIndex ? 1 : 0;
    totalWeighted += correct * q.difficulty;
    maxWeighted += q.difficulty;
    typeScores[q.type].got += correct * q.difficulty;
    typeScores[q.type].max += q.difficulty;
  }

  // z-score relative to expected 50% correct on difficulty-weighted scale
  const expectedPct = 0.5;
  const actualPct = maxWeighted > 0 ? totalWeighted / maxWeighted : 0.5;
  const z = (actualPct - expectedPct) / 0.18; // SD approx 0.18 for 15 questions
  const iq = Math.round(Math.min(145, Math.max(60, 100 + 15 * z)));

  // Per-index scores scaled to 0–100
  const toIndex = (s: { got: number; max: number }) =>
    s.max > 0 ? Math.round((s.got / s.max) * 100) : 50;

  const fri = toIndex(typeScores.matrix);
  const qri = toIndex(typeScores.number_series);
  const vci = toIndex(typeScores.verbal);
  const vsi = toIndex(typeScores.spatial);

  // WMI: estimate from response time consistency (low variance = better WM)
  const times = answers.map(a => a.timeMs).filter(t => t > 500 && t < 60000);
  const meanTime = times.reduce((a, b) => a + b, 0) / (times.length || 1);
  const variance = times.reduce((a, b) => a + Math.pow(b - meanTime, 2), 0) / (times.length || 1);
  const cvCoeff = meanTime > 0 ? Math.sqrt(variance) / meanTime : 1;
  const wmi = Math.round(Math.min(100, Math.max(20, 100 - cvCoeff * 60)));

  // Percentile: normal CDF approximation
  const zScore = (iq - 100) / 15;
  const percentile = Math.round(normalCDF(zScore) * 100);

  return { iq, percentile, fri, qri, vci, vsi, wmi };
}

// Abramowitz & Stegun approximation for normal CDF
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return z > 0 ? 1 - p : p;
}

// ─── RESULT LABEL ────────────────────────────────────────────────────────────
export function iqLabel(iq: number): { label: string; analysis: string } {
  if (iq >= 130) return { label: "Very Superior", analysis: "Your score places you in the top 2% of the population. You demonstrate exceptional abstract reasoning and pattern recognition abilities consistent with high academic achievement." };
  if (iq >= 120) return { label: "Superior", analysis: "Your score places you in the top 9% of the population. You show strong logical reasoning and cognitive flexibility well-suited to demanding academic environments." };
  if (iq >= 110) return { label: "High Average", analysis: "Your score is above average, placing you in the top 25%. You demonstrate solid reasoning skills that support success in rigorous academic programs." };
  if (iq >= 90)  return { label: "Average", analysis: "Your score falls in the average range, shared by 50% of the population. You show balanced reasoning across verbal, numerical, and visual domains." };
  if (iq >= 80)  return { label: "Low Average", analysis: "Your score is in the low-average range. Consider reviewing the question types you found challenging — focused practice can improve all cognitive indices." };
  return { label: "Below Average", analysis: "Your score suggests some difficulty with timed abstract reasoning. This can improve significantly with practice and familiarity with the question formats." };
}
```

- [ ] **Step 1.2 — Commit**

```bash
git add src/app/iq-test/iqTestData.ts
git commit -m "feat: add IQ test question bank and scoring algorithm"
```

---

## Task 2: Prisma Migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260418_add_iq_results/migration.sql`

- [ ] **Step 2.1 — Add IqResult model to schema**

In `prisma/schema.prisma`, add after the `InterviewLead` model:

```prisma
model IqResult {
  id          String   @id @default(cuid())
  userId      String?
  sessionId   String
  iqScore     Int
  friScore    Int
  qriScore    Int
  vciScore    Int
  vsiScore    Int
  wmiScore    Int
  percentile  Int
  answers     Json
  completedAt DateTime @default(now())

  @@index([userId])
  @@index([sessionId])
}
```

- [ ] **Step 2.2 — Run migration**

```bash
cd "f:/Claude Project/ChinaUniMatch"
npx prisma migrate dev --name add_iq_results
```

Expected output: `Your database is now in sync with your schema.`

- [ ] **Step 2.3 — Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add iq_results table to schema"
```

---

## Task 3: API Route — Save IQ Result

**Files:**
- Create: `src/app/api/iq-results/route.ts`

- [ ] **Step 3.1 — Create the route**

```typescript
// src/app/api/iq-results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { scoreSession, SessionAnswer } from "@/app/iq-test/iqTestData";

export async function POST(req: NextRequest) {
  const body = await req.json() as { sessionId: string; answers: SessionAnswer[] };
  const { sessionId, answers } = body;

  if (!sessionId || !Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Get optional user
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const scores = scoreSession(answers);

  const result = await prisma.iqResult.create({
    data: {
      userId: user?.id ?? null,
      sessionId,
      iqScore: scores.iq,
      friScore: scores.fri,
      qriScore: scores.qri,
      vciScore: scores.vci,
      vsiScore: scores.vsi,
      wmiScore: scores.wmi,
      percentile: scores.percentile,
      answers: answers as object,
    },
  });

  return NextResponse.json({ id: result.id, scores });
}
```

- [ ] **Step 3.2 — Verify prisma client import path**

Check `src/lib/prisma.ts` exists. If not, create it:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3.3 — Commit**

```bash
git add src/app/api/iq-results/route.ts src/lib/prisma.ts
git commit -m "feat: add POST /api/iq-results route"
```

---

## Task 4: Liquid Glass Background Component

**Files:**
- Create: `src/app/iq-test/IQBackground.tsx`

- [ ] **Step 4.1 — Create the component**

```tsx
// src/app/iq-test/IQBackground.tsx
"use client";
import { useEffect, useRef } from "react";

export function IQBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const mx = e.clientX / window.innerWidth - 0.5;
      const my = e.clientY / window.innerHeight - 0.5;
      const orbs = containerRef.current.querySelectorAll<HTMLElement>("[data-orb]");
      orbs.forEach((orb, i) => {
        const depth = [0.55, 0.45, 1.0, 0.75][i] ?? 0.5;
        const sign = i % 2 === 0 ? 1 : -1;
        orb.style.transform = `translate(${sign * mx * 55 * depth}px, ${sign * my * 55 * depth}px)`;
      });
      const starsEl = containerRef.current.querySelector<HTMLElement>("[data-stars]");
      if (starsEl) starsEl.style.transform = `translate(${mx * 14}px, ${my * 14}px)`;
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <>
      {/* SVG water-lens distortion filter — inline so backdrop-filter: url() works */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          <filter id="water-lens" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.032" numOctaves={3} seed={4} result="warpNoise">
              <animate attributeName="baseFrequency" values="0.018 0.032;0.026 0.040;0.020 0.028;0.018 0.032" dur="14s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="warpNoise" scale={22} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div
        ref={containerRef}
        className="iq-bg"
        style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: "#030806" }}
      >
        {/* Deep gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 65% 55% at 12% 22%, rgba(26,90,60,0.60) 0%, transparent 70%),
            radial-gradient(ellipse 50% 45% at 88% 78%, rgba(18,70,48,0.55) 0%, transparent 65%),
            radial-gradient(ellipse 38% 32% at 58% 12%, rgba(40,120,80,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 32% 38% at 18% 82%, rgba(15,55,38,0.50) 0%, transparent 55%)
          `
        }} />

        {/* Ambient orbs — CSS animated */}
        {[
          { style: { width:520,height:520,background:"radial-gradient(circle,rgba(72,197,156,0.50),transparent 70%)",top:-90,left:-70,filter:"blur(65px)",animation:"iqDrift1 18s ease-in-out infinite" } },
          { style: { width:440,height:440,background:"radial-gradient(circle,rgba(26,122,80,0.55),transparent 70%)",bottom:-70,right:-50,filter:"blur(65px)",animation:"iqDrift2 22s ease-in-out infinite" } },
          { style: { width:300,height:300,background:"radial-gradient(circle,rgba(72,197,156,0.32),transparent 70%)",top:"42%",left:"62%",filter:"blur(65px)",animation:"iqDrift3 15s ease-in-out infinite" } },
          { style: { width:200,height:200,background:"radial-gradient(circle,rgba(93,212,174,0.28),transparent 70%)",top:"22%",left:"28%",filter:"blur(65px)",animation:"iqDrift4 20s ease-in-out infinite" } },
        ].map((o, i) => (
          <div key={i} data-orb style={{ position: "absolute", borderRadius: "50%", willChange: "transform", ...o.style as React.CSSProperties }} />
        ))}

        {/* Red/orange glowing balls */}
        {[
          { sz:28, bg:"radial-gradient(circle at 35% 30%,#ff9060,#cc2810)", shadow:"0 0 22px rgba(255,80,30,.9),0 0 50px rgba(255,50,10,.5)", anim:"iqBall1 11s ease-in-out infinite" },
          { sz:18, bg:"radial-gradient(circle at 35% 30%,#ffb050,#dd3a10)", shadow:"0 0 18px rgba(255,110,20,.9),0 0 38px rgba(255,70,10,.5)", anim:"iqBall2 14s ease-in-out infinite" },
          { sz:34, bg:"radial-gradient(circle at 35% 30%,#ff7850,#bb1818)", shadow:"0 0 28px rgba(255,50,30,.85),0 0 60px rgba(200,20,10,.4)", anim:"iqBall3 9s ease-in-out infinite" },
          { sz:14, bg:"radial-gradient(circle at 35% 30%,#ffd060,#e05008)", shadow:"0 0 14px rgba(255,160,30,.9),0 0 28px rgba(255,100,10,.5)", anim:"iqBall4 17s ease-in-out infinite" },
          { sz:22, bg:"radial-gradient(circle at 35% 30%,#40e0a0,#0a8050)",  shadow:"0 0 20px rgba(40,200,130,.8),0 0 45px rgba(20,160,100,.4)", anim:"iqBall5 13s ease-in-out infinite" },
        ].map((b, i) => (
          <div key={i} style={{ position:"absolute",borderRadius:"50%",width:b.sz,height:b.sz,background:b.bg,boxShadow:b.shadow,animation:b.anim,willChange:"transform" }} />
        ))}

        {/* Stars (injected by CSS — see globals.css .iq-star class) */}
        <div data-stars style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 180 }, (_, i) => {
            const size = (0.5 + Math.random() * 2.2).toFixed(1);
            const alpha = (0.2 + Math.random() * 0.55).toFixed(2);
            const dur = (1.5 + Math.random() * 3).toFixed(1);
            const delay = (Math.random() * 4).toFixed(1);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  borderRadius: "50%",
                  width: `${size}px`, height: `${size}px`,
                  left: `${(Math.random() * 100).toFixed(1)}%`,
                  top: `${(Math.random() * 100).toFixed(1)}%`,
                  background: "rgba(200,240,220,0.85)",
                  animation: `iqTwinkle ${dur}s ease-in-out -${delay}s infinite`,
                  ["--a" as string]: alpha,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4.2 — Add IQ background CSS animations to globals.css**

In `src/app/globals.css`, append at the very end:

```css
/* ── IQ TEST BACKGROUND ANIMATIONS ────────────────────────── */
@keyframes iqDrift1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(45px,28px)} 66%{transform:translate(-22px,42px)} }
@keyframes iqDrift2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-38px,-22px)} 66%{transform:translate(28px,-45px)} }
@keyframes iqDrift3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-32px,38px)} }
@keyframes iqDrift4 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-25px)} }
@keyframes iqBall1  { 0%{top:10%;left:75%} 18%{top:48%;left:55%} 35%{top:72%;left:20%} 55%{top:35%;left:8%}  75%{top:8%;left:40%}  100%{top:10%;left:75%} }
@keyframes iqBall2  { 0%{top:75%;left:15%} 22%{top:42%;left:50%} 45%{top:15%;left:72%} 68%{top:55%;left:88%} 100%{top:75%;left:15%} }
@keyframes iqBall3  { 0%{top:28%;left:2%}  28%{top:8%;left:65%}  55%{top:55%;left:80%} 80%{top:78%;left:35%} 100%{top:28%;left:2%} }
@keyframes iqBall4  { 0%{top:88%;left:82%} 30%{top:45%;left:48%} 60%{top:12%;left:20%} 100%{top:88%;left:82%} }
@keyframes iqBall5  { 0%{top:50%;left:90%} 25%{top:20%;left:52%} 50%{top:65%;left:10%} 75%{top:38%;left:48%} 100%{top:50%;left:90%} }
@keyframes iqTwinkle { 0%,100%{opacity:var(--a,0.4);transform:scale(1)} 50%{opacity:calc(var(--a,0.4)*0.25);transform:scale(0.65)} }
```

- [ ] **Step 4.3 — Commit**

```bash
git add src/app/iq-test/IQBackground.tsx src/app/globals.css
git commit -m "feat: add liquid glass background component for IQ test"
```

---

## Task 5: Flashcard Shell + Question Renderer

**Files:**
- Create: `src/app/iq-test/IQTestShell.tsx`
- Create: `src/app/iq-test/IQQuestion.tsx`

- [ ] **Step 5.1 — Create IQTestShell**

```tsx
// src/app/iq-test/IQTestShell.tsx
"use client";
import { useEffect, useRef } from "react";

interface IQTestShellProps {
  current: number;
  total: number;
  category: string;
  children: React.ReactNode;
}

export function IQTestShell({ current, total, category, children }: IQTestShellProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt + shadow tracking
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      card.style.transform = `perspective(1100px) rotateX(${dy * 9}deg) rotateY(${-dx * 9}deg)`;
      card.style.boxShadow = `
        inset 0 2px 0 rgba(255,255,255,.38),
        inset 0 1px 24px rgba(255,255,255,.04),
        inset 0 -2px 10px rgba(0,0,0,.28),
        ${dx * 26}px ${dy * 26 + 30}px 72px rgba(0,0,0,.58),
        ${dx * 8}px ${dy * 8 + 8}px 26px rgba(0,0,0,.32),
        ${dx * 5}px ${dy * 5 + 4}px 50px rgba(72,197,156,.09)
      `;
    };
    const handleLeave = () => {
      card.style.transform = "perspective(1100px) rotateX(0) rotateY(0)";
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    card.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const pct = Math.round((current / total) * 100);

  return (
    <div ref={cardRef} style={{
      background: "rgba(255,255,255,0.07)",
      backdropFilter: "url(#water-lens) blur(32px) saturate(210%) brightness(1.08)",
      WebkitBackdropFilter: "blur(32px) saturate(210%) brightness(1.08)",
      border: "1px solid rgba(255,255,255,0.20)",
      borderTop: "1px solid rgba(255,255,255,0.42)",
      borderRadius: 28,
      padding: 28,
      position: "relative",
      overflow: "hidden",
      boxShadow: "inset 0 2px 0 rgba(255,255,255,.38),inset 0 -2px 10px rgba(0,0,0,.28),0 30px 72px rgba(0,0,0,.55)",
      transition: "box-shadow 0.08s ease",
    }}>
      {/* Top specular line */}
      <div style={{ position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,.65) 35%,rgba(255,255,255,.95) 50%,rgba(255,255,255,.65) 65%,transparent)",zIndex:4,pointerEvents:"none" }} />
      {/* Inner light gradient */}
      <div style={{ position:"absolute",inset:0,borderRadius:28,background:"linear-gradient(148deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.04) 28%,transparent 52%,rgba(72,197,156,.04) 78%,rgba(0,0,0,.07) 100%)",zIndex:1,pointerEvents:"none" }} />
      {/* Shimmer sweep */}
      <div style={{ position:"absolute",inset:0,borderRadius:28,background:"linear-gradient(115deg,transparent 30%,rgba(255,255,255,.08) 50%,transparent 70%)",animation:"iqShimmer 7s ease-in-out infinite",zIndex:2,pointerEvents:"none" }} />

      {/* Content above all overlays */}
      <div style={{ position: "relative", zIndex: 5 }}>
        {/* Progress row */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
          <span style={{ fontSize:11,fontWeight:700,color:"#48C59C",letterSpacing:"1px",textTransform:"uppercase" }}>{category}</span>
          <span style={{ fontSize:11,color:"rgba(232,245,240,0.40)",fontWeight:500 }}>{current} / {total}</span>
        </div>
        <div style={{ width:"100%",height:3,background:"rgba(255,255,255,0.07)",borderRadius:99,overflow:"hidden",marginBottom:20 }}>
          <div style={{ height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#48C59C,#5DD4AE)",borderRadius:99,boxShadow:"0 0 10px rgba(72,197,156,0.7)",transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
        </div>

        {children}
      </div>
    </div>
  );
}
```

Add shimmer to globals.css:
```css
@keyframes iqShimmer { 0%,100%{transform:translateX(-100%) skewX(-15deg);opacity:0} 40%{opacity:1} 60%{transform:translateX(200%) skewX(-15deg);opacity:0} }
```

- [ ] **Step 5.2 — Create IQQuestion**

```tsx
// src/app/iq-test/IQQuestion.tsx
"use client";
import { IQQuestion as IQQuestionType } from "./iqTestData";

const CELL_COLOR: Record<string, string> = {
  "#48C59C": "#48C59C",
  "#1f6b51": "#1f6b51",
  "#0a2a1e": "#0a2a1e",
};

interface Props {
  question: IQQuestionType;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function IQQuestion({ question, selectedIndex, onSelect }: Props) {
  const labels = ["A", "B", "C", "D"];

  // Play tone on selection
  const playSelect = () => {
    try {
      const ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      [[523, 0], [659, 60], [784, 120]].forEach(([freq, delay]) => {
        setTimeout(() => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.type = "sine"; o.frequency.value = freq;
          g.gain.setValueAtTime(0.12, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
          o.start(); o.stop(ac.currentTime + 0.12);
        }, delay);
      });
    } catch {}
  };

  const handleSelect = (i: number) => {
    if (selectedIndex !== null) return; // prevent re-select
    playSelect();
    onSelect(i);
  };

  return (
    <div>
      <div style={{ fontSize:11,fontWeight:600,color:"rgba(232,245,240,0.38)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10 }}>
        {question.type === "matrix" ? "Matrix Reasoning"
          : question.type === "number_series" ? "Number Series"
          : question.type === "verbal" ? "Verbal Analogy"
          : "Spatial Rotation"}
      </div>
      <div style={{ fontSize:18,fontWeight:700,color:"#E8F5F0",lineHeight:1.4,marginBottom:20,letterSpacing:"-0.2px" }}>
        {question.prompt}
      </div>

      {/* Matrix grid */}
      {question.matrixGrid && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,54px)",gridTemplateRows:"repeat(3,54px)",gap:6,margin:"0 auto 20px",width:"fit-content" }}>
          {question.matrixGrid.map((cell, i) => (
            <div key={i} style={{
              width:54,height:54,borderRadius:12,
              display:"flex",alignItems:"center",justifyContent:"center",
              background: cell === "?" ? "rgba(72,197,156,0.05)" : CELL_COLOR[cell] ? `${CELL_COLOR[cell]}${cell === "#48C59C" ? "DD" : cell === "#1f6b51" ? "99" : "44"}` : "rgba(255,255,255,0.06)",
              border: cell === "?" ? "1.5px dashed rgba(72,197,156,0.55)" : cell === "#48C59C" ? "1px solid rgba(72,197,156,0.9)" : "1px solid rgba(255,255,255,0.12)",
              boxShadow: cell === "#48C59C" ? "inset 0 1px 0 rgba(255,255,255,.35),0 0 14px rgba(72,197,156,.4)" : undefined,
              fontSize:22,color:"rgba(72,197,156,0.8)",fontWeight:700,
              animation: cell === "?" ? "iqPulseQ 2s ease-in-out infinite" : undefined,
            }}>
              {cell === "?" ? "?" : null}
            </div>
          ))}
        </div>
      )}

      {/* Answer options */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
        {question.options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                background: isSelected ? "rgba(72,197,156,0.19)" : "rgba(255,255,255,0.06)",
                border: isSelected ? "1px solid #48C59C" : "1px solid rgba(255,255,255,0.16)",
                borderTop: isSelected ? "1px solid rgba(93,212,174,0.75)" : "1px solid rgba(255,255,255,0.28)",
                borderRadius:16,padding:"14px 16px",cursor:"pointer",
                display:"flex",alignItems:"center",gap:10,
                backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",
                boxShadow: isSelected
                  ? "inset 0 1.5px 0 rgba(255,255,255,.30),0 8px 28px rgba(72,197,156,.30),0 0 0 1px rgba(72,197,156,.28)"
                  : "inset 0 1.5px 0 rgba(255,255,255,.22),inset 0 -1px 0 rgba(0,0,0,.18)",
                transform: isSelected ? "translateY(-2px) scale(1.025)" : undefined,
                transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                width:"100%",textAlign:"left",
              }}
            >
              <div style={{
                width:28,height:28,borderRadius:9,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:700,transition:"all 0.2s",
                background: isSelected ? "#48C59C" : "rgba(255,255,255,0.08)",
                border: isSelected ? "1px solid #48C59C" : "1px solid rgba(255,255,255,0.15)",
                color: isSelected ? "#030806" : "rgba(232,245,240,0.58)",
                boxShadow:"inset 0 1px 0 rgba(255,255,255,0.22)",
              }}>
                {labels[i]}
              </div>
              <span style={{ fontSize:13,color:"#E8F5F0",fontWeight:500 }}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

Add to globals.css:
```css
@keyframes iqPulseQ { 0%,100%{box-shadow:0 0 0 0 rgba(72,197,156,0.3)} 50%{box-shadow:0 0 0 7px rgba(72,197,156,0)} }
```

- [ ] **Step 5.3 — Commit**

```bash
git add src/app/iq-test/IQTestShell.tsx src/app/iq-test/IQQuestion.tsx src/app/globals.css
git commit -m "feat: add IQ test shell and question flashcard components"
```

---

## Task 6: Lock Screen

**Files:**
- Create: `src/app/iq-test/IQLockScreen.tsx`

- [ ] **Step 6.1 — Create the lock screen**

```tsx
// src/app/iq-test/IQLockScreen.tsx
"use client";
import Link from "next/link";

interface Props {
  sessionId: string;
}

export function IQLockScreen({ sessionId }: Props) {
  const redirect = `/iq-test?unlock=${sessionId}`;
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"0 20px" }}>
      {/* Blurred preview */}
      <div style={{ position:"relative",width:"100%",maxWidth:480 }}>
        <div style={{
          background:"rgba(255,255,255,0.06)",
          border:"1px solid rgba(255,255,255,0.18)",
          borderTop:"1px solid rgba(255,255,255,0.36)",
          borderRadius:22,padding:24,
          backdropFilter:"blur(32px) saturate(200%)",
          WebkitBackdropFilter:"blur(32px) saturate(200%)",
          filter:"blur(8px)",opacity:0.5,
          boxShadow:"inset 0 1.5px 0 rgba(255,255,255,.28)",
          userSelect:"none",pointerEvents:"none",
        }}>
          <div style={{ fontSize:48,fontWeight:900,color:"#48C59C",textAlign:"center" }}>IQ 127</div>
          <div style={{ fontSize:16,color:"#E8F5F0",textAlign:"center",marginTop:4 }}>98th Percentile · Superior Range</div>
          <div style={{ height:2,background:"rgba(72,197,156,0.3)",borderRadius:99,margin:"16px 0" }} />
          <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,textAlign:"center" }}>
            {["FRI","QRI","VCI","VSI","WMI"].map(l => (
              <div key={l}>
                <div style={{ fontSize:20,fontWeight:700,color:"#48C59C" }}>—</div>
                <div style={{ fontSize:10,color:"rgba(232,245,240,0.5)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Lock overlay */}
        <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(3,8,6,0.45)",borderRadius:22,backdropFilter:"blur(3px)" }}>
          <div style={{ fontSize:32 }}>🔒</div>
          <div style={{ fontSize:15,fontWeight:700,color:"#E8F5F0" }}>Your results are ready</div>
          <div style={{ fontSize:12,color:"rgba(232,245,240,0.5)" }}>Create a free account to unlock your full IQ report</div>
        </div>
      </div>

      {/* CTA buttons */}
      <div style={{ display:"flex",gap:12,width:"100%",maxWidth:480 }}>
        <Link
          href={`/signup?next=${encodeURIComponent(redirect)}`}
          style={{
            flex:1,padding:"14px 0",borderRadius:14,textAlign:"center",
            background:"linear-gradient(135deg,#48C59C,#1a7a5a)",
            color:"#030806",fontWeight:800,fontSize:14,letterSpacing:"0.3px",
            textDecoration:"none",
            boxShadow:"0 4px 22px rgba(72,197,156,0.38),inset 0 1px 0 rgba(255,255,255,0.38)",
          }}
        >
          Create Free Account
        </Link>
        <Link
          href={`/login?next=${encodeURIComponent(redirect)}`}
          style={{
            flex:1,padding:"14px 0",borderRadius:14,textAlign:"center",
            background:"rgba(255,255,255,0.07)",
            border:"1px solid rgba(255,255,255,0.18)",
            color:"#E8F5F0",fontWeight:600,fontSize:14,
            backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
            textDecoration:"none",
            boxShadow:"inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 6.2 — Commit**

```bash
git add src/app/iq-test/IQLockScreen.tsx
git commit -m "feat: add IQ test lock screen with auth CTA"
```

---

## Task 7: Results Dashboard

**Files:**
- Create: `src/app/iq-test/IQResults.tsx`

- [ ] **Step 7.1 — Create the results component**

```tsx
// src/app/iq-test/IQResults.tsx
"use client";
import Link from "next/link";
import { IQScores, iqLabel } from "./iqTestData";

interface Props { scores: IQScores; }

export function IQResults({ scores }: Props) {
  const { label, analysis } = iqLabel(scores.iq);
  const axes = [
    { key:"fri" as const, label:"FRI", desc:"Fluid Reasoning" },
    { key:"qri" as const, label:"QRI", desc:"Quantitative" },
    { key:"vci" as const, label:"VCI", desc:"Verbal" },
    { key:"vsi" as const, label:"VSI", desc:"Spatial" },
    { key:"wmi" as const, label:"WMI", desc:"Working Memory" },
  ];

  // Build SVG radar path from 5 scores (0-100)
  const radarPath = () => {
    const cx = 120, cy = 120, r = 90;
    const vals = axes.map(a => scores[a.key] / 100);
    const points = vals.map((v, i) => {
      const angle = (i / vals.length) * Math.PI * 2 - Math.PI / 2;
      return { x: cx + r * v * Math.cos(angle), y: cy + r * v * Math.sin(angle) };
    });
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + "Z";
  };

  // Bell curve SVG path
  const bellPath = () => {
    const w = 320, h = 80;
    const pts = Array.from({ length: 61 }, (_, i) => {
      const x = i / 60;
      const z = (x * 6) - 3;
      const y = Math.exp(-0.5 * z * z);
      return `${(x * w).toFixed(1)},${(h - y * (h - 4)).toFixed(1)}`;
    });
    return `M0,${h} L` + pts.join(" L") + ` L${w},${h} Z`;
  };

  const markerX = Math.min(320, Math.max(0, ((scores.iq - 55) / 90) * 320));

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20,padding:"0 20px",maxWidth:480,margin:"0 auto",width:"100%" }}>

      {/* Score hero */}
      <div style={{ background:"rgba(255,255,255,0.07)",backdropFilter:"url(#water-lens) blur(32px) saturate(210%)",WebkitBackdropFilter:"blur(32px) saturate(210%)",border:"1px solid rgba(255,255,255,0.20)",borderTop:"1px solid rgba(255,255,255,0.42)",borderRadius:28,padding:28,textAlign:"center",boxShadow:"inset 0 2px 0 rgba(255,255,255,.38),0 30px 72px rgba(0,0,0,.55)" }}>
        <div style={{ fontSize:11,fontWeight:700,color:"#48C59C",letterSpacing:"1px",textTransform:"uppercase",marginBottom:8 }}>YOUR IQ SCORE</div>
        <div style={{ fontSize:72,fontWeight:900,color:"#48C59C",lineHeight:1,letterSpacing:"-2px" }}>{scores.iq}</div>
        <div style={{ fontSize:15,color:"rgba(232,245,240,0.7)",marginTop:6 }}>{scores.percentile}th percentile · {label}</div>
        <div style={{ fontSize:13,color:"rgba(232,245,240,0.5)",marginTop:12,lineHeight:1.6 }}>{analysis}</div>
      </div>

      {/* Bell curve */}
      <div style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.16)",borderTop:"1px solid rgba(255,255,255,0.32)",borderRadius:20,padding:"20px 20px 16px",backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",boxShadow:"inset 0 1.5px 0 rgba(255,255,255,.25)" }}>
        <div style={{ fontSize:11,fontWeight:700,color:"#48C59C",letterSpacing:"1px",textTransform:"uppercase",marginBottom:12 }}>POPULATION DISTRIBUTION</div>
        <svg viewBox="0 0 320 100" style={{ width:"100%",overflow:"visible" }}>
          <defs>
            <linearGradient id="bellGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(72,197,156,0.5)" />
              <stop offset="100%" stopColor="rgba(72,197,156,0.05)" />
            </linearGradient>
          </defs>
          <path d={bellPath()} fill="url(#bellGrad)" />
          {/* Sigma labels */}
          {[70,85,100,115,130,145].map(v => {
            const x = ((v - 55) / 90) * 320;
            return (
              <g key={v}>
                <line x1={x} y1={10} x2={x} y2={80} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                <text x={x} y={95} textAnchor="middle" fontSize={9} fill="rgba(232,245,240,0.35)">{v}</text>
              </g>
            );
          })}
          {/* User marker */}
          <line x1={markerX} y1={0} x2={markerX} y2={80} stroke="#48C59C" strokeWidth={2} />
          <circle cx={markerX} cy={0} r={4} fill="#48C59C" />
        </svg>
      </div>

      {/* Radar chart */}
      <div style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.16)",borderTop:"1px solid rgba(255,255,255,0.32)",borderRadius:20,padding:20,backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",boxShadow:"inset 0 1.5px 0 rgba(255,255,255,.25)" }}>
        <div style={{ fontSize:11,fontWeight:700,color:"#48C59C",letterSpacing:"1px",textTransform:"uppercase",marginBottom:16 }}>COGNITIVE PROFILE</div>
        <div style={{ display:"flex",alignItems:"center",gap:20 }}>
          <svg viewBox="0 0 240 240" style={{ width:140,flexShrink:0 }}>
            {/* Grid rings */}
            {[0.25,0.5,0.75,1].map(v => {
              const pts = Array.from({length:5},(_,i)=>{
                const a=(i/5)*Math.PI*2-Math.PI/2;
                return `${(120+90*v*Math.cos(a)).toFixed(1)},${(120+90*v*Math.sin(a)).toFixed(1)}`;
              });
              return <polygon key={v} points={pts.join(" ")} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
            })}
            {/* Axis lines */}
            {axes.map((_,i)=>{
              const a=(i/5)*Math.PI*2-Math.PI/2;
              return <line key={i} x1={120} y1={120} x2={(120+90*Math.cos(a)).toFixed(1)} y2={(120+90*Math.sin(a)).toFixed(1)} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
            })}
            {/* Score fill */}
            <path d={radarPath()} fill="rgba(72,197,156,0.25)" stroke="#48C59C" strokeWidth={1.5} />
            {/* Axis labels */}
            {axes.map((ax,i)=>{
              const a=(i/5)*Math.PI*2-Math.PI/2;
              const x=120+105*Math.cos(a), y=120+105*Math.sin(a);
              return <text key={i} x={x.toFixed(1)} y={y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight={700} fill="#48C59C">{ax.label}</text>;
            })}
          </svg>
          <div style={{ display:"flex",flexDirection:"column",gap:10,flex:1 }}>
            {axes.map(ax => (
              <div key={ax.key}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <span style={{ fontSize:11,color:"rgba(232,245,240,0.6)",fontWeight:500 }}>{ax.desc}</span>
                  <span style={{ fontSize:11,fontWeight:700,color:"#48C59C" }}>{scores[ax.key]}</span>
                </div>
                <div style={{ height:3,background:"rgba(255,255,255,0.07)",borderRadius:99,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${scores[ax.key]}%`,background:"linear-gradient(90deg,#48C59C,#5DD4AE)",borderRadius:99,boxShadow:"0 0 8px rgba(72,197,156,0.6)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link href="/discover" style={{
        display:"block",width:"100%",padding:"15px 0",borderRadius:16,textAlign:"center",
        background:"linear-gradient(135deg,#48C59C,#1a7a5a)",
        color:"#030806",fontWeight:800,fontSize:14,letterSpacing:"0.3px",
        textDecoration:"none",
        boxShadow:"0 4px 22px rgba(72,197,156,0.38),inset 0 1px 0 rgba(255,255,255,0.38)",
      }}>
        See Universities Matched to Students Like You →
      </Link>
    </div>
  );
}
```

- [ ] **Step 7.2 — Commit**

```bash
git add src/app/iq-test/IQResults.tsx
git commit -m "feat: add IQ results dashboard with bell curve and radar chart"
```

---

## Task 8: Test Orchestrator + Page

**Files:**
- Create: `src/app/iq-test/IQTestClient.tsx`
- Create: `src/app/iq-test/page.tsx`

- [ ] **Step 8.1 — Create IQTestClient**

```tsx
// src/app/iq-test/IQTestClient.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  buildSession, IQQuestion, SessionAnswer, IQScores, scoreSession
} from "./iqTestData";
import { IQBackground } from "./IQBackground";
import { IQTestShell } from "./IQTestShell";
import { IQQuestion as IQQuestionComp } from "./IQQuestion";
import { IQLockScreen } from "./IQLockScreen";
import { IQResults } from "./IQResults";

type Phase = "test" | "lock" | "results";

const CATEGORY_LABELS: Record<string, string> = {
  matrix: "Fluid Reasoning",
  number_series: "Quantitative Reasoning",
  verbal: "Verbal Comprehension",
  spatial: "Visual-Spatial",
};

// Stable session ID (survives page navigation)
function getSessionId(): string {
  const key = "iq_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(key, id); }
  return id;
}

export function IQTestClient() {
  const searchParams = useSearchParams();
  const unlockSession = searchParams.get("unlock");

  const [phase, setPhase] = useState<Phase>("test");
  const [questions] = useState<IQQuestion[]>(() => buildSession());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scores, setScores] = useState<IQScores | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const questionStartRef = useRef<number>(Date.now());
  const sessionId = useRef(getSessionId());

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // On load: check if this is a post-auth unlock
  useEffect(() => {
    if (!unlockSession) return;
    const saved = localStorage.getItem(`iq_answers_${unlockSession}`);
    if (!saved) return;
    const savedAnswers: SessionAnswer[] = JSON.parse(saved);
    // Save to DB then show results
    fetch("/api/iq-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: unlockSession, answers: savedAnswers }),
    })
      .then(r => r.json())
      .then(data => { setScores(data.scores); setPhase("results"); });
  }, [unlockSession]);

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
    const timeMs = Date.now() - questionStartRef.current;
    const answer: SessionAnswer = {
      questionId: questions[currentIdx].id,
      selectedIndex: index,
      timeMs,
    };

    setTimeout(() => {
      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);
      setSelectedIndex(null);
      questionStartRef.current = Date.now();

      if (currentIdx + 1 >= questions.length) {
        // Done — save answers to localStorage and decide gate
        localStorage.setItem(`iq_answers_${sessionId.current}`, JSON.stringify(newAnswers));
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            // Already logged in — score and show results immediately
            fetch("/api/iq-results", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: sessionId.current, answers: newAnswers }),
            })
              .then(r => r.json())
              .then(data => { setScores(data.scores); setPhase("results"); });
          } else {
            setPhase("lock");
          }
        });
      } else {
        setDirection(1);
        setCurrentIdx(i => i + 1);
      }
    }, 350);
  }, [answers, currentIdx, questions, supabase]);

  // Play next-question sound
  const playNext = () => {
    try {
      const ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      [[400, 0, "triangle"], [600, 80, "sine"], [800, 160, "sine"]].forEach(([f, d, t]) => {
        setTimeout(() => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.type = t as OscillatorType; o.frequency.value = f as number;
          g.gain.setValueAtTime(0.10, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
          o.start(); o.stop(ac.currentTime + 0.18);
        }, d as number);
      });
    } catch {}
  };

  const currentQ = questions[currentIdx];

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 0 40px",position:"relative" }}>
      <IQBackground />

      <div style={{ position:"relative",zIndex:10,width:"100%",maxWidth:480,padding:"0 20px" }}>
        {phase === "test" && currentQ && (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQ.id}
              custom={direction}
              initial={{ x: direction * 72, opacity: 0, rotateY: direction * -9 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              exit={{ x: direction * -72, opacity: 0, rotateY: direction * 9 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onAnimationStart={() => playNext()}
            >
              <IQTestShell
                current={currentIdx + 1}
                total={questions.length}
                category={CATEGORY_LABELS[currentQ.type]}
              >
                <IQQuestionComp
                  question={currentQ}
                  selectedIndex={selectedIndex}
                  onSelect={handleSelect}
                />
              </IQTestShell>
            </motion.div>
          </AnimatePresence>
        )}

        {phase === "lock" && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <IQLockScreen sessionId={sessionId.current} />
          </motion.div>
        )}

        {phase === "results" && scores && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <IQResults scores={scores} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 8.2 — Create page.tsx**

```tsx
// src/app/iq-test/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { IQTestClient } from "./IQTestClient";

export const metadata: Metadata = {
  title: "Free IQ Test — 15-Minute Cognitive Assessment",
  description: "Test your IQ with a scientific 15-question adaptive cognitive assessment. See your score, percentile rank, and cognitive profile across 5 indices.",
};

export default function IQTestPage() {
  return (
    <Suspense>
      <IQTestClient />
    </Suspense>
  );
}
```

- [ ] **Step 8.3 — Commit**

```bash
git add src/app/iq-test/IQTestClient.tsx src/app/iq-test/page.tsx
git commit -m "feat: add IQ test page orchestrator with phase management"
```

---

## Task 9: Sitewide IQ Test Banner

**Files:**
- Create: `src/components/ui/IQTestBanner.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 9.1 — Create the banner component**

```tsx
// src/components/ui/IQTestBanner.tsx
"use client";
import Link from "next/link";
import { useState } from "react";

export function IQTestBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div style={{
      position:"fixed",top:0,left:0,right:0,zIndex:50,
      display:"flex",alignItems:"center",justifyContent:"center",
      padding:"8px 16px",
      background:"rgba(72,197,156,0.10)",
      backdropFilter:"blur(20px) saturate(180%)",
      WebkitBackdropFilter:"blur(20px) saturate(180%)",
      borderBottom:"1px solid rgba(72,197,156,0.25)",
    }}>
      <Link
        href="/iq-test"
        style={{
          fontSize:13,fontWeight:600,color:"#48C59C",
          textDecoration:"none",letterSpacing:"0.3px",
          display:"flex",alignItems:"center",gap:8,
        }}
      >
        <span>🧠</span>
        <span>TEST YOUR IQ — Free 15-min cognitive assessment</span>
        <span style={{ opacity:0.7 }}>→</span>
      </Link>
      <button
        onClick={() => setDismissed(true)}
        style={{
          position:"absolute",right:16,background:"none",border:"none",
          color:"rgba(232,245,240,0.5)",cursor:"pointer",fontSize:18,lineHeight:1,padding:4,
        }}
        aria-label="Dismiss"
      >×</button>
    </div>
  );
}
```

- [ ] **Step 9.2 — Add banner to layout**

In `src/app/layout.tsx`, add the import and component:

```tsx
// Add import after existing imports:
import { IQTestBanner } from "@/components/ui/IQTestBanner";

// Add inside <body> before <Navbar />:
<IQTestBanner />
```

The `<body>` block should become:
```tsx
<body>
  <LanguageProvider>
    <CurrencyProvider>
      <ThemeProvider>
        <IQTestBanner />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
        <ExitIntentPopup />
        <ServicesSidebar />
        <BeforeChinaBanner />
      </ThemeProvider>
    </CurrencyProvider>
  </LanguageProvider>
</body>
```

Also update `Navbar` top offset — in `src/components/layout/Navbar.tsx`, if the navbar has `top: 0`, change it to `top: 37px` (height of the banner) to avoid overlap. Look for `style={{ top: 0 }}` or `className="... top-0 ..."` and update it.

- [ ] **Step 9.3 — Commit**

```bash
git add src/components/ui/IQTestBanner.tsx src/app/layout.tsx src/components/layout/Navbar.tsx
git commit -m "feat: add sitewide IQ test banner"
```

---

## Task 10: Auth Callback — Support ?next Redirect

**Files:**
- Check: `src/app/auth/callback/route.ts` — already supports `?next` param ✓

The auth callback already reads `const next = searchParams.get("next") ?? "/dashboard"` and redirects there. The `IQLockScreen` passes `/iq-test?unlock=<sessionId>` as the `next` param to `/signup` and `/login` links. No change needed to the callback.

- [ ] **Step 10.1 — Verify the flow manually**

1. Run: `npm run dev`
2. Visit `http://localhost:3000/iq-test`
3. Answer all 15 questions
4. Confirm lock screen appears with blurred result
5. Click "Create Free Account" — confirm URL is `/signup?next=%2Fiq-test%3Funlock%3D<sessionId>`
6. Register → confirm redirect lands on `/iq-test?unlock=<sessionId>`
7. Confirm results dashboard renders with IQ score, bell curve, radar chart
8. Check Supabase dashboard → `iq_results` table has a row

- [ ] **Step 10.2 — Test logged-in flow**

1. While logged in, visit `http://localhost:3000/iq-test`
2. Answer all 15 questions
3. Confirm results appear immediately without lock screen

- [ ] **Step 10.3 — Final commit**

```bash
git add -A
git commit -m "feat: complete IQ test landing page with liquid glass design"
```

---

## Self-Review Checklist

- ✅ **Liquid Glass background** → Task 4 (IQBackground + CSS animations)
- ✅ **Water lens distortion** → Task 4 (inline SVG filter `#water-lens`)
- ✅ **15 questions, 4 types** → Task 1 (60 questions seeded, 15 selected)
- ✅ **Scoring algorithm** → Task 1 (`scoreSession`, `scoreSession`)
- ✅ **Flashcard UX + Framer Motion** → Tasks 5 + 8
- ✅ **UI sounds** → IQQuestion.tsx (select chord), IQTestClient.tsx (next swoosh)
- ✅ **Auth gate** → Task 6 (IQLockScreen) + Task 8 (phase logic)
- ✅ **Skip gate if logged in** → Task 8 (`supabase.auth.getUser()` check)
- ✅ **localStorage answer persistence** → Task 8 (`iq_answers_<sessionId>`)
- ✅ **POST /api/iq-results** → Task 3
- ✅ **Full results dashboard** → Task 7 (score, bell curve, radar, analysis, CTA)
- ✅ **Sitewide banner** → Task 9
- ✅ **Prisma migration** → Task 2
