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
      optionDegrees: [90, 180, 270, 45, -1, 315],
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
    prompt: "Three friends split a $30 hotel bill, each paying $10. The hotel returns $5. They each keep $1 and give $2 to the bellboy. Each paid $9 ($27 total) + $2 bellboy = $29. Where is the missing dollar?",
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
];
