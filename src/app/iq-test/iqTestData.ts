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

// SVG data for symbol grid questions (3×3 or 4×4 grid)
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
  // For math/word questions, text options (e.g. "42"). For visual math, also used.
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
export const SYMBOL_SET = [
  "circle_slash",   // circle with diagonal line
  "square_inner",   // square with smaller inner square
  "triangle_line",  // triangle with diagonal line
  "triangle_empty", // empty triangle
  "circle_cross",   // circle with cross inside
  "rect_line",      // rectangle with horizontal line
  "circle_empty",   // empty circle
  "square_cross",   // square with X inside
  "triangle_right", // right-pointing triangle
  "diamond_empty",  // empty diamond
  "diamond_full",   // filled diamond
  "circle_full",    // filled circle
  "square_full",    // filled square
  "triangle_full",  // filled triangle
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
  // ratio 0.5 → IQ 100
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

// Question bank — populated in iqQuestionBank.ts
export { QUESTION_BANK } from "./iqQuestionBank";
