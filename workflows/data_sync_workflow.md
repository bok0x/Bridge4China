# Data Sync Workflow
## WAT Layer: Workflow (Instructions)

**Objective:** Pull fresh program and university data from ScholarshipChina.com into
the `/data/` folder (the site's Source of Truth), then sync to Supabase.

**Frequency:** Run monthly, or on demand after ScholarshipChina.com updates new intakes.

**Estimated runtime:**
- Sample run (5–10 universities): ~3 minutes
- Full run (all ~300+ universities, 12,000+ programs): ~45–60 minutes

---

## Why the old scraper was missing 84% of data

The previous scraper (`scrape_scholarshipchina.py`) only called the **list API**
(`/api/sc/products`), which returns summary fields only. The **detail endpoint**
(`/api/sc/products/{id}`) is what contains:

| Section | API Field | Content |
|---|---|---|
| Program Details | `education_duration`, `arrival_season`, `end_at` | Duration, intake, deadline |
| Promotion Materials (Fees) | `charges[]`, `subsidy` HTML | Tuition breakdown, registration fee |
| Application Requirements | `requirement[]` structured array | Every document required, with examples |

The new tool (`scrape_scholarship_china.py`) fetches both list + detail endpoints.

---

## Prerequisites

```bash
# 1. Python 3.11+
python --version

# 2. Install dependencies
pip install -r tools/requirements.txt

# 3. Verify .env has the right keys
cat .env | grep -v KEY  # should show DATABASE_URL, SUPABASE_URL, etc.
```

---

## Step 1 — Scrape (fetch fresh data)

### Option A: Sample run (verify before full run)

```bash
# 5 target universities — confirms the tool is working
python tools/scrape_scholarship_china.py \
  --filter-unis "Tsinghua,Peking University,Fudan,Tongji,Zhejiang University" \
  --output .tmp/raw_programs_detail.json
```

Expected: 30–150 programs in `.tmp/raw_programs_detail.json` within 2–3 minutes.

### Option B: Full run (all universities)

```bash
python tools/scrape_scholarship_china.py \
  --output .tmp/raw_programs_detail.json \
  --workers 8
```

**If the run is interrupted**, resume without losing progress:

```bash
python tools/scrape_scholarship_china.py --resume
```

### Option C: Enable Firecrawl fallback (optional)

Only needed if the API starts rate-limiting or returning 403s.

```bash
# First: add FIRECRAWL_API_KEY=fc-xxxx to .env
python tools/scrape_scholarship_china.py --use-firecrawl
```

> **Note:** Firecrawl costs API credits (~$0.001–0.003 per page). At 12,000 programs,
> a full Firecrawl-only run would cost ~$12–36. Use it as a fallback only.

### What a healthy scrape log looks like

```
[10:00:01] ============================================================
[10:00:01] ChinaUniMatch — ScholarshipChina Detail Scraper
[10:00:01] ============================================================
[10:00:01] Step 1 — Fetching product list from list API …
[10:00:03]   Found 12247 programs across 245 pages
[10:00:45]   List fetch complete: 12247 product summaries
[10:00:45] Step 2 — Fetching detail data for 12247 programs …
[10:00:45]   Workers: 8  |  Firecrawl fallback: OFF
[10:02:30]   Progress: 500/12247 (4%)
...
[10:45:00]   Detail fetch complete: 12247 records
[10:45:01] ============================================================
[10:45:01]   Total programs      : 12247
[10:45:01]   Unique universities : 318
[10:45:01]   Detail via API      : 12230
[10:45:01]   Errors              : 17
[10:45:01]   Have requirements   : 12200
[10:45:01] ============================================================
```

### Failure / edge cases

| Symptom | Action |
|---|---|
| `Connection timeout` errors | Normal for a few records — the retry logic handles them |
| More than 5% errors | Check `_error` field in output; may be API rate limit |
| Rate limited (429 errors) | Reduce workers: `--workers 4` |
| Run killed mid-way | Re-run with `--resume` flag |

---

## Step 2 — Normalize (validate and clean)

```bash
python tools/normalize_program_data.py \
  --input .tmp/raw_programs_detail.json \
  --output .tmp/normalized_programs.json
```

### What normalization does

1. Maps raw API fields to the canonical `ProgramModel` schema
2. Parses `requirement[]` array → boolean document flags + `rawRequirements[]` list
3. Parses `subsidy` HTML → structured fee fields (`registrationFee`, `feeNotes`)
4. Validates degree, language, tuition using Pydantic validators
5. Flags records as `complete` or `incomplete` (missing tuition)

### Validation report

```bash
cat .tmp/validation_report.json
```

A healthy run should show:
- `normalized`: 85%+ (vs. 15% with the old scraper)
- `incomplete`: under 15% (programs genuinely missing tuition on ScholarshipChina.com)
- `skipped`: under 1%
- `errors`: 0

### Mandatory check: review incomplete records

```bash
python3 -c "
import json
from pathlib import Path
data = json.loads(Path('.tmp/normalized_programs.json').read_text())
incomplete = [p for p in data if p.get('status') == 'incomplete']
print(f'Incomplete: {len(incomplete)}')
# Show the first few missing fields
for p in incomplete[:5]:
    print(p['universityName'], '—', p.get('missingFields'))
"
```

If most incomplete records have `missingFields: ['originalTuition']`, that means
ScholarshipChina.com genuinely does not publish the tuition for those programs
(they require contacting the university). This is expected and not a bug.

---

## Step 3 — Export to /data/ (Source of Truth)

```bash
python tools/export_to_data.py \
  --input .tmp/normalized_programs.json \
  --data-dir data/
```

This writes:
- `data/universities/{slug}.json` — one file per university (profile + all programs)
- `data/programs/all_programs.json` — flat list of all programs

### Verify the output

```bash
# Count university files
ls data/universities/ | wc -l

# Spot-check a major university
cat "data/universities/tsinghua-university.json" | python3 -m json.tool | head -50

# Count complete programs
python3 -c "
import json
from pathlib import Path
data = json.loads(Path('data/programs/all_programs.json').read_text())
progs = data['programs']
complete = sum(1 for p in progs if p.get('status') == 'complete')
print(f'{complete}/{len(progs)} programs complete ({100*complete//len(progs)}%)')
"
```

---

## Step 3.5 — Data Integrity Check (mandatory before sync)

Run this after every export to catch missing university names, broken city mappings,
duplicate IDs, and degree mismatches before they reach the frontend or Supabase.

```bash
python -c "
import json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from collections import Counter

with open('data/programs/all_programs.json', encoding='utf-8') as f:
    programs = json.load(f)['programs']

total = len(programs)
errors = []

# 1. id field present on every program
missing_id = [p.get('universityName','?') + '/' + p.get('programName','?') for p in programs if not p.get('id')]
if missing_id:
    errors.append(f'MISSING id: {len(missing_id)} programs — e.g. {missing_id[0]}')

# 2. universityName present on every program
missing_uni = sum(1 for p in programs if not p.get('universityName'))
if missing_uni:
    errors.append(f'MISSING universityName: {missing_uni}/{total} programs')

# 3. city present on every program
missing_city = sum(1 for p in programs if not p.get('city'))
if missing_city:
    errors.append(f'MISSING city: {missing_city}/{total} programs')

# 4. No legacy PHD degree values (must be DOCTORAL)
legacy_phd = sum(1 for p in programs if p.get('degree') == 'PHD')
if legacy_phd:
    errors.append(f'LEGACY degree PHD (not DOCTORAL): {legacy_phd} programs')

# 5. No duplicate IDs
ids = [p['id'] for p in programs if p.get('id')]
dup_ids = len(ids) - len(set(ids))
if dup_ids:
    errors.append(f'DUPLICATE IDs: {dup_ids}')

# 6. City distribution (informational)
cities = Counter(p.get('city') for p in programs)
print(f'Programs: {total}')
print(f'Cities:   {dict(sorted(cities.items(), key=lambda x: -x[1]))}')
degrees = Counter(p.get('degree') for p in programs)
print(f'Degrees:  {dict(degrees)}')

if errors:
    print()
    print('DATA INTEGRITY ERRORS:')
    for e in errors:
        print(f'  [FAIL] {e}')
    sys.exit(1)
else:
    print()
    print('[PASS] All integrity checks passed.')
"
```

A healthy run shows no `[FAIL]` lines. If any fail, **do not proceed to Step 4** —
fix the pipeline tool that produced the bad data and re-run Steps 2–3.

### What each check catches

| Check | What it prevents |
|---|---|
| Missing `id` | Program detail pages returning 404 |
| Missing `universityName` | Cards showing blank "University" label |
| Missing `city` | City filter returning 0 results for valid cities |
| Legacy `PHD` degree | "Doctoral" filter returning 0 results |
| Duplicate IDs | ID lookup returning the wrong program |

---

## Step 4 — Sync to Supabase

```bash
python tools/sync_to_supabase.py \
  --input .tmp/normalized_programs.json
```

This upserts all programs and universities into the Supabase database.

### After sync: trigger ISR revalidation (if deployed)

```bash
python tools/trigger_revalidation.py
```

This calls the Next.js revalidation webhook so the deployed site picks up new data
without a full redeploy.

---

## Full pipeline (one-liner)

```bash
python tools/scrape_scholarship_china.py && \
python tools/normalize_program_data.py && \
python tools/export_to_data.py && \
python tools/sync_to_supabase.py && \
python tools/trigger_revalidation.py
```

---

## Data Schema Reference

Each program in `/data/` follows this structure:

```jsonc
{
  // Identity
  "universityName": "Tsinghua University",
  "universitySlug": "tsinghua-university",
  "city": "Beijing",
  "province": "Beijing",

  // Program
  "programName": "Computer Science and Technology",
  "field": "Computer Science and Technology",
  "degree": "MASTER",                // BACHELOR | MASTER | PHD | DIPLOMA
  "teachingLanguage": "ENGLISH",     // ENGLISH | CHINESE | BILINGUAL
  "programDuration": "2 years",
  "intakeSeason": "September",
  "applicationDeadline": "2026-05-31",
  "acceptsMinors": false,

  // Fees (CNY per year)
  "originalTuition": 40000,
  "tuitionAfterScholarship": null,   // null if no scholarship
  "accommodationFee": 12000,         // per year
  "registrationFee": 400,
  "applicationFee": null,
  "serviceFee": null,
  "feeNotes": "Registration fee 400 RMB non-refundable ...",

  // Documents required
  "requiresPassportPhoto": true,
  "requiresPassportId": true,
  "requiresTranscripts": true,
  "requiresHighestDegree": true,
  "requiresPhysicalExam": true,
  "requiresNonCriminalRecord": true,
  "requiresEnglishCert": true,
  "requiresChineseCert": false,
  "requiresApplicationForm": true,
  "requiresStudyPlan": true,
  "requiresCV": true,
  "requiresRecommendations": true,
  "recommendationLetterCount": 2,
  "requiresPortfolio": false,
  "rawRequirements": [               // human-readable list for UI display
    "Passport-sized Photo",
    "Passport ID Page",
    "Academic Transcripts (scanned color copy)",
    "..."
  ],

  // Scholarships
  "scholarships": [
    {
      "type": "UNIVERSITY",          // CSC | PROVINCIAL | UNIVERSITY | SILK_ROAD | OTHER
      "name": "University Scholarship",
      "duration": "",
      "coversTuition": false,
      "livingAllowance": null,
      "policyDetails": "..."
    }
  ],

  // Meta
  "sourceUrl": "https://www.scholarshipchina.com/programs/...",
  "detailSource": "api",             // api | firecrawl | legacy
  "status": "complete",              // complete | incomplete
  "missingFields": []
}
```

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'firecrawl'`
Firecrawl is optional. Either install it (`pip install firecrawl-py`) or don't use `--use-firecrawl`.

### `pydantic.ValidationError` during normalization
Check the `error_details` in `.tmp/validation_report.json`. Usually caused by
an unexpected API field type.

### Supabase sync fails with "relation does not exist"
Run `npx prisma migrate dev` first to create the database tables.

### ISR revalidation returns 401
Add `REVALIDATION_SECRET` to `.env` and match it in `next.config.mjs`.

---

## Maintenance

- **Monthly:** Run the full pipeline to catch new programs and updated fees.
- **Before each intake season** (March, September): Run a targeted sample for the
  top 50 universities to verify deadlines are current.
- **After schema changes:** Update `ProgramModel` in `normalize_program_data.py`
  and re-run export + sync.
