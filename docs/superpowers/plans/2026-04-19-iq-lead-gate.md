# IQ Test Lead Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Supabase auth gate on IQ test results with a lead capture form (Name + WhatsApp + Email) that redirects to the WhatsApp group and emails the user their scores.

**Architecture:** After the quiz completes, a new `"form"` phase renders a blurred results preview with an embedded lead form. On submit, the lead is saved to the DB (reusing existing `QuizLead` model + `/api/quiz-leads`), results are emailed to the user via Resend, and the WhatsApp group opens in a new tab while the full results are revealed on-screen.

**Tech Stack:** Next.js 14 App Router, Resend (already configured), Prisma + Supabase DB, existing `QuizLeadForm` component, existing `/api/quiz-leads` API route.

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `src/app/iq-test/IQTestClient.tsx` | Modify | Remove auth check; add `"form"` phase; pass scores to gate |
| `src/app/iq-test/IQLockScreen.tsx` | Replace | Becomes `IQLeadGate.tsx` — blurred results + embedded form |
| `src/app/iq-test/IQLeadGate.tsx` | Create | New component: blur overlay + lead form + WhatsApp redirect |
| `src/app/api/quiz-leads/route.ts` | Modify | Accept IQ scores in body; send results email to user |
| `src/emails/iq-results.html` | Create | Branded HTML email with IQ score, percentile, cognitive profile |

**No schema changes needed** — IQ scores stored in existing `quizAnswers: Json` field. `leadSource` set to `"iq-test"` to filter in admin.

---

## Task 1: Create IQLeadGate Component

**Files:**
- Create: `src/app/iq-test/IQLeadGate.tsx`

This component shows blurred/dimmed results behind a centered lead form card.

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface IQScores {
  iq: number;
  percentile: number;
  fri: number;
  qri: number;
  vci: number;
  vsi: number;
  wmi: number;
}

interface Props {
  scores: IQScores;
  sessionId: string;
  onUnlocked: () => void;
}

const WHATSAPP_GROUP = "https://chat.whatsapp.com/CLglLgiCl0BCCv7qhquEW0";

export function IQLeadGate({ scores, sessionId, onUnlocked }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/quiz-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: name,
        email,
        whatsapp,
        leadSource: "iq-test",
        quizAnswers: scores,
        recommendedMajors: [],
        recommendedUniversities: [],
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Open WhatsApp group in new tab, reveal results on this page
    window.open(WHATSAPP_GROUP, "_blank", "noopener,noreferrer");
    onUnlocked();
  }

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh" }}>
      {/* Blurred score teaser behind the gate */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: "blur(8px)",
          opacity: 0.35,
          pointerEvents: "none",
          userSelect: "none",
          fontSize: 96,
          fontWeight: 900,
          color: "var(--color-accent)",
          fontFamily: "var(--font-heading)",
        }}
      >
        {scores.iq}
      </div>

      {/* Lead form overlay */}
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(72,197,156,0.12)",
                border: "1px solid rgba(72,197,156,0.3)",
                borderRadius: 100,
                padding: "6px 16px",
                fontSize: 13,
                color: "var(--color-accent)",
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              🧠 Your results are ready
            </div>
            <h2 className="text-3xl font-heading font-black mb-2">
              Unlock your IQ score
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Enter your details to reveal your full cognitive profile and join our WhatsApp community.
            </p>
          </div>

          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="input-glass w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-glass w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  WhatsApp Number{" "}
                  <span style={{ fontWeight: 400, opacity: 0.6 }}>(recommended)</span>
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                  required
                  placeholder="+1 234 567 8900"
                  className="input-glass w-full"
                />
              </div>

              {error && (
                <p
                  className="text-sm rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-accent w-full justify-center"
              >
                {loading ? "Saving…" : "Reveal My Score & Join WhatsApp →"}
              </button>
            </form>

            <p className="text-center text-xs mt-4" style={{ color: "var(--color-text-tertiary)" }}>
              We&apos;ll email your full cognitive report. No spam.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file exists and TypeScript is clean**

```bash
npx tsc --noEmit 2>&1 | grep IQLeadGate
```
Expected: no output (no errors in this file).

---

## Task 2: Modify IQTestClient to Use the New Gate

**Files:**
- Modify: `src/app/iq-test/IQTestClient.tsx`

Replace the auth-dependent `"lock"` phase with a `"form"` phase that renders `IQLeadGate`.

- [ ] **Step 1: Read the current IQTestClient.tsx** to find the exact lines for the phase state and the phase rendering switch/if block.

- [ ] **Step 2: Remove auth imports and Supabase session check**

Remove any `import { createClient }` from supabase client and any `useEffect` that checks the session to decide between `"lock"` and `"results"` phases.

- [ ] **Step 3: Change phase transition after quiz completion**

Find where the quiz completion logic runs (the `handleAnswer` or `handleNext` function that fires when `currentIdx` reaches the last question). Change it so it always transitions to `"form"`:

```typescript
// After scoring the session:
const computed = scoreSession(answers, session);
setScores(computed);
setPhase("form");  // was: setPhase(session ? "results" : "lock")
```

- [ ] **Step 4: Add the IQLeadGate import and render it in the form phase**

At the top:
```typescript
import { IQLeadGate } from "./IQLeadGate";
```

In the render/return block, add the `"form"` case:
```typescript
if (phase === "form" && scores) {
  return (
    <IQLeadGate
      scores={scores}
      sessionId={sessionId}
      onUnlocked={() => setPhase("results")}
    />
  );
}
```

Remove (or leave unused) any `if (phase === "lock")` branch — the `IQLockScreen` import can be removed.

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep IQTestClient
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/app/iq-test/IQLeadGate.tsx src/app/iq-test/IQTestClient.tsx
git commit -m "feat: replace auth gate with lead capture form on IQ test results"
```

---

## Task 3: Create IQ Results Email Template

**Files:**
- Create: `src/emails/iq-results.html`

- [ ] **Step 1: Create the branded HTML email**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your IQ Test Results — Bridge4China</title>
  <style>
    body { margin: 0; padding: 0; background: #030806; font-family: 'Helvetica Neue', Arial, sans-serif; color: #e8f5f1; }
    .container { max-width: 560px; margin: 0 auto; padding: 48px 24px; }
    .logo { font-size: 20px; font-weight: 900; color: #48C59C; letter-spacing: -0.5px; margin-bottom: 40px; }
    .score-box { background: linear-gradient(135deg, rgba(72,197,156,0.15), rgba(72,197,156,0.05)); border: 1px solid rgba(72,197,156,0.3); border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 32px; }
    .iq-number { font-size: 80px; font-weight: 900; color: #48C59C; line-height: 1; margin-bottom: 8px; }
    .iq-label { font-size: 14px; color: rgba(232,245,241,0.6); margin-bottom: 4px; }
    .iq-percentile { font-size: 18px; font-weight: 700; color: #e8f5f1; }
    .indices { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px; }
    .index-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; text-align: center; }
    .index-value { font-size: 28px; font-weight: 800; color: #48C59C; }
    .index-name { font-size: 11px; color: rgba(232,245,241,0.5); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .cta { display: block; background: #48C59C; color: #030806; text-decoration: none; font-weight: 800; font-size: 15px; text-align: center; padding: 16px 32px; border-radius: 14px; margin-bottom: 32px; }
    .footer { font-size: 12px; color: rgba(232,245,241,0.3); text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Bridge4China</div>

    <p style="font-size:16px; margin-bottom:8px;">Hi {{NAME}},</p>
    <p style="color:rgba(232,245,241,0.7); margin-bottom:32px; font-size:14px; line-height:1.6;">
      Here are your complete IQ test results. Your cognitive profile spans five key indices measured by our adaptive assessment.
    </p>

    <div class="score-box">
      <div class="iq-number">{{IQ_SCORE}}</div>
      <div class="iq-label">Your IQ Score</div>
      <div class="iq-percentile">Top {{PERCENTILE_REMAINING}}% of test-takers · {{IQ_LABEL}}</div>
    </div>

    <div class="indices">
      <div class="index-card">
        <div class="index-value">{{FRI}}</div>
        <div class="index-name">Fluid Reasoning</div>
      </div>
      <div class="index-card">
        <div class="index-value">{{QRI}}</div>
        <div class="index-name">Quantitative</div>
      </div>
      <div class="index-card">
        <div class="index-value">{{VCI}}</div>
        <div class="index-name">Verbal</div>
      </div>
      <div class="index-card">
        <div class="index-value">{{VSI}}</div>
        <div class="index-name">Visual-Spatial</div>
      </div>
      <div class="index-card" style="grid-column: span 2;">
        <div class="index-value">{{WMI}}</div>
        <div class="index-name">Working Memory</div>
      </div>
    </div>

    <a href="https://bridge4china.com/iq-test" class="cta">
      Retake the Test →
    </a>

    <div class="footer">
      Bridge4China · Helping students study in China<br />
      You received this because you completed our IQ assessment.
    </div>
  </div>
</body>
</html>
```

---

## Task 4: Update /api/quiz-leads to Send IQ Results Email

**Files:**
- Modify: `src/app/api/quiz-leads/route.ts`

- [ ] **Step 1: Read the current route file** to find the exact structure.

- [ ] **Step 2: Add IQ results email logic**

After the existing admin notification email, add a user-facing email when `leadSource === "iq-test"`:

```typescript
// Inside the POST handler, after creating the lead:
if (leadSource === "iq-test" && quizAnswers) {
  const scores = quizAnswers as {
    iq: number; percentile: number;
    fri: number; qri: number; vci: number; vsi: number; wmi: number;
  };
  
  const iqLabels: Record<number, string> = {
    145: "Genius", 130: "Very Superior", 120: "Superior",
    110: "High Average", 90: "Average", 80: "Low Average", 0: "Below Average"
  };
  const labelKey = [145, 130, 120, 110, 90, 80, 0].find(k => scores.iq >= k) ?? 0;
  const iqLabel = iqLabels[labelKey];
  const percentileRemaining = Math.round(100 - scores.percentile);

  const fs = await import("fs/promises");
  const path = await import("path");
  const templatePath = path.join(process.cwd(), "src/emails/iq-results.html");
  let html = await fs.readFile(templatePath, "utf-8");
  html = html
    .replace("{{NAME}}", fullName)
    .replace("{{IQ_SCORE}}", String(scores.iq))
    .replace("{{PERCENTILE_REMAINING}}", String(percentileRemaining))
    .replace("{{IQ_LABEL}}", iqLabel)
    .replace("{{FRI}}", String(scores.fri))
    .replace("{{QRI}}", String(scores.qri))
    .replace("{{VCI}}", String(scores.vci))
    .replace("{{VSI}}", String(scores.vsi))
    .replace("{{WMI}}", String(scores.wmi));

  getResend().emails.send({
    from: "Bridge4China <onboarding@resend.dev>",
    to: email,
    subject: `Your IQ Score: ${scores.iq} — Bridge4China`,
    html,
  }).catch(console.error);
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep quiz-leads
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/quiz-leads/route.ts src/emails/iq-results.html
git commit -m "feat: send IQ results email to user after lead capture"
```

---

## Task 5: Update Admin to Label IQ Test Leads

**Files:**
- Modify: `src/app/admin/QuizLeadsTab.tsx`

The admin already sees all QuizLead records. Add a visible badge when `leadSource === "iq-test"` so admin can distinguish IQ leads from university quiz leads.

- [ ] **Step 1: Read QuizLeadsTab.tsx** to find the table row rendering.

- [ ] **Step 2: Add leadSource badge in the table row**

Find where `lead.email` or `lead.fullName` is rendered in the table cell, and add:

```tsx
{lead.leadSource === "iq-test" && (
  <span style={{
    fontSize: 10, fontWeight: 700, padding: "2px 8px",
    borderRadius: 100, background: "rgba(72,197,156,0.15)",
    color: "var(--color-accent)", border: "1px solid rgba(72,197,156,0.3)",
    marginLeft: 6, verticalAlign: "middle"
  }}>
    IQ
  </span>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/QuizLeadsTab.tsx
git commit -m "feat: add IQ badge to admin leads table for iq-test source"
```

---

## Verification

**End-to-end test:**
1. Go to `/iq-test` → complete all questions
2. Lead gate appears with blurred score in background
3. Fill Name + WhatsApp + Email → click "Reveal My Score & Join WhatsApp →"
4. WhatsApp group opens in new tab
5. Full `IQResults` component renders on the current page
6. Check email inbox → IQ results email received with correct scores
7. Go to `/admin` → lead appears in the table with "IQ" badge

**Admin test:**
1. Sign in as admin (email/password via the new Server Action) → no login loop
2. Navigate to Leads tab → see the IQ test lead with badge

**No schema migration needed** — `quizAnswers: Json` absorbs the IQ scores, `leadSource: "iq-test"` distinguishes them.