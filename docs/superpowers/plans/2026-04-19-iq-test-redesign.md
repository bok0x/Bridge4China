# IQ Test Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing 15-question IQ test with a 300-question (10 versions × 30), high-pressure, green/black glassmorphism quiz featuring matrix, rotation, symbol, sequence, and math questions — with a lead gate before results saved to Prisma DB.

**Architecture:** Full replacement of `iqTestData.ts`, `IQTestClient.tsx`, and `IQQuestion.tsx`. New `IQTimer.tsx` component and `/api/iq-leads` route. `IQLeadGate.tsx` updated to call new API and pass `versionNumber` + `totalTimeMs`. All other files (`IQTestShell`, `IQBackground`, `page.tsx`) kept unchanged.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Framer Motion, Tailwind CSS, Prisma (PostgreSQL), existing green/black glassmorphism design system (`#48C59C` accent, `#020705` bg).

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Rewrite | `src/app/iq-test/iqTestData.ts` | Types, 300-question bank, version selector, scoring |
| Rewrite | `src/app/iq-test/IQTestClient.tsx` | 30-question flow, decreasing timer, phase management |
| Rewrite | `src/app/iq-test/IQQuestion.tsx` | Renders matrix/rotation/symbol/sequence/mirror/math |
| Update | `src/app/iq-test/IQLeadGate.tsx` | Accept versionNumber+totalTimeMs props, call /api/iq-leads |
| Update | `src/app/iq-test/IQResults.tsx` | Use new IQScores type (remove fri/qri/vci/vsi/wmi) |
| New | `src/app/iq-test/IQTimer.tsx` | Countdown timer, green→red at ≤5s, onExpire callback |
| New | `src/app/api/iq-leads/route.ts` | Save IqTestResult to Prisma, send email notification |
| Migrate | `prisma/schema.prisma` | Add IqTestResult model |

---

## Task 1: Prisma — Add IqTestResult Model

**Files:**
- Modify: `prisma/schema.prisma`
- Run: `npx prisma migrate dev`

- [ ] **Step 1: Add model to schema**

Append to `prisma/schema.prisma` (after the `QuizOtp` model):

```prisma
model IqTestResult {
  id            String   @id @default(cuid())
  fullName      String
  email         String
  whatsapp      String
  iqScore       Int
  percentile    Int
  versionNumber Int
  totalTimeMs   Int
  createdAt     DateTime @default(now())

  @@index([email])
  @@index([createdAt])
}
```

- [ ] **Step 2: Run migration**

```bash
cd "f:/Claude Project/ChinaUniMatch"
npx prisma migrate dev --name add_iq_test_result
```

Expected output: `Your database is now in sync with your schema.`

- [ ] **Step 3: Verify generated client**

```bash
npx prisma studio
```

Confirm `IqTestResult` table appears. Close Prisma Studio.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add IqTestResult prisma model"
```

---

## Task 2: API Route — /api/iq-leads

**Files:**
- Create: `src/app/api/iq-leads/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// src/app/api/iq-leads/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, whatsapp, iqScore, percentile, versionNumber, totalTimeMs } = body;

    if (!fullName || !email || !whatsapp || iqScore == null || versionNumber == null) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, email, whatsapp, iqScore, versionNumber" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const result = await prisma.iqTestResult.create({
      data: {
        fullName,
        email,
        whatsapp,
        iqScore,
        percentile: percentile ?? 50,
        versionNumber,
        totalTimeMs: totalTimeMs ?? 0,
      },
    });

    getResend().emails.send({
      from: "Bridge4China <onboarding@resend.dev>",
      to: "Antoineformula@gmail.com",
      subject: `New IQ Test Lead — ${fullName} (IQ ${iqScore})`,
      html: `<h2>New IQ Test Lead</h2>
        <p><b>Name:</b> ${fullName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>WhatsApp:</b> ${whatsapp}</p>
        <p><b>IQ Score:</b> ${iqScore} (${percentile}th percentile)</p>
        <p><b>Version:</b> ${versionNumber}</p>
        <p><b>Total Time:</b> ${Math.round(totalTimeMs / 1000)}s</p>`,
    }).catch(console.error);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[iq-leads POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/iq-leads/route.ts
git commit -m "feat: add /api/iq-leads route for IQ test results"
```

---

## Task 3: IQTimer Component

**Files:**
- Create: `src/app/iq-test/IQTimer.tsx`

- [ ] **Step 1: Create component**

```typescript
// src/app/iq-test/IQTimer.tsx
"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  seconds: number;
  onExpire: () => void;
}

export function IQTimer({ seconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const urgent = remaining <= 5;
  const pct = remaining / seconds;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Arc progress indicator */}
      <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="3"
        />
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          stroke={urgent ? "#f87171" : "#48C59C"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 15}`}
          strokeDashoffset={`${2 * Math.PI * 15 * (1 - pct)}`}
          transform="rotate(-90 18 18)"
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
        />
      </svg>

      {/* Badge */}
      <div style={{
        background: urgent ? "rgba(239,68,68,0.12)" : "rgba(72,197,156,0.12)",
        border: `1px solid ${urgent ? "rgba(239,68,68,0.4)" : "rgba(72,197,156,0.35)"}`,
        color: urgent ? "#f87171" : "#48C59C",
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 15,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: urgent ? "iqTimerPulse 0.7s ease-in-out infinite" : undefined,
        minWidth: 52,
        textAlign: "center",
      }}>
        {remaining}s
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add pulse keyframe to globals.css**

Open `src/app/globals.css`. Find the `@keyframes iqShimmer` block and add after it:

```css
@keyframes iqTimerPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  50%       { box-shadow: 0 0 14px 3px rgba(239, 68, 68, 0.35); }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/iq-test/IQTimer.tsx src/app/globals.css
git commit -m "feat: add IQTimer component with arc progress and urgent pulse"
```

---

## Task 4: iqTestData.ts — Types, Scoring, Version Selector

**Files:**
- Rewrite: `src/app/iq-test/iqTestData.ts` (types + scoring only — question data added in Tasks 5–6)

- [ ] **Step 1: Write types, scoring, and version selector**

Replace entire file content:

```typescript
// src/app/iq-test/iqTestData.ts

// ── Question Types ─────────────────────────────────────────────────────────

export type QuestionType =
  | "matrix"        // 3×3 grid, find missing cell (SVG symbols)
  | "rotation"      // identify correct rotation of a shape (SVG)
  | "symbol_grid"   // pattern in a symbol grid (SVG)
  | "sequence"      // what comes next in a visual sequence (SVG)
  | "mirror"        // mirror reflection (SVG)
  | "number_series" // number pattern (text)
  | "word_problem"  // tricky word problem (text)
  | "visual_math";  // shapes with values, find missing (SVG)

export type Difficulty = 1 | 2 | 3;

// SVG data for matrix questions
export interface MatrixData {
  // 9 cells; index 8 is always the "?" cell.
  // Each string is a symbol code from SYMBOL_SET.
  cells: string[];
  // 6 option symbol codes (answer choices for the ? cell)
  options: string[];
}

// SVG data for rotation questions
export interface RotationData {
  shape: "L" | "T" | "F" | "Z" | "arrow" | "S" | "J" | "Y" | "E";
  // Degrees of base shape (shown to user)
  baseDegrees: number;
  // 6 option rotations in degrees (option at correctIndex is the right one)
  optionDegrees: number[];
}

// SVG data for symbol grid questions (4×4 or 5×5 grid)
export interface SymbolGridData {
  size: 3 | 4;
  // size*size cells; last cell is "?" (null)
  cells: Array<string | null>;
  options: string[];
}

// SVG data for sequence questions
export interface SequenceData {
  // 4 items shown + 1 "?" slot
  items: Array<{
    shape: "circle" | "square" | "triangle" | "diamond" | "star" | "pentagon";
    fill: "full" | "empty" | "half" | "dashed";
    size: number; // 1 = small, 2 = medium, 3 = large
  } | null>; // null = "?" slot
  options: Array<{
    shape: "circle" | "square" | "triangle" | "diamond" | "star" | "pentagon";
    fill: "full" | "empty" | "half" | "dashed";
    size: number;
  }>;
}

// SVG data for mirror questions
export interface MirrorData {
  // Base shape described as SVG path commands (relative to 80×80 viewBox)
  basePath: string;
  axis: "vertical" | "horizontal";
  // 6 option paths
  optionPaths: string[];
}

// SVG data for visual math questions
export interface VisualMathData {
  // e.g. [["circle","circle","=","12"], ["square","circle","=","8"], ["square","?","=","?"]]
  // Each row is an equation with shape names or numbers or "?"
  rows: Array<Array<string>>;
}

export interface IQQuestionData {
  id: string;
  version: number;           // 1–10
  position: number;          // 1–30 within version
  type: QuestionType;
  category: "visual" | "math";
  difficulty: Difficulty;
  prompt: string;
  // For math/word questions, text options (e.g. "42"). For visual, options encoded in svgData.
  textOptions?: string[];
  correctIndex: number;      // 0-based index into options array
  // SVG data — only one of these is set depending on `type`
  matrixData?: MatrixData;
  rotationData?: RotationData;
  symbolGridData?: SymbolGridData;
  sequenceData?: SequenceData;
  mirrorData?: MirrorData;
  visualMathData?: VisualMathData;
}

// Symbol set used in matrix and symbol_grid questions
// These render as styled SVG shapes in IQQuestion
export const SYMBOL_SET = [
  "circle_slash",  // ⊘
  "square_inner",  // ⊡
  "triangle_line", // ⊿
  "triangle_empty",// △
  "circle_cross",  // ⊕
  "rect_line",     // ⊟
  "circle_empty",  // ○
  "square_cross",  // ⊞
  "triangle_right",// ▷
  "diamond_empty", // ◇
  "diamond_full",  // ◆
  "circle_full",   // ●
  "square_full",   // ■
  "triangle_full", // ▲
] as const;

export type SymbolCode = typeof SYMBOL_SET[number];

// ── Scoring ────────────────────────────────────────────────────────────────

export interface IQScores {
  iq: number;        // 60–145
  percentile: number; // 0–100
}

const DIFFICULTY_WEIGHT: Record<Difficulty, number> = { 1: 1, 2: 1.5, 3: 2 };

// Normal CDF approximation
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const cdf = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
  return z >= 0 ? cdf : 1 - cdf;
}

export function scoreSession(
  questions: IQQuestionData[],
  answers: SessionAnswer[]
): IQScores {
  let earned = 0;
  let maxPossible = 0;

  for (const q of questions) {
    const w = DIFFICULTY_WEIGHT[q.difficulty];
    maxPossible += w;
    const ans = answers.find(a => a.questionId === q.id);
    if (ans && ans.selectedIndex === q.correctIndex) {
      earned += w;
    }
  }

  const ratio = maxPossible > 0 ? earned / maxPossible : 0;
  // Normalize to IQ scale: mean 100, sd 15
  // ratio 0.5 → IQ 100. Each 0.1 above/below ≈ 8 IQ points
  const z = (ratio - 0.5) / 0.167;
  const iq = Math.round(Math.min(145, Math.max(60, 100 + z * 15)));
  const percentile = Math.round(normalCDF(z) * 100);

  return { iq, percentile };
}

export interface SessionAnswer {
  questionId: string;
  selectedIndex: number;
  timeMs: number;
}

// ── IQ Label ───────────────────────────────────────────────────────────────

export function iqLabel(iq: number): { label: string; analysis: string } {
  if (iq >= 130) return { label: "Very Superior", analysis: "You are in the top 2% of the population. Exceptional abstract reasoning and pattern recognition." };
  if (iq >= 120) return { label: "Superior", analysis: "You are in the top 10%. Strong analytical thinking and cognitive flexibility." };
  if (iq >= 110) return { label: "High Average", analysis: "Above average cognitive performance. You handle complex patterns with ease." };
  if (iq >= 90)  return { label: "Average", analysis: "Solid cognitive performance across all measured dimensions." };
  if (iq >= 80)  return { label: "Low Average", analysis: "Performance slightly below the statistical mean. With practice, scores improve significantly." };
  return { label: "Below Average", analysis: "Keep challenging yourself — IQ scores respond to deliberate practice." };
}

// ── Timer Schedule ─────────────────────────────────────────────────────────

export function getTimerSeconds(position: number): number {
  // position is 1-based (1–30)
  if (position <= 5)  return 30;
  if (position <= 10) return 26;
  if (position <= 15) return 22;
  if (position <= 20) return 18;
  if (position <= 25) return 14;
  return 10;
}

// ── Version Selector ──────────────────────────────────────────────────────

export function pickVersion(): number {
  return Math.floor(Math.random() * 10) + 1; // 1–10
}

export function getVersionQuestions(
  bank: IQQuestionData[],
  version: number
): IQQuestionData[] {
  return bank
    .filter(q => q.version === version)
    .sort((a, b) => a.position - b.position);
}

// Question bank — populated in iqQuestionBank.ts (imported below)
export { QUESTION_BANK } from "./iqQuestionBank";
```

- [ ] **Step 2: Create empty question bank stub** (will be filled in Tasks 5–6)

Create `src/app/iq-test/iqQuestionBank.ts`:

```typescript
// src/app/iq-test/iqQuestionBank.ts
import { IQQuestionData } from "./iqTestData";

// Full 300-question bank — added in Tasks 5 and 6
export const QUESTION_BANK: IQQuestionData[] = [];
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/iq-test/iqTestData.ts src/app/iq-test/iqQuestionBank.ts
git commit -m "feat: rewrite iqTestData types, scoring, timer schedule, version selector"
```

---

## Task 5: IQQuestion.tsx — New Renderer

**Files:**
- Rewrite: `src/app/iq-test/IQQuestion.tsx`

- [ ] **Step 1: Write the symbol renderer helper**

The SVG symbols map symbol codes to inline SVG shapes. Replace entire `IQQuestion.tsx`:

```typescript
// src/app/iq-test/IQQuestion.tsx
"use client";
import { IQQuestionData, SymbolCode } from "./iqTestData";

// ── Symbol SVG renderer ───────────────────────────────────────────────────

function SymbolSVG({ code, size = 32 }: { code: string; size?: number }) {
  const s = size;
  const c = s / 2;
  const r = s * 0.38;
  const color = "#E8F5F0";
  const stroke = color;
  const sw = s * 0.055;

  const shapes: Record<string, React.ReactNode> = {
    circle_slash: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={c - r * 0.7} y1={c + r * 0.7} x2={c + r * 0.7} y2={c - r * 0.7} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    square_inner: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <rect x={c - r} y={c - r} width={r * 2} height={r * 2} fill="none" stroke={stroke} strokeWidth={sw} />
        <rect x={c - r * 0.5} y={c - r * 0.5} width={r} height={r} fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    triangle_line: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c},${c - r} ${c + r},${c + r} ${c - r},${c + r}`} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={c} y1={c - r} x2={c + r} y2={c + r} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    triangle_empty: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c},${c - r} ${c + r},${c + r} ${c - r},${c + r}`} fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    circle_cross: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={c} y1={c - r} x2={c} y2={c + r} stroke={stroke} strokeWidth={sw} />
        <line x1={c - r} y1={c} x2={c + r} y2={c} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    rect_line: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <rect x={c - r} y={c - r * 0.65} width={r * 2} height={r * 1.3} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={c - r} y1={c} x2={c + r} y2={c} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    circle_empty: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    square_cross: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <rect x={c - r} y={c - r} width={r * 2} height={r * 2} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={c - r} y1={c - r} x2={c + r} y2={c + r} stroke={stroke} strokeWidth={sw} />
        <line x1={c + r} y1={c - r} x2={c - r} y2={c + r} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    triangle_right: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c - r * 0.7},${c - r} ${c + r},${c} ${c - r * 0.7},${c + r}`} fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    diamond_empty: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c},${c - r} ${c + r},${c} ${c},${c + r} ${c - r},${c}`} fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    diamond_full: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c},${c - r} ${c + r},${c} ${c},${c + r} ${c - r},${c}`} fill={color} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    circle_full: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <circle cx={c} cy={c} r={r} fill={color} />
      </svg>
    ),
    square_full: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <rect x={c - r} y={c - r} width={r * 2} height={r * 2} fill={color} />
      </svg>
    ),
    triangle_full: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c},${c - r} ${c + r},${c + r} ${c - r},${c + r}`} fill={color} />
      </svg>
    ),
  };

  return (shapes[code] as React.ReactElement) ?? (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <text x={c} y={c + 5} textAnchor="middle" fill={color} fontSize={s * 0.4}>?</text>
    </svg>
  );
}

// ── Rotation shape renderer ───────────────────────────────────────────────

function RotationShape({ shape, degrees, size = 70 }: { shape: string; degrees: number; size?: number }) {
  const paths: Record<string, string> = {
    L:     "M10,10 L10,60 L35,60 L35,45 L25,45 L25,10 Z",
    T:     "M10,10 L60,10 L60,25 L42,25 L42,60 L28,60 L28,25 L10,25 Z",
    F:     "M10,10 L60,10 L60,25 L28,25 L28,38 L55,38 L55,50 L28,50 L28,65 L10,65 Z",
    Z:     "M10,10 L60,10 L60,28 L30,28 L60,48 L60,65 L10,65 L10,48 L40,48 L10,28 Z",
    arrow: "M35,5 L65,35 L48,35 L48,65 L22,65 L22,35 L5,35 Z",
    S:     "M30,10 L60,10 L60,38 L10,38 L10,60 L40,60 L40,50 L20,50 L20,40 L60,40 L60,60 L10,60 L10,35 L55,35 L55,18 L20,18 L20,28 L40,28 L40,38",
    J:     "M30,10 L50,10 L50,50 L35,50 L35,60 L10,60 L10,45 L25,45 L25,10 Z",
    Y:     "M25,10 L35,35 L10,10 L20,20 L35,45 L35,65 L45,65 L45,45 L60,20 L50,10 L35,35 Z",
    E:     "M10,10 L60,10 L60,25 L25,25 L25,33 L55,33 L55,45 L25,45 L25,53 L60,53 L60,65 L10,65 Z",
  };
  const p = paths[shape] || paths["L"];
  return (
    <svg width={size} height={size} viewBox="0 0 70 70">
      <g transform={`rotate(${degrees} 35 35)`}>
        <path d={p} fill="rgba(72,197,156,0.15)" stroke="#48C59C" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

// ── Sequence shape renderer ───────────────────────────────────────────────

function SeqShape({ shape, fill, size }: { shape: string; fill: string; size: number }) {
  const px = 16 + size * 10;
  const c = px / 2;
  const r = px * 0.38;
  const filled = fill === "full";
  const dashed = fill === "dashed";
  const fg = "#E8F5F0";
  const dashArr = dashed ? "4 3" : undefined;

  const shapeMap: Record<string, React.ReactNode> = {
    circle:   <circle cx={c} cy={c} r={r} fill={filled ? fg : "none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
    square:   <rect x={c - r} y={c - r} width={r * 2} height={r * 2} fill={filled ? fg : "none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
    triangle: <polygon points={`${c},${c - r} ${c + r},${c + r} ${c - r},${c + r}`} fill={filled ? fg : "none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
    diamond:  <polygon points={`${c},${c - r} ${c + r},${c} ${c},${c + r} ${c - r},${c}`} fill={filled ? fg : "none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
    star:     <polygon points={Array.from({length:10},(_,i)=>{const a=(i*36-90)*Math.PI/180;const rad=i%2===0?r:r*0.45;return `${c+rad*Math.cos(a)},${c+rad*Math.sin(a)}`}).join(" ")} fill={filled?fg:"none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
    pentagon: <polygon points={Array.from({length:5},(_,i)=>{const a=(i*72-90)*Math.PI/180;return `${c+r*Math.cos(a)},${c+r*Math.sin(a)}`}).join(" ")} fill={filled?fg:"none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
  };

  return (
    <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`}>
      {shapeMap[shape]}
    </svg>
  );
}

// ── Mirror renderer ───────────────────────────────────────────────────────

function MirrorShape({ path, axis, isOption = false, size = 80 }: {
  path: string; axis: "vertical" | "horizontal"; isOption?: boolean; size?: number;
}) {
  const scale = size / 80;
  const tf = axis === "vertical"
    ? `scale(-1,1) translate(-80,0)`
    : `scale(1,-1) translate(0,-80)`;

  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <g transform={`scale(${scale})`}>
        {!isOption && (
          <path d={path} fill="rgba(72,197,156,0.15)" stroke="#48C59C" strokeWidth="2" strokeLinejoin="round" />
        )}
        {isOption && (
          <path d={path} fill="rgba(72,197,156,0.15)" stroke="#48C59C" strokeWidth="2" strokeLinejoin="round" transform={tf} />
        )}
      </g>
    </svg>
  );
}

// ── Visual Math renderer ──────────────────────────────────────────────────

const MATH_SHAPES: Record<string, React.ReactNode> = {
  circle:   <circle cx="16" cy="16" r="12" fill="rgba(72,197,156,0.2)" stroke="#48C59C" strokeWidth="2" />,
  square:   <rect x="4" y="4" width="24" height="24" fill="rgba(72,197,156,0.2)" stroke="#48C59C" strokeWidth="2" />,
  triangle: <polygon points="16,4 28,28 4,28" fill="rgba(72,197,156,0.2)" stroke="#48C59C" strokeWidth="2" />,
  diamond:  <polygon points="16,2 30,16 16,30 2,16" fill="rgba(72,197,156,0.2)" stroke="#48C59C" strokeWidth="2" />,
  star:     <polygon points="16,3 19,13 29,13 21,19 24,29 16,23 8,29 11,19 3,13 13,13" fill="rgba(72,197,156,0.2)" stroke="#48C59C" strokeWidth="2" />,
};

// ── Main component ────────────────────────────────────────────────────────

interface Props {
  question: IQQuestionData;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

const TYPE_LABEL: Record<string, string> = {
  matrix:        "Matrix Reasoning",
  rotation:      "Shape Rotation",
  symbol_grid:   "Symbol Grid",
  sequence:      "Visual Sequence",
  mirror:        "Mirror Reflection",
  number_series: "Number Series",
  word_problem:  "Word Problem",
  visual_math:   "Visual Math",
};

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export function IQQuestion({ question, selectedIndex, onSelect }: Props) {
  const optionCount = question.type === "number_series" || question.type === "word_problem"
    ? (question.textOptions?.length ?? 4)
    : 6;
  const cols = optionCount === 6 ? 3 : 2;

  function playSelect() {
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
    } catch { /**/ }
  }

  function handleClick(i: number) {
    if (selectedIndex !== null) return;
    playSelect();
    onSelect(i);
  }

  // ── Question visual area ─────────────────────────────────────────────

  function renderQuestionVisual() {
    const { type, matrixData, rotationData, symbolGridData, sequenceData, mirrorData, visualMathData, prompt } = question;

    if (type === "matrix" && matrixData) {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 60px)", gap: 4, margin: "0 auto", width: "fit-content" }}>
          {matrixData.cells.map((code, i) => {
            const isMissing = i === 8;
            return (
              <div key={i} style={{
                width: 60, height: 60, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isMissing ? "rgba(72,197,156,0.05)" : "rgba(255,255,255,0.04)",
                border: isMissing ? "1.5px dashed rgba(72,197,156,0.6)" : "1px solid rgba(255,255,255,0.10)",
              }}>
                {isMissing
                  ? <span style={{ color: "#48C59C", fontWeight: 700, fontSize: 18 }}>?</span>
                  : <SymbolSVG code={code} size={34} />
                }
              </div>
            );
          })}
        </div>
      );
    }

    if (type === "rotation" && rotationData) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: "rgba(232,245,240,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Base shape</div>
          <RotationShape shape={rotationData.shape} degrees={rotationData.baseDegrees} size={80} />
        </div>
      );
    }

    if (type === "symbol_grid" && symbolGridData) {
      const { size, cells } = symbolGridData;
      return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 52px)`, gap: 4, margin: "0 auto", width: "fit-content" }}>
          {cells.map((code, i) => (
            <div key={i} style={{
              width: 52, height: 52, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: code === null ? "rgba(72,197,156,0.05)" : "rgba(255,255,255,0.04)",
              border: code === null ? "1.5px dashed rgba(72,197,156,0.6)" : "1px solid rgba(255,255,255,0.10)",
            }}>
              {code === null
                ? <span style={{ color: "#48C59C", fontWeight: 700, fontSize: 16 }}>?</span>
                : <SymbolSVG code={code} size={30} />
              }
            </div>
          ))}
        </div>
      );
    }

    if (type === "sequence" && sequenceData) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {sequenceData.items.map((item, i) => (
            <div key={i} style={{
              width: 54, height: 54, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: item === null ? "rgba(72,197,156,0.05)" : "rgba(255,255,255,0.04)",
              border: item === null ? "1.5px dashed rgba(72,197,156,0.6)" : "1px solid rgba(255,255,255,0.10)",
            }}>
              {item === null
                ? <span style={{ color: "#48C59C", fontWeight: 700, fontSize: 18 }}>?</span>
                : <SeqShape shape={item.shape} fill={item.fill} size={item.size} />
              }
            </div>
          ))}
        </div>
      );
    }

    if (type === "mirror" && mirrorData) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: "rgba(232,245,240,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>
            Find the {mirrorData.axis} mirror
          </div>
          <MirrorShape path={mirrorData.basePath} axis={mirrorData.axis} isOption={false} size={90} />
        </div>
      );
    }

    if (type === "visual_math" && visualMathData) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          {visualMathData.rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {row.map((token, ti) => {
                if (token === "=" || token === "+" || token === "-" || token === "×") {
                  return <span key={ti} style={{ color: "rgba(232,245,240,0.5)", fontSize: 18, fontWeight: 600 }}>{token}</span>;
                }
                if (MATH_SHAPES[token]) {
                  return (
                    <svg key={ti} width="32" height="32" viewBox="0 0 32 32">
                      {MATH_SHAPES[token]}
                    </svg>
                  );
                }
                return (
                  <span key={ti} style={{
                    color: token === "?" ? "#48C59C" : "#E8F5F0",
                    fontSize: token === "?" ? 22 : 16,
                    fontWeight: 700, minWidth: 28, textAlign: "center",
                  }}>{token}</span>
                );
              })}
            </div>
          ))}
        </div>
      );
    }

    // text-only (number_series, word_problem) — no extra visual, prompt shown below
    return null;
  }

  // ── Option renderer ───────────────────────────────────────────────────

  function renderOption(i: number) {
    const { type, textOptions, matrixData, rotationData, symbolGridData, sequenceData, mirrorData } = question;
    const isSelected = selectedIndex === i;

    let content: React.ReactNode;

    if ((type === "number_series" || type === "word_problem") && textOptions) {
      content = <span style={{ fontSize: 14, color: "#E8F5F0", fontWeight: 500 }}>{textOptions[i]}</span>;
    } else if (type === "matrix" && matrixData) {
      content = <SymbolSVG code={matrixData.options[i]} size={28} />;
    } else if (type === "rotation" && rotationData) {
      content = <RotationShape shape={rotationData.shape} degrees={rotationData.optionDegrees[i]} size={44} />;
    } else if (type === "symbol_grid" && symbolGridData) {
      content = <SymbolSVG code={symbolGridData.options[i]} size={28} />;
    } else if (type === "sequence" && sequenceData && sequenceData.options[i]) {
      const opt = sequenceData.options[i];
      content = <SeqShape shape={opt.shape} fill={opt.fill} size={opt.size} />;
    } else if (type === "mirror" && mirrorData) {
      content = <MirrorShape path={mirrorData.optionPaths[i]} axis={mirrorData.axis} isOption={true} size={44} />;
    } else if (type === "visual_math" && textOptions) {
      content = <span style={{ fontSize: 14, color: "#E8F5F0", fontWeight: 500 }}>{textOptions[i]}</span>;
    } else {
      content = <span style={{ fontSize: 13, color: "#E8F5F0" }}>?</span>;
    }

    return (
      <button
        key={i}
        onClick={() => handleClick(i)}
        style={{
          background: isSelected ? "rgba(72,197,156,0.19)" : "rgba(255,255,255,0.06)",
          border: isSelected ? "1px solid #48C59C" : "1px solid rgba(255,255,255,0.16)",
          borderTop: isSelected ? "1px solid rgba(93,212,174,0.75)" : "1px solid rgba(255,255,255,0.28)",
          borderRadius: 14, padding: "10px 8px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8,
          backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
          boxShadow: isSelected
            ? "inset 0 1.5px 0 rgba(255,255,255,.30),0 6px 20px rgba(72,197,156,.28)"
            : "inset 0 1.5px 0 rgba(255,255,255,.22),inset 0 -1px 0 rgba(0,0,0,.18)",
          transform: isSelected ? "translateY(-2px) scale(1.02)" : undefined,
          transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          width: "100%",
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: 7, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700,
          background: isSelected ? "#48C59C" : "rgba(255,255,255,0.08)",
          border: isSelected ? "1px solid #48C59C" : "1px solid rgba(255,255,255,0.15)",
          color: isSelected ? "#030806" : "rgba(232,245,240,0.58)",
        }}>
          {OPTION_LABELS[i]}
        </div>
        {content}
      </button>
    );
  }

  return (
    <div>
      {/* Type label */}
      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(232,245,240,0.38)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
        {TYPE_LABEL[question.type] ?? question.type}
      </div>

      {/* Prompt text */}
      <div style={{ fontSize: 16, fontWeight: 700, color: "#E8F5F0", lineHeight: 1.45, marginBottom: 16, letterSpacing: "-0.2px" }}>
        {question.prompt}
      </div>

      {/* Visual area */}
      {renderQuestionVisual() && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTop: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 14, padding: 16, marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120,
        }}>
          {renderQuestionVisual()}
        </div>
      )}

      {/* Options grid */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
        {Array.from({ length: optionCount }, (_, i) => renderOption(i))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Fix any type errors before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/app/iq-test/IQQuestion.tsx
git commit -m "feat: rewrite IQQuestion renderer for all visual and math types"
```

---

## Task 6: Question Bank — Versions 1–5

**Files:**
- Modify: `src/app/iq-test/iqQuestionBank.ts`

This task populates 150 questions (versions 1–5). Each version has:
- Positions 1–4: `matrix` questions
- Positions 5–8: `rotation` questions
- Positions 9–12: `symbol_grid` questions
- Positions 13–16: `sequence` questions
- Positions 17–20: `mirror` questions
- Positions 21–24: `number_series` questions
- Positions 25–27: `word_problem` questions
- Positions 28–30: `visual_math` questions

- [ ] **Step 1: Write versions 1–5 in iqQuestionBank.ts**

Replace the stub file with the full content below. Each question follows the types defined in Task 4.

```typescript
// src/app/iq-test/iqQuestionBank.ts
import { IQQuestionData } from "./iqTestData";

export const QUESTION_BANK: IQQuestionData[] = [

  // ═══════════════════════════════════════════════════════════════
  // VERSION 1
  // ═══════════════════════════════════════════════════════════════

  // --- Matrix (v1, positions 1-4) ---
  {
    id: "v1_q01", version: 1, position: 1, type: "matrix", category: "visual", difficulty: 1,
    prompt: "Which symbol completes the pattern?",
    correctIndex: 2,
    matrixData: {
      cells: ["circle_slash","square_inner","triangle_empty","square_inner","triangle_empty","circle_slash","triangle_empty","circle_slash","?"],
      options: ["square_full","triangle_full","square_inner","circle_full","rect_line","diamond_empty"],
    },
  },
  {
    id: "v1_q02", version: 1, position: 2, type: "matrix", category: "visual", difficulty: 2,
    prompt: "Which symbol completes the pattern?",
    correctIndex: 0,
    matrixData: {
      cells: ["circle_cross","rect_line","diamond_empty","rect_line","diamond_empty","circle_cross","diamond_empty","circle_cross","?"],
      options: ["rect_line","circle_cross","diamond_empty","square_inner","triangle_empty","circle_slash"],
    },
  },
  {
    id: "v1_q03", version: 1, position: 3, type: "matrix", category: "visual", difficulty: 2,
    prompt: "Which symbol completes the pattern?",
    correctIndex: 4,
    matrixData: {
      cells: ["circle_full","triangle_full","square_full","triangle_full","square_full","circle_full","square_full","circle_full","?"],
      options: ["square_full","circle_full","diamond_full","rect_line","triangle_full","circle_slash"],
    },
  },
  {
    id: "v1_q04", version: 1, position: 4, type: "matrix", category: "visual", difficulty: 3,
    prompt: "Which symbol completes the pattern?",
    correctIndex: 3,
    matrixData: {
      cells: ["triangle_right","circle_empty","square_cross","circle_empty","square_cross","triangle_right","square_cross","triangle_right","?"],
      options: ["triangle_right","square_cross","circle_cross","circle_empty","diamond_empty","rect_line"],
    },
  },

  // --- Rotation (v1, positions 5-8) ---
  {
    id: "v1_q05", version: 1, position: 5, type: "rotation", category: "visual", difficulty: 1,
    prompt: "Which option shows the shape rotated 90° clockwise?",
    correctIndex: 1,
    rotationData: {
      shape: "L", baseDegrees: 0,
      optionDegrees: [180, 90, 270, 45, 0, 135],
    },
  },
  {
    id: "v1_q06", version: 1, position: 6, type: "rotation", category: "visual", difficulty: 2,
    prompt: "Which option shows the shape rotated 180°?",
    correctIndex: 3,
    rotationData: {
      shape: "T", baseDegrees: 0,
      optionDegrees: [90, 270, 45, 180, 135, 315],
    },
  },
  {
    id: "v1_q07", version: 1, position: 7, type: "rotation", category: "visual", difficulty: 2,
    prompt: "Which option shows the shape rotated 270° clockwise?",
    correctIndex: 0,
    rotationData: {
      shape: "F", baseDegrees: 0,
      optionDegrees: [270, 90, 180, 45, 315, 135],
    },
  },
  {
    id: "v1_q08", version: 1, position: 8, type: "rotation", category: "visual", difficulty: 3,
    prompt: "Which option is NOT a rotation of the base shape (it is a reflection)?",
    correctIndex: 4,
    rotationData: {
      shape: "Z", baseDegrees: 0,
      optionDegrees: [90, 180, 270, 45, -1, 315], // -1 = reflection (wrong)
    },
  },

  // --- Symbol Grid (v1, positions 9-12) ---
  {
    id: "v1_q09", version: 1, position: 9, type: "symbol_grid", category: "visual", difficulty: 1,
    prompt: "Each row uses each symbol exactly once. What fills the blank?",
    correctIndex: 2,
    symbolGridData: {
      size: 3,
      cells: ["circle_slash","square_inner",null,"square_inner","triangle_empty","circle_slash","triangle_empty","circle_slash","square_inner"],
      options: ["square_inner","circle_slash","triangle_empty","circle_cross","rect_line","diamond_empty"],
    },
  },
  {
    id: "v1_q10", version: 1, position: 10, type: "symbol_grid", category: "visual", difficulty: 2,
    prompt: "Each column uses each symbol exactly once. What fills the blank?",
    correctIndex: 5,
    symbolGridData: {
      size: 3,
      cells: ["circle_cross","rect_line","diamond_empty","diamond_empty","circle_cross","rect_line","rect_line",null,"circle_cross"],
      options: ["circle_cross","diamond_empty","rect_line","triangle_empty","circle_slash","diamond_empty"],
    },
  },
  {
    id: "v1_q11", version: 1, position: 11, type: "symbol_grid", category: "visual", difficulty: 2,
    prompt: "Diagonal patterns repeat. Which symbol completes the grid?",
    correctIndex: 1,
    symbolGridData: {
      size: 3,
      cells: ["triangle_full","circle_full","square_full","circle_full","square_full","triangle_full","square_full","triangle_full",null],
      options: ["square_full","circle_full","triangle_full","diamond_full","rect_line","circle_slash"],
    },
  },
  {
    id: "v1_q12", version: 1, position: 12, type: "symbol_grid", category: "visual", difficulty: 3,
    prompt: "Each symbol appears once per row AND per column (like Sudoku). What is missing?",
    correctIndex: 3,
    symbolGridData: {
      size: 3,
      cells: ["circle_empty","square_cross","triangle_right","triangle_right","circle_empty","square_cross","square_cross",null,"circle_empty"],
      options: ["circle_empty","square_cross","circle_slash","triangle_right","rect_line","diamond_empty"],
    },
  },

  // --- Sequence (v1, positions 13-16) ---
  {
    id: "v1_q13", version: 1, position: 13, type: "sequence", category: "visual", difficulty: 1,
    prompt: "The shapes grow larger each step. What comes next?",
    correctIndex: 2,
    sequenceData: {
      items: [
        { shape: "circle", fill: "empty", size: 1 },
        { shape: "circle", fill: "empty", size: 2 },
        { shape: "circle", fill: "empty", size: 3 },
        { shape: "circle", fill: "full", size: 1 },
        null,
      ],
      options: [
        { shape: "circle", fill: "empty", size: 1 },
        { shape: "square", fill: "full", size: 2 },
        { shape: "circle", fill: "full", size: 2 },
        { shape: "triangle", fill: "full", size: 1 },
        { shape: "circle", fill: "dashed", size: 2 },
        { shape: "diamond", fill: "full", size: 2 },
      ],
    },
  },
  {
    id: "v1_q14", version: 1, position: 14, type: "sequence", category: "visual", difficulty: 2,
    prompt: "The pattern alternates fill and shape. What comes next?",
    correctIndex: 0,
    sequenceData: {
      items: [
        { shape: "square", fill: "full", size: 2 },
        { shape: "triangle", fill: "empty", size: 2 },
        { shape: "square", fill: "full", size: 2 },
        { shape: "triangle", fill: "empty", size: 2 },
        null,
      ],
      options: [
        { shape: "square", fill: "full", size: 2 },
        { shape: "triangle", fill: "full", size: 2 },
        { shape: "diamond", fill: "empty", size: 2 },
        { shape: "circle", fill: "full", size: 2 },
        { shape: "square", fill: "empty", size: 2 },
        { shape: "triangle", fill: "dashed", size: 2 },
      ],
    },
  },
  {
    id: "v1_q15", version: 1, position: 15, type: "sequence", category: "visual", difficulty: 2,
    prompt: "Shape cycles: circle → triangle → diamond → circle... What comes next?",
    correctIndex: 4,
    sequenceData: {
      items: [
        { shape: "circle", fill: "full", size: 2 },
        { shape: "triangle", fill: "full", size: 2 },
        { shape: "diamond", fill: "full", size: 2 },
        { shape: "circle", fill: "full", size: 2 },
        null,
      ],
      options: [
        { shape: "circle", fill: "full", size: 2 },
        { shape: "diamond", fill: "full", size: 2 },
        { shape: "star", fill: "full", size: 2 },
        { shape: "pentagon", fill: "full", size: 2 },
        { shape: "triangle", fill: "full", size: 2 },
        { shape: "square", fill: "full", size: 2 },
      ],
    },
  },
  {
    id: "v1_q16", version: 1, position: 16, type: "sequence", category: "visual", difficulty: 3,
    prompt: "Fill alternates full/dashed AND size increases then resets. What comes next?",
    correctIndex: 5,
    sequenceData: {
      items: [
        { shape: "pentagon", fill: "full", size: 1 },
        { shape: "pentagon", fill: "dashed", size: 2 },
        { shape: "pentagon", fill: "full", size: 3 },
        { shape: "pentagon", fill: "dashed", size: 1 },
        null,
      ],
      options: [
        { shape: "pentagon", fill: "dashed", size: 3 },
        { shape: "pentagon", fill: "full", size: 1 },
        { shape: "star", fill: "full", size: 2 },
        { shape: "pentagon", fill: "dashed", size: 2 },
        { shape: "pentagon", fill: "empty", size: 2 },
        { shape: "pentagon", fill: "full", size: 2 },
      ],
    },
  },

  // --- Mirror (v1, positions 17-20) ---
  {
    id: "v1_q17", version: 1, position: 17, type: "mirror", category: "visual", difficulty: 1,
    prompt: "Which option is the vertical mirror image of the shape shown?",
    correctIndex: 0,
    mirrorData: {
      basePath: "M10,20 L40,10 L70,30 L70,60 L50,70 L10,50 Z",
      axis: "vertical",
      optionPaths: [
        "M10,20 L40,10 L70,30 L70,60 L50,70 L10,50 Z",
        "M10,60 L50,10 L70,20 L70,70 L40,70 L10,50 Z",
        "M20,10 L70,20 L60,50 L10,70 L10,30 L30,10 Z",
        "M10,10 L70,10 L70,40 L40,70 L10,70 Z",
        "M30,10 L70,10 L70,60 L50,70 L10,50 L10,30 Z",
        "M10,30 L40,10 L70,20 L60,70 L10,60 Z",
      ],
    },
  },
  {
    id: "v1_q18", version: 1, position: 18, type: "mirror", category: "visual", difficulty: 2,
    prompt: "Which option is the horizontal mirror image of the shape shown?",
    correctIndex: 3,
    mirrorData: {
      basePath: "M10,10 L60,10 L70,30 L50,40 L70,70 L10,70 Z",
      axis: "horizontal",
      optionPaths: [
        "M10,50 L60,30 L70,10 L50,20 L10,10 Z",
        "M10,10 L70,30 L60,50 L30,70 L10,40 Z",
        "M20,10 L70,10 L70,70 L20,70 L10,40 Z",
        "M10,10 L60,10 L70,30 L50,40 L70,70 L10,70 Z",
        "M10,20 L50,10 L70,40 L50,60 L10,70 Z",
        "M30,10 L70,20 L60,60 L10,70 L10,10 Z",
      ],
    },
  },
  {
    id: "v1_q19", version: 1, position: 19, type: "mirror", category: "visual", difficulty: 2,
    prompt: "Which option is the vertical mirror image?",
    correctIndex: 2,
    mirrorData: {
      basePath: "M5,5 L40,5 L40,30 L25,30 L25,50 L40,50 L40,75 L5,75 Z",
      axis: "vertical",
      optionPaths: [
        "M5,5 L40,5 L40,75 L5,75 L5,50 L20,50 L20,30 L5,30 Z",
        "M5,5 L75,5 L75,35 L40,35 L40,75 L5,75 Z",
        "M5,5 L40,5 L40,30 L25,30 L25,50 L40,50 L40,75 L5,75 Z",
        "M40,5 L75,5 L75,75 L40,75 L40,50 L55,50 L55,30 L40,30 Z",
        "M10,10 L70,10 L70,70 L40,70 L40,40 L10,40 Z",
        "M5,40 L40,40 L40,75 L5,75 L5,50 L20,50 L20,30 L5,30 Z",
      ],
    },
  },
  {
    id: "v1_q20", version: 1, position: 20, type: "mirror", category: "visual", difficulty: 3,
    prompt: "This shape has been mirrored AND rotated. Which option shows only the mirror (no rotation)?",
    correctIndex: 5,
    mirrorData: {
      basePath: "M15,5 L65,5 L65,35 L45,35 L45,55 L65,55 L65,75 L15,75 L15,55 L35,55 L35,35 L15,35 Z",
      axis: "vertical",
      optionPaths: [
        "M15,5 L65,5 L65,35 L45,35 L45,55 L65,55 L65,75 L15,75 L15,55 L35,55 L35,35 L15,35 Z",
        "M5,15 L35,15 L35,35 L55,35 L55,15 L75,15 L75,65 L55,65 L55,45 L35,45 L35,65 L5,65 Z",
        "M15,5 L65,5 L65,75 L15,75 L15,55 L35,55 L35,35 L15,35 Z",
        "M5,5 L55,5 L55,35 L35,35 L35,55 L55,55 L55,75 L5,75 Z",
        "M10,5 L70,5 L70,40 L50,40 L50,60 L70,60 L70,75 L10,75 Z",
        "M15,5 L65,5 L65,35 L45,35 L45,55 L65,55 L65,75 L15,75 L15,55 L35,55 L35,35 L15,35 Z",
      ],
    },
  },

  // --- Number Series (v1, positions 21-24) ---
  {
    id: "v1_q21", version: 1, position: 21, type: "number_series", category: "math", difficulty: 2,
    prompt: "3, 7, 13, 21, 31, ?",
    correctIndex: 2,
    textOptions: ["39", "41", "43", "45", "47", "49"],
  },
  {
    id: "v1_q22", version: 1, position: 22, type: "number_series", category: "math", difficulty: 2,
    prompt: "2, 6, 18, 54, 162, ?",
    correctIndex: 3,
    textOptions: ["324", "406", "448", "486", "512", "540"],
  },
  {
    id: "v1_q23", version: 1, position: 23, type: "number_series", category: "math", difficulty: 3,
    prompt: "1, 1, 2, 3, 5, 8, 13, ?",
    correctIndex: 1,
    textOptions: ["18", "21", "24", "27", "20", "19"],
  },
  {
    id: "v1_q24", version: 1, position: 24, type: "number_series", category: "math", difficulty: 3,
    prompt: "What is the missing number? 4, 9, 25, 49, ?, 169",
    correctIndex: 4,
    textOptions: ["81", "100", "110", "115", "121", "144"],
  },

  // --- Word Problems (v1, positions 25-27) ---
  {
    id: "v1_q25", version: 1, position: 25, type: "word_problem", category: "math", difficulty: 2,
    prompt: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
    correctIndex: 1,
    textOptions: ["$0.10", "$0.05", "$0.15", "$0.20", "$0.25", "$0.50"],
  },
  {
    id: "v1_q26", version: 1, position: 26, type: "word_problem", category: "math", difficulty: 3,
    prompt: "If 5 machines make 5 widgets in 5 minutes, how many minutes do 100 machines need to make 100 widgets?",
    correctIndex: 0,
    textOptions: ["5", "10", "20", "50", "100", "25"],
  },
  {
    id: "v1_q27", version: 1, position: 27, type: "word_problem", category: "math", difficulty: 3,
    prompt: "In a lake, a patch of lilypads doubles every day. It takes 48 days to cover half the lake. How many days to cover the whole lake?",
    correctIndex: 3,
    textOptions: ["96", "72", "60", "49", "50", "51"],
  },

  // --- Visual Math (v1, positions 28-30) ---
  {
    id: "v1_q28", version: 1, position: 28, type: "visual_math", category: "math", difficulty: 2,
    prompt: "Each shape has a value. What is the missing number?",
    correctIndex: 2,
    textOptions: ["12", "14", "16", "18", "20", "22"],
    visualMathData: {
      rows: [
        ["circle", "+", "circle", "+", "circle", "=", "12"],
        ["triangle", "+", "triangle", "+", "triangle", "=", "9"],
        ["circle", "+", "triangle", "+", "square", "=", "?"],
      ],
    },
  },
  {
    id: "v1_q29", version: 1, position: 29, type: "visual_math", category: "math", difficulty: 2,
    prompt: "Each shape has a value. What is the missing number?",
    correctIndex: 4,
    textOptions: ["6", "7", "8", "9", "10", "11"],
    visualMathData: {
      rows: [
        ["square", "+", "square", "=", "16"],
        ["diamond", "+", "diamond", "=", "6"],
        ["square", "-", "diamond", "=", "?"],
      ],
    },
  },
  {
    id: "v1_q30", version: 1, position: 30, type: "visual_math", category: "math", difficulty: 3,
    prompt: "Solve for the missing value:",
    correctIndex: 0,
    textOptions: ["5", "6", "7", "8", "9", "10"],
    visualMathData: {
      rows: [
        ["star", "+", "star", "+", "star", "=", "15"],
        ["circle", "×", "circle", "=", "16"],
        ["star", "+", "circle", "=", "?"],
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // VERSION 2
  // ═══════════════════════════════════════════════════════════════

  // --- Matrix (v2, positions 1-4) ---
  {
    id: "v2_q01", version: 2, position: 1, type: "matrix", category: "visual", difficulty: 1,
    prompt: "Which symbol completes the pattern?",
    correctIndex: 1,
    matrixData: {
      cells: ["diamond_empty","circle_full","triangle_full","circle_full","triangle_full","diamond_empty","triangle_full","diamond_empty","?"],
      options: ["triangle_full","circle_full","diamond_empty","square_full","rect_line","circle_slash"],
    },
  },
  {
    id: "v2_q02", version: 2, position: 2, type: "matrix", category: "visual", difficulty: 2,
    prompt: "Which symbol completes the pattern?",
    correctIndex: 3,
    matrixData: {
      cells: ["square_full","circle_slash","rect_line","circle_slash","rect_line","square_full","rect_line","square_full","?"],
      options: ["rect_line","square_full","circle_slash","circle_slash","triangle_empty","diamond_empty"],
    },
  },
  {
    id: "v2_q03", version: 2, position: 3, type: "matrix", category: "visual", difficulty: 2,
    prompt: "Which symbol completes the pattern?",
    correctIndex: 5,
    matrixData: {
      cells: ["triangle_right","diamond_full","circle_empty","diamond_full","circle_empty","triangle_right","circle_empty","triangle_right","?"],
      options: ["circle_empty","triangle_right","square_cross","circle_slash","rect_line","diamond_full"],
    },
  },
  {
    id: "v2_q04", version: 2, position: 4, type: "matrix", category: "visual", difficulty: 3,
    prompt: "The pattern rotates by column. Which symbol is missing?",
    correctIndex: 2,
    matrixData: {
      cells: ["circle_cross","square_inner","triangle_empty","square_inner","triangle_empty","circle_cross","triangle_empty","circle_cross","?"],
      options: ["circle_cross","triangle_empty","square_inner","rect_line","diamond_empty","circle_slash"],
    },
  },

  // --- Rotation (v2, positions 5-8) ---
  {
    id: "v2_q05", version: 2, position: 5, type: "rotation", category: "visual", difficulty: 1,
    prompt: "Which option shows the shape rotated 90° counter-clockwise?",
    correctIndex: 2,
    rotationData: {
      shape: "J", baseDegrees: 0,
      optionDegrees: [90, 180, 270, 45, 0, 315],
    },
  },
  {
    id: "v2_q06", version: 2, position: 6, type: "rotation", category: "visual", difficulty: 2,
    prompt: "Which option shows the shape rotated 180°?",
    correctIndex: 0,
    rotationData: {
      shape: "arrow", baseDegrees: 0,
      optionDegrees: [180, 90, 270, 45, 315, 135],
    },
  },
  {
    id: "v2_q07", version: 2, position: 7, type: "rotation", category: "visual", difficulty: 2,
    prompt: "Which option shows the shape rotated 90° clockwise?",
    correctIndex: 5,
    rotationData: {
      shape: "Y", baseDegrees: 0,
      optionDegrees: [180, 270, 45, 135, 315, 90],
    },
  },
  {
    id: "v2_q08", version: 2, position: 8, type: "rotation", category: "visual", difficulty: 3,
    prompt: "Which option shows the shape rotated exactly 135°?",
    correctIndex: 3,
    rotationData: {
      shape: "E", baseDegrees: 0,
      optionDegrees: [45, 90, 180, 135, 270, 315],
    },
  },

  // --- Symbol Grid (v2, positions 9-12) ---
  {
    id: "v2_q09", version: 2, position: 9, type: "symbol_grid", category: "visual", difficulty: 1,
    prompt: "Each row uses each symbol exactly once. What fills the blank?",
    correctIndex: 0,
    symbolGridData: {
      size: 3,
      cells: ["diamond_empty","circle_full","triangle_full","circle_full","triangle_full","diamond_empty","triangle_full",null,"circle_full"],
      options: ["diamond_empty","circle_full","triangle_full","square_full","rect_line","circle_slash"],
    },
  },
  {
    id: "v2_q10", version: 2, position: 10, type: "symbol_grid", category: "visual", difficulty: 2,
    prompt: "Each column uses each symbol exactly once. What fills the blank?",
    correctIndex: 4,
    symbolGridData: {
      size: 3,
      cells: ["square_full","rect_line","circle_slash","circle_slash","square_full","rect_line",null,"circle_slash","square_full"],
      options: ["square_full","circle_slash","triangle_empty","circle_cross","rect_line","diamond_empty"],
    },
  },
  {
    id: "v2_q11", version: 2, position: 11, type: "symbol_grid", category: "visual", difficulty: 2,
    prompt: "The symbols follow a diagonal rule. Which is missing?",
    correctIndex: 3,
    symbolGridData: {
      size: 3,
      cells: ["triangle_right","diamond_full","circle_empty","circle_empty","triangle_right","diamond_full","diamond_full",null,"triangle_right"],
      options: ["triangle_right","diamond_full","circle_empty","circle_empty","rect_line","circle_slash"],
    },
  },
  {
    id: "v2_q12", version: 2, position: 12, type: "symbol_grid", category: "visual", difficulty: 3,
    prompt: "Each symbol appears once per row AND per column. What is missing?",
    correctIndex: 1,
    symbolGridData: {
      size: 3,
      cells: ["circle_cross","square_inner","triangle_empty","triangle_empty","circle_cross","square_inner",null,"triangle_empty","circle_cross"],
      options: ["circle_cross","square_inner","triangle_empty","diamond_empty","rect_line","circle_slash"],
    },
  },

  // --- Sequence (v2, positions 13-16) ---
  {
    id: "v2_q13", version: 2, position: 13, type: "sequence", category: "visual", difficulty: 1,
    prompt: "Each step the shape changes to the next type. What comes next?",
    correctIndex: 3,
    sequenceData: {
      items: [
        { shape: "circle", fill: "full", size: 2 },
        { shape: "triangle", fill: "full", size: 2 },
        { shape: "square", fill: "full", size: 2 },
        { shape: "diamond", fill: "full", size: 2 },
        null,
      ],
      options: [
        { shape: "circle", fill: "full", size: 2 },
        { shape: "triangle", fill: "full", size: 2 },
        { shape: "square", fill: "full", size: 2 },
        { shape: "pentagon", fill: "full", size: 2 },
        { shape: "star", fill: "empty", size: 2 },
        { shape: "diamond", fill: "empty", size: 2 },
      ],
    },
  },
  {
    id: "v2_q14", version: 2, position: 14, type: "sequence", category: "visual", difficulty: 2,
    prompt: "Size decreases and fill alternates. What comes next?",
    correctIndex: 5,
    sequenceData: {
      items: [
        { shape: "square", fill: "full", size: 3 },
        { shape: "square", fill: "empty", size: 2 },
        { shape: "square", fill: "full", size: 1 },
        { shape: "square", fill: "empty", size: 3 },
        null,
      ],
      options: [
        { shape: "square", fill: "empty", size: 1 },
        { shape: "square", fill: "full", size: 3 },
        { shape: "square", fill: "empty", size: 3 },
        { shape: "circle", fill: "full", size: 2 },
        { shape: "square", fill: "dashed", size: 2 },
        { shape: "square", fill: "full", size: 2 },
      ],
    },
  },
  {
    id: "v2_q15", version: 2, position: 15, type: "sequence", category: "visual", difficulty: 2,
    prompt: "Two properties cycle independently. What comes next?",
    correctIndex: 1,
    sequenceData: {
      items: [
        { shape: "triangle", fill: "full", size: 1 },
        { shape: "triangle", fill: "dashed", size: 2 },
        { shape: "triangle", fill: "empty", size: 3 },
        { shape: "triangle", fill: "full", size: 1 },
        null,
      ],
      options: [
        { shape: "triangle", fill: "full", size: 1 },
        { shape: "triangle", fill: "dashed", size: 2 },
        { shape: "triangle", fill: "empty", size: 3 },
        { shape: "square", fill: "dashed", size: 2 },
        { shape: "triangle", fill: "full", size: 2 },
        { shape: "circle", fill: "dashed", size: 2 },
      ],
    },
  },
  {
    id: "v2_q16", version: 2, position: 16, type: "sequence", category: "visual", difficulty: 3,
    prompt: "Shape, size, and fill all change by a rule. What comes next?",
    correctIndex: 4,
    sequenceData: {
      items: [
        { shape: "star", fill: "full", size: 3 },
        { shape: "pentagon", fill: "empty", size: 2 },
        { shape: "diamond", fill: "full", size: 1 },
        { shape: "triangle", fill: "empty", size: 3 },
        null,
      ],
      options: [
        { shape: "diamond", fill: "full", size: 3 },
        { shape: "star", fill: "empty", size: 1 },
        { shape: "pentagon", fill: "full", size: 2 },
        { shape: "triangle", fill: "full", size: 2 },
        { shape: "circle", fill: "full", size: 2 },
        { shape: "square", fill: "empty", size: 1 },
      ],
    },
  },

  // --- Mirror (v2, positions 17-20) ---
  {
    id: "v2_q17", version: 2, position: 17, type: "mirror", category: "visual", difficulty: 1,
    prompt: "Which option is the vertical mirror image?",
    correctIndex: 3,
    mirrorData: {
      basePath: "M5,5 L50,5 L50,35 L30,35 L30,75 L5,75 Z",
      axis: "vertical",
      optionPaths: [
        "M5,5 L50,5 L50,75 L25,75 L25,35 L5,35 Z",
        "M5,5 L75,5 L75,35 L55,35 L55,75 L5,75 Z",
        "M30,5 L75,5 L75,75 L50,75 L50,35 L30,35 Z",
        "M5,5 L50,5 L50,35 L30,35 L30,75 L5,75 Z",
        "M5,35 L50,35 L50,5 L75,5 L75,75 L5,75 Z",
        "M5,5 L75,5 L75,75 L5,75 Z",
      ],
    },
  },
  {
    id: "v2_q18", version: 2, position: 18, type: "mirror", category: "visual", difficulty: 2,
    prompt: "Which option is the horizontal mirror image?",
    correctIndex: 2,
    mirrorData: {
      basePath: "M10,10 L70,10 L70,40 L45,40 L45,70 L10,70 Z",
      axis: "horizontal",
      optionPaths: [
        "M10,40 L70,40 L70,10 L45,10 L45,70 L10,70 Z",
        "M10,10 L45,10 L45,40 L70,40 L70,70 L10,70 Z",
        "M10,10 L70,10 L70,40 L45,40 L45,70 L10,70 Z",
        "M10,10 L70,10 L70,70 L45,70 L45,40 L10,40 Z",
        "M10,30 L70,30 L70,70 L10,70 Z",
        "M35,10 L70,10 L70,70 L10,70 L10,40 L35,40 Z",
      ],
    },
  },
  {
    id: "v2_q19", version: 2, position: 19, type: "mirror", category: "visual", difficulty: 2,
    prompt: "Which option is the vertical mirror image?",
    correctIndex: 0,
    mirrorData: {
      basePath: "M10,10 L30,10 L30,30 L50,30 L50,10 L70,10 L70,70 L10,70 Z",
      axis: "vertical",
      optionPaths: [
        "M10,10 L30,10 L30,30 L50,30 L50,10 L70,10 L70,70 L10,70 Z",
        "M10,70 L70,70 L70,10 L50,10 L50,30 L30,30 L30,10 L10,10 Z",
        "M10,10 L70,10 L70,70 L50,70 L50,50 L30,50 L30,70 L10,70 Z",
        "M10,10 L70,10 L70,40 L10,40 Z",
        "M20,10 L60,10 L70,40 L70,70 L10,70 L10,40 Z",
        "M10,30 L30,10 L70,10 L70,70 L10,70 Z",
      ],
    },
  },
  {
    id: "v2_q20", version: 2, position: 20, type: "mirror", category: "visual", difficulty: 3,
    prompt: "Three of these options are rotations; only one is a true vertical mirror. Which one?",
    correctIndex: 1,
    mirrorData: {
      basePath: "M10,10 L55,10 L55,35 L35,35 L35,55 L55,55 L55,70 L10,70 Z",
      axis: "vertical",
      optionPaths: [
        "M10,10 L75,10 L75,70 L30,70 L30,55 L55,55 L55,35 L10,35 Z",
        "M10,10 L55,10 L55,35 L35,35 L35,55 L55,55 L55,70 L10,70 Z",
        "M25,10 L70,10 L70,70 L25,70 L25,55 L45,55 L45,35 L25,35 Z",
        "M10,15 L55,15 L55,40 L35,40 L35,60 L55,60 L55,75 L10,75 Z",
        "M5,10 L50,10 L50,35 L30,35 L30,55 L50,55 L50,70 L5,70 Z",
        "M15,5 L60,5 L60,30 L40,30 L40,50 L60,50 L60,65 L15,65 Z",
      ],
    },
  },

  // --- Number Series (v2, positions 21-24) ---
  {
    id: "v2_q21", version: 2, position: 21, type: "number_series", category: "math", difficulty: 2,
    prompt: "5, 10, 20, 40, 80, ?",
    correctIndex: 3,
    textOptions: ["100", "120", "140", "160", "180", "200"],
  },
  {
    id: "v2_q22", version: 2, position: 22, type: "number_series", category: "math", difficulty: 2,
    prompt: "1, 4, 9, 16, 25, 36, ?",
    correctIndex: 1,
    textOptions: ["42", "49", "54", "60", "64", "81"],
  },
  {
    id: "v2_q23", version: 2, position: 23, type: "number_series", category: "math", difficulty: 3,
    prompt: "2, 3, 5, 7, 11, 13, ?",
    correctIndex: 5,
    textOptions: ["14", "15", "16", "16", "17", "17"],
  },
  {
    id: "v2_q24", version: 2, position: 24, type: "number_series", category: "math", difficulty: 3,
    prompt: "256, 64, 16, 4, ?",
    correctIndex: 0,
    textOptions: ["1", "2", "3", "0.5", "0.25", "0"],
  },

  // --- Word Problems (v2, positions 25-27) ---
  {
    id: "v2_q25", version: 2, position: 25, type: "word_problem", category: "math", difficulty: 2,
    prompt: "You have a 3-litre and a 5-litre jug. How do you measure exactly 4 litres?",
    correctIndex: 2,
    textOptions: [
      "Fill 5L, pour into 3L, discard — gives 2L",
      "Fill both — gives 8L total",
      "Fill 5L, pour into 3L, discard 3L, pour 2L into 3L, fill 5L again, pour 1L into 3L",
      "Fill 3L twice into 5L — gives 1L leftover",
      "Impossible",
      "Fill 5L, pour 4L out carefully",
    ],
  },
  {
    id: "v2_q26", version: 2, position: 26, type: "word_problem", category: "math", difficulty: 3,
    prompt: "Three friends split a $30 hotel bill, each paying $10. The hotel returns $5 to them. They each keep $1 and give $2 to the bellboy. Now each paid $9 ($27 total) + $2 bellboy = $29. Where's the missing dollar?",
    correctIndex: 4,
    textOptions: [
      "The bellboy took it",
      "It stayed at the hotel",
      "The calculation is correct",
      "One friend kept it",
      "The question itself uses wrong arithmetic — there is no missing dollar",
      "It was rounded off",
    ],
  },
  {
    id: "v2_q27", version: 2, position: 27, type: "word_problem", category: "math", difficulty: 3,
    prompt: "A snail climbs 3m up a wall each day but slides 2m down each night. The wall is 10m tall. On what day does it reach the top?",
    correctIndex: 1,
    textOptions: ["7th day", "8th day", "9th day", "10th day", "5th day", "6th day"],
  },

  // --- Visual Math (v2, positions 28-30) ---
  {
    id: "v2_q28", version: 2, position: 28, type: "visual_math", category: "math", difficulty: 2,
    prompt: "Each shape has a value. What is the missing number?",
    correctIndex: 0,
    textOptions: ["18", "20", "22", "24", "26", "28"],
    visualMathData: {
      rows: [
        ["triangle", "+", "triangle", "=", "14"],
        ["square", "+", "square", "=", "22"],
        ["triangle", "+", "square", "=", "?"],
      ],
    },
  },
  {
    id: "v2_q29", version: 2, position: 29, type: "visual_math", category: "math", difficulty: 2,
    prompt: "Each shape has a value. What is the missing number?",
    correctIndex: 3,
    textOptions: ["3", "4", "5", "6", "7", "8"],
    visualMathData: {
      rows: [
        ["pentagon", "+", "pentagon", "+", "pentagon", "=", "15"],
        ["diamond", "×", "diamond", "=", "4"],
        ["pentagon", "-", "diamond", "-", "diamond", "=", "?"],
      ],
    },
  },
  {
    id: "v2_q30", version: 2, position: 30, type: "visual_math", category: "math", difficulty: 3,
    prompt: "Solve for the missing value:",
    correctIndex: 5,
    textOptions: ["15", "16", "17", "18", "19", "20"],
    visualMathData: {
      rows: [
        ["circle", "+", "circle", "=", "8"],
        ["square", "×", "circle", "=", "24"],
        ["square", "+", "square", "+", "circle", "=", "?"],
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // VERSIONS 3–10: Follow exactly the same structure as versions 1–2.
  // For each version, create 30 entries (positions 1–30) using:
  //   - Positions 1–4:   type "matrix"        (category "visual", difficulties 1,2,2,3)
  //   - Positions 5–8:   type "rotation"      (category "visual", difficulties 1,2,2,3)
  //   - Positions 9–12:  type "symbol_grid"   (category "visual", difficulties 1,2,2,3)
  //   - Positions 13–16: type "sequence"      (category "visual", difficulties 1,2,2,3)
  //   - Positions 17–20: type "mirror"        (category "visual", difficulties 1,2,2,3)
  //   - Positions 21–24: type "number_series" (category "math",   difficulties 2,2,3,3)
  //   - Positions 25–27: type "word_problem"  (category "math",   difficulties 2,3,3)
  //   - Positions 28–30: type "visual_math"   (category "math",   difficulties 2,2,3)
  //
  // Use different symbols, patterns, rotation angles, shape sequences, paths,
  // number series rules, and word problems for each version.
  // All correctIndex values must be verified correct.
  //
  // id format: "v{version}_q{position:02d}"  e.g. "v3_q01", "v3_q15", "v10_q30"
];
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/iq-test/iqQuestionBank.ts
git commit -m "feat: add question bank versions 1-2 (60 questions)"
```

---

## Task 7: Question Bank — Versions 3–10

**Files:**
- Modify: `src/app/iq-test/iqQuestionBank.ts`

- [ ] **Step 1: Add versions 3–10 following the exact same structure as versions 1–2**

For each version (3 through 10), append 30 entries inside the `QUESTION_BANK` array. Every entry must follow the `IQQuestionData` interface exactly. Use the position/type/difficulty schedule defined in Task 6 Step 1.

Variation guidelines per version:
- **v3:** Matrix uses `square_cross`/`circle_empty`/`rect_line`; rotation shapes `S`, `E`; number series involve square numbers and alternating rules
- **v4:** Matrix uses `diamond_full`/`circle_full`/`triangle_right`; rotation shape `Y`; number series involve cubes; word problems: probability/combinatorics traps
- **v5:** Matrix with 3-symbol diagonal rotation; rotation shape `T`; visual math uses multiplied shapes in 2-variable systems
- **v6:** Symbol grid with 4×4 (size: 4 in `symbolGridData`); sequence with size+fill+shape all cycling; number series Fibonacci variants
- **v7:** Mirror questions use asymmetric polygons (8+ vertices); word problems include rate/time/distance traps; visual math 3-variable systems
- **v8:** Sequence items use `star` and `pentagon`; rotation shape `Z`; number series include factorial-like growth
- **v9:** Matrix has 4-symbol anti-diagonal rule; mirror axis alternates `vertical`/`horizontal` per question; word problems: geometric sequences disguised as stories
- **v10:** Most difficult version overall (all difficulty: 3); symbol grid uses `circle_cross`/`square_cross`/`triangle_right`/`diamond_full` in 3×3 with no column/row repeats; word problems are multi-step combinatorial

Ensure `correctIndex` is always verified. Each `textOptions` for math questions must include exactly 4 to 6 plausible-but-wrong distractors alongside the correct answer.

- [ ] **Step 2: Verify count**

```bash
node -e "const {QUESTION_BANK} = require('./src/app/iq-test/iqQuestionBank.ts'); console.log(QUESTION_BANK.length)"
```

Expected: 300. If not 300, find missing entries.

> Note: Run this check after `npx tsc` succeeds. Alternatively count manually: 10 versions × 30 questions.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/iq-test/iqQuestionBank.ts
git commit -m "feat: complete question bank — all 10 versions, 300 questions"
```

---

## Task 8: IQTestClient.tsx — New Orchestrator

**Files:**
- Rewrite: `src/app/iq-test/IQTestClient.tsx`

- [ ] **Step 1: Rewrite the full orchestrator**

```typescript
// src/app/iq-test/IQTestClient.tsx
"use client";
import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  QUESTION_BANK,
  getVersionQuestions,
  getTimerSeconds,
  scoreSession,
  pickVersion,
  IQQuestionData,
  SessionAnswer,
  IQScores,
} from "./iqTestData";
import { IQBackground } from "./IQBackground";
import { IQTestShell } from "./IQTestShell";
import { IQQuestion as IQQuestionComp } from "./IQQuestion";
import { IQTimer } from "./IQTimer";
import { IQLeadGate } from "./IQLeadGate";
import { IQResults } from "./IQResults";

type Phase = "test" | "form" | "results";

const CATEGORY_LABELS: Record<string, string> = {
  matrix:        "Matrix Reasoning",
  rotation:      "Shape Rotation",
  symbol_grid:   "Symbol Grid",
  sequence:      "Visual Sequence",
  mirror:        "Mirror Reflection",
  number_series: "Number Series",
  word_problem:  "Word Problem",
  visual_math:   "Visual Math",
};

export function IQTestClient() {
  const versionRef   = useRef<number>(pickVersion());
  const [questions]  = useState<IQQuestionData[]>(() =>
    getVersionQuestions(QUESTION_BANK, versionRef.current)
  );
  const [phase, setPhase]             = useState<Phase>("test");
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [answers, setAnswers]         = useState<SessionAnswer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scores, setScores]           = useState<IQScores | null>(null);
  const testStartMs                   = useRef<number>(Date.now());
  const questionStartMs               = useRef<number>(Date.now());
  const [timerKey, setTimerKey]       = useState(0); // remounts IQTimer on question change

  const advance = useCallback((selectedIdx: number | null) => {
    const timeMs = Date.now() - questionStartMs.current;
    const q = questions[currentIdx];

    const answer: SessionAnswer = {
      questionId: q.id,
      selectedIndex: selectedIdx ?? -1, // -1 = timed out
      timeMs,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setSelectedIndex(null);

    const isLast = currentIdx + 1 >= questions.length;

    if (isLast) {
      const computed = scoreSession(questions, newAnswers);
      setScores(computed);
      setPhase("form");
    } else {
      setTimeout(() => {
        setCurrentIdx(i => i + 1);
        questionStartMs.current = Date.now();
        setTimerKey(k => k + 1);
      }, selectedIdx !== null ? 350 : 0);
    }
  }, [answers, currentIdx, questions]);

  function playSelect() {
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
    } catch { /**/ }
  }

  const handleSelect = useCallback((index: number) => {
    if (selectedIndex !== null) return;
    playSelect();
    setSelectedIndex(index);
    setTimeout(() => advance(index), 350);
  }, [selectedIndex, advance]);

  const handleTimeout = useCallback(() => {
    advance(null);
  }, [advance]);

  const currentQ = questions[currentIdx];
  const timerSeconds = getTimerSeconds(currentIdx + 1);
  const totalTimeMs = Date.now() - testStartMs.current;

  if (phase === "form" && scores) {
    return (
      <IQLeadGate
        scores={scores}
        versionNumber={versionRef.current}
        totalTimeMs={totalTimeMs}
        onUnlocked={() => setPhase("results")}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0 40px", position: "relative" }}>
      <IQBackground />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 500, padding: "0 20px" }}>
        {phase === "test" && currentQ && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ x: 60, opacity: 0, rotateY: -8 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              exit={{ x: -60, opacity: 0, rotateY: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <IQTestShell
                current={currentIdx + 1}
                total={questions.length}
                category={CATEGORY_LABELS[currentQ.type] ?? currentQ.type}
                timerSlot={
                  <IQTimer
                    key={timerKey}
                    seconds={timerSeconds}
                    onExpire={handleTimeout}
                  />
                }
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

        {phase === "results" && scores && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <IQResults scores={scores} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update IQTestShell to accept timerSlot prop**

Open `src/app/iq-test/IQTestShell.tsx`. Add `timerSlot?: React.ReactNode` to the `IQTestShellProps` interface and render it in the header row next to the progress bar:

```typescript
// In IQTestShellProps interface, add:
timerSlot?: React.ReactNode;

// In the JSX, replace the existing header div:
<div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
  <span style={{ fontSize:11,fontWeight:700,color:"#48C59C",letterSpacing:"1px",textTransform:"uppercase" }}>{category}</span>
  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
    <span style={{ fontSize:11,color:"rgba(232,245,240,0.40)",fontWeight:500 }}>{current} / {total}</span>
    {timerSlot}
  </div>
</div>
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/iq-test/IQTestClient.tsx src/app/iq-test/IQTestShell.tsx
git commit -m "feat: rewrite IQTestClient with decreasing timer, 30 questions, no back"
```

---

## Task 9: IQLeadGate + IQResults Updates

**Files:**
- Modify: `src/app/iq-test/IQLeadGate.tsx`
- Modify: `src/app/iq-test/IQResults.tsx`

- [ ] **Step 1: Update IQLeadGate props interface and API call**

Open `src/app/iq-test/IQLeadGate.tsx`. Make these targeted changes:

Change the `Props` interface:
```typescript
interface Props {
  scores: IQScores;
  versionNumber: number;
  totalTimeMs: number;
  onUnlocked: () => void;
}
```

Update the destructure line:
```typescript
export function IQLeadGate({ scores, versionNumber, totalTimeMs, onUnlocked }: Props) {
```

Replace the `fetch` call in `handleSubmit`:
```typescript
const res = await fetch("/api/iq-leads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fullName: name,
    email,
    whatsapp,
    iqScore: scores.iq,
    percentile: scores.percentile,
    versionNumber,
    totalTimeMs,
  }),
});
```

Remove the local `IQScores` interface at the top of the file (it's now imported from `iqTestData`). Add the import:
```typescript
import { IQScores } from "./iqTestData";
```

- [ ] **Step 2: Update IQResults to use simplified IQScores**

Open `src/app/iq-test/IQResults.tsx`. The new `IQScores` type only has `iq` and `percentile`. Remove any references to `fri`, `qri`, `vci`, `vsi`, `wmi`. The bell curve and percentile display remain unchanged. Remove the radar chart section entirely.

The `axes` array and `radarPath` function should be deleted. Keep only the main score card and bell curve card.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Fix any remaining type errors (likely from removed `IQScores` fields).

- [ ] **Step 4: Commit**

```bash
git add src/app/iq-test/IQLeadGate.tsx src/app/iq-test/IQResults.tsx
git commit -m "feat: update IQLeadGate and IQResults for new IQ test flow"
```

---

## Task 10: Remove Old iqTestData Exports and Final Type Cleanup

**Files:**
- Modify: `src/app/iq-test/iqTestData.ts`

The old `iqTestData.ts` had `buildSession`, the old `IQQuestion`, and `SessionAnswer` types. Task 4 rewrote the file. This task ensures no lingering imports of removed exports break anything.

- [ ] **Step 1: Search for any remaining imports of old types**

```bash
grep -r "buildSession\|IQScores.*fri\|matrixGrid\|spatialBase\|verbal\|spatial" src/app/iq-test/ --include="*.tsx" --include="*.ts"
```

Expected: no matches. If matches found, fix each file.

- [ ] **Step 2: Run full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Start dev server and smoke test**

```bash
npm run dev
```

Navigate to `http://localhost:3000/iq-test`. Verify:
- [ ] 30 questions load (check counter shows "1 / 30")
- [ ] Timer shows on first question: `30s`
- [ ] Timer decrements each second
- [ ] Selecting an answer advances to next question
- [ ] At question 26, timer shows `10s`
- [ ] Let a timer expire → auto-advances without selecting
- [ ] After question 30 → lead gate appears (not results)
- [ ] No back button visible at any point
- [ ] Submit lead gate form → results appear
- [ ] Check Prisma Studio (`npx prisma studio`) → `IqTestResult` table has a new row

- [ ] **Step 4: Check mobile layout**

Resize browser to 375px wide. Verify:
- Matrix grid fits without overflow
- 3-column option grid readable
- Timer badge visible

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete IQ test redesign — 300 questions, decreasing timer, lead gate, Prisma DB"
```

---

## Verification Checklist

| Check | How |
|-------|-----|
| 30 questions per session | Question counter shows "1 / 30" to "30 / 30" |
| Correct version assigned | `console.log(versionRef.current)` in IQTestClient |
| Timer: 30s on Q1, 10s on Q26+ | Visual inspection |
| Timeout → wrong answer | Let timer expire, confirm score is lower |
| No back button | Inspect DOM — no "Previous" button |
| Lead gate before results | Complete test → form appears first |
| DB row saved | `npx prisma studio` → `IqTestResult` table |
| `versionNumber` saved correctly | Check Prisma Studio row |
| `totalTimeMs` > 0 | Check Prisma Studio row |
| Mobile layout OK | DevTools at 375px |