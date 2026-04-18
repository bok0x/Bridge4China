# IQ Test SaaS Implementation Guide & Claude Prompt

This document provides a comprehensive framework for building a "perfect" IQ test SaaS, combining insights from top psychometric sites. It includes a structured prompt to give to Claude for code generation and architectural design.

## 1. Core Architecture & Logic

### A. Psychometric Framework (CHC Theory)
Your test should measure the following indices to be scientifically credible:
| Index | Full Name | Description | Question Types |
| :--- | :--- | :--- | :--- |
| **FRI** | Fluid Reasoning | Solving novel problems without prior knowledge. | 3x3 Matrix Puzzles, Figure Weights. |
| **VCI** | Verbal Comprehension | Understanding verbal concepts and vocabulary. | Analogies, Synonyms, Sentence Logic. |
| **VSI** | Visual-Spatial | Analyzing visual details and spatial relationships. | 3D Rotations, Block Design. |
| **QRI** | Quantitative Reasoning | Logic involving numbers and mathematical patterns. | Number Series, Math Word Problems. |
| **WMI** | Working Memory | Holding and manipulating information in mind. | Digit Span, Reverse Sequences. |

### B. Adaptive Testing (IRT)
Implement **Item Response Theory (IRT)**. Instead of a fixed list of questions:
1. Start with a medium-difficulty question.
2. If correct, the next question is harder.
3. If incorrect, the next question is easier.
4. **Benefit:** Shorter tests (15-20 mins) with higher accuracy.

---

## 2. Question Design & Scarped Patterns

### Matrix Puzzles (FRI)
- **Logic Rules:**
  - **Constant:** An element remains the same across a row/column.
  - **Progressive:** An element grows, shrinks, or rotates (e.g., 45° clockwise).
  - **Addition/Subtraction:** Shape A + Shape B = Shape C.
  - **XOR Logic:** Elements appearing in both previous cells are removed in the third.

### Verbal & Logic (VCI)
- **Pattern:** "A is to B as C is to [?]"
- **Logic Statements:** "If all Bloops are Razzies, and some Razzies are Lurgs, are some Bloops definitely Lurgs?" (True/False/Cannot Determine).

---

## 3. The "Claude Prompt" for Implementation

Copy and paste the following prompt into Claude to begin the development process.

> **System Prompt for Claude:**
> 
> "I am building a high-end IQ Test SaaS. I need you to act as a Lead Full-Stack Engineer and Psychometrician. 
> 
> **The Goal:** Build a web application that administers a 20-40 question adaptive IQ test, calculates a score based on CHC theory, and generates a 'glassy' Apple-style dashboard report.
> 
> **Technical Requirements:**
> 1. **Frontend:** React (Next.js), Tailwind CSS, Framer Motion (for smooth transitions between questions).
> 2. **Design Aesthetic:** 'Glassmorphism' (blurred backgrounds), dark/light mode (Green & Black theme), iOS-style cards.
> 3. **Logic:** Implement an Item Response Theory (IRT) based scoring algorithm. 
> 4. **Question Types:**
>    - 3x3 Matrix Reasoning (SVG-based or Image-based).
>    - Number/Letter Series.
>    - Verbal Analogies.
>    - Spatial Rotation (3D).
> 5. **Reporting:** A dashboard showing:
>    - Total FSIQ (Full Scale IQ).
>    - Percentile Rank.
>    - Radar Chart for FRI, VCI, VSI, QRI, WMI.
>    - 95% Confidence Interval.
> 
> **Phase 1: Architecture & Data Schema**
> Please propose the JSON structure for a 'Question' object that supports multiple types (matrix, text, sequence) and includes 'difficulty_theta' for IRT. Also, outline the React state management for the adaptive test flow.
> 
> **DO NOT start building code until I confirm I understand the architecture 95%. Ask me clarifying questions first.**"

---

## 4. Visual & UI Guidelines

### A. Question Layout
- **Center-focused:** Large, clear question area.
- **Progress Bar:** Slim, Apple-style top bar.
- **Timer:** Discrete circular countdown (only if using timed-by-item).

### B. Scoring Dashboard (The "Value" Prop)
- **The Bell Curve:** A smooth SVG curve showing where the user sits in the population.
- **The Sigma (σ) Scale:** Markings at 70, 85, 100, 115, 130, 145.
- **Downloadable PDF:** Use `jspdf` or `react-pdf` to generate a professional certificate.

## 5. Implementation Roadmap
1. **Scraping/Asset Prep:** Use SVGs for matrix puzzles to ensure they look sharp on all screens.
2. **Algorithm Development:** Build the scoring engine first using a standard normal distribution (Mean 100, SD 15).
3. **Frontend Polish:** Focus on the 'vibe'—smooth fades between questions make the test feel premium.
4. **Monetization:** Integrate Stripe for "Full Detailed Reports" (common in top sites like CognitiveMetrics).
