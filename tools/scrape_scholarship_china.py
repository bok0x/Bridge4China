"""
Enhanced scraper for scholarshipchina.com — WAT Tool Layer

Root cause of previous incomplete data (84%):
  The old scraper only fetched list-level API data. The detail endpoint
  /api/sc/products/{id} is what contains the three critical sections:
    1. Program Details  (education_duration, language, arrival info)
    2. Promotion Materials / Fees  (subsidy HTML, charges breakdown)
    3. Application Requirements  (structured requirement[] array)

Strategy:
  Step 1 — Fetch all product IDs from the list API (fast, one call per page)
  Step 2 — Fetch detail data concurrently for each product
  Step 3 — Optional: Firecrawl fallback for any records the API cannot serve
  Step 4 — Write checkpoint files so runs can be resumed after interruption

Usage:
    # Full run (all universities, all programs)
    python tools/scrape_scholarship_china.py

    # Sample: 5 universities by name
    python tools/scrape_scholarship_china.py --filter-unis "Tsinghua,Peking University,Fudan,Tongji,Zhejiang"

    # Quick test: first 50 programs only
    python tools/scrape_scholarship_china.py --max-programs 50

    # Enable Firecrawl fallback (requires FIRECRAWL_API_KEY in .env)
    python tools/scrape_scholarship_china.py --use-firecrawl

    # Resume an interrupted run
    python tools/scrape_scholarship_china.py --resume

Output:
    .tmp/raw_programs_detail.json   — enriched programs (all three sections)
    .tmp/scrape_checkpoint.json     — progress file for resume

Downstream:
    python tools/normalize_program_data.py
    python tools/export_to_data.py
"""

from __future__ import annotations

import argparse
import json
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, UTC
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv

load_dotenv()

# ─── Configuration ────────────────────────────────────────────────────────────

API_BASE = "https://center.istudyedu.com/api/sc"
SC_BASE  = "https://www.scholarshipchina.com"

OUTPUT_FILE     = Path(".tmp/raw_programs_detail.json")
CHECKPOINT_FILE = Path(".tmp/scrape_checkpoint.json")

MAX_WORKERS    = 8    # concurrent detail fetches
REQUEST_DELAY  = 0.15  # seconds between requests per thread
PAGE_SIZE      = 50   # programs per list page (max the API supports)
RETRY_COUNT    = 4
RETRY_BACKOFF  = [1, 2, 4, 8]  # seconds

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
    "Referer": "https://www.scholarshipchina.com/",
    "Origin":  "https://www.scholarshipchina.com",
}

# Document requirement IDs → normalized field names
REQUIREMENT_ID_MAP: dict[int, str] = {
    1:  "requiresPassportPhoto",
    2:  "requiresPassportId",
    4:  "requiresTranscripts",
    5:  "requiresTranscripts",        # "High School Transcript"
    11: "requiresHighestDegree",
    12: "requiresHighestDegree",      # "Notarized Degree"
    13: "requiresPhysicalExam",
    14: "requiresNonCriminalRecord",
    15: "requiresNonCriminalRecord",  # "No Criminal Record Certificate"
    16: "requiresEnglishCert",
    17: "requiresChineseCert",
    18: "requiresHskCert",
    20: "requiresApplicationForm",
    21: "requiresApplicationForm",    # University-specific form
    22: "requiresStudyPlan",          # "Personal Statement"
    23: "requiresStudyPlan",          # "Study Plan"
    24: "requiresCV",
    25: "requiresRecommendations",
    26: "requiresCV",                 # "Self-introduction Video"
    27: "requiresRecommendations",    # "Recommendation Letter"
    28: "requiresRecommendations",    # "2 Recommendation Letters"
    29: "requiresPortfolio",
}

# IDs that imply recommendation letters exist (count them)
RECOMMENDATION_IDS = {25, 27, 28}
TWO_LETTER_IDS     = {28}


# ─── Logging ──────────────────────────────────────────────────────────────────

def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


# ─── HTTP helpers ─────────────────────────────────────────────────────────────

def get_json(url: str, params: dict | None = None, retries: int = RETRY_COUNT) -> dict | None:
    for attempt in range(retries):
        try:
            resp = requests.get(url, headers=HEADERS, params=params, timeout=20)
            resp.raise_for_status()
            return resp.json()
        except requests.HTTPError as e:
            if e.response is not None and e.response.status_code == 404:
                return None  # Not found — don't retry
            wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
            if attempt < retries - 1:
                log(f"  HTTP error on {url}: {e} — retrying in {wait}s")
                time.sleep(wait)
            else:
                log(f"  FAILED after {retries} attempts: {url} — {e}")
                return None
        except Exception as e:
            wait = RETRY_BACKOFF[min(attempt, len(RETRY_BACKOFF) - 1)]
            if attempt < retries - 1:
                time.sleep(wait)
            else:
                log(f"  FAILED after {retries} attempts: {url} — {e}")
                return None
    return None


# ─── Step 1: Fetch all product summaries from list API ───────────────────────

def fetch_all_product_summaries(max_programs: int = 0, filter_unis: list[str] | None = None) -> list[dict]:
    """
    Fetch the complete product list from /api/sc/products.

    The API returns paginated results. Top-level response structure:
        {"code": 200, "data": [list], "total": N, "total_pages": N, "pageSize": N}

    filter_unis: if provided, scan all pages but only keep matching schools.
                 Matching is case-insensitive substring on the school_name field.
    """
    log("Step 1 — Fetching product list from list API …")
    filter_lower = [u.strip().lower() for u in filter_unis] if filter_unis else None
    all_products: list[dict] = []
    page = 1
    total_pages = 1  # resolved after first response

    while page <= total_pages:
        params = {"limit": PAGE_SIZE, "page": page}
        resp = get_json(f"{API_BASE}/products", params=params)
        if not resp or resp.get("code") != 200:
            log(f"  Warning: empty/error response on page {page}, stopping.")
            break

        # total_pages lives at the TOP level, not inside data
        if page == 1:
            grand_total  = resp.get("total", 0)
            total_pages  = int(resp.get("total_pages") or 1)
            log(f"  Found {grand_total} programs across {total_pages} pages (pageSize={PAGE_SIZE})")

        # data is always a list
        items = resp.get("data") or []
        if not isinstance(items, list):
            items = items.get("data") or items.get("list") or []

        # Client-side filter by school name when filter_unis is active
        if filter_lower:
            items = [
                it for it in items
                if any(f in (it.get("school_name") or "").lower() for f in filter_lower)
            ]

        all_products.extend(items)
        page += 1
        time.sleep(0.15)

        # Progress for long runs (every 50 pages)
        if page % 50 == 0:
            log(f"  List page {page}/{total_pages} — collected {len(all_products)} so far")

        if max_programs and len(all_products) >= max_programs:
            all_products = all_products[:max_programs]
            log(f"  --max-programs {max_programs} reached, stopping list fetch.")
            break

    log(f"  List fetch complete: {len(all_products)} product summaries")
    if filter_unis:
        log(f"  Filter '{', '.join(filter_unis)}' matched {len(all_products)} programs")

    return all_products


# ─── Step 2: Fetch detail data for each product ───────────────────────────────

def fetch_product_detail(product_id: int) -> dict | None:
    """
    Fetch full detail for one product from /api/sc/products/{id}.
    This endpoint returns requirement[], subsidy, scholarship_policy,
    education_duration — the three sections missing from the list API.
    """
    resp = get_json(f"{API_BASE}/products/{product_id}")
    if not resp or resp.get("code") != 200:
        return None
    return resp.get("data")


def fetch_product_detail_firecrawl(urlname: str, api_key: str) -> dict | None:
    """
    Firecrawl fallback: scrape the program detail page and parse sections
    from the returned markdown. Used only when the direct API fails.

    Requires: pip install firecrawl-py
              FIRECRAWL_API_KEY set in .env
    """
    try:
        from firecrawl import FirecrawlApp  # type: ignore
    except ImportError:
        log("  firecrawl-py not installed. Run: pip install firecrawl-py")
        return None

    url = f"{SC_BASE}/programs/{urlname}"
    try:
        app = FirecrawlApp(api_key=api_key)
        result = app.scrape_url(
            url,
            params={
                "formats": ["markdown"],
                "waitFor": 2000,           # wait for Nuxt.js SPA to render
                "timeout": 30000,
                "excludeTags": ["nav", "footer", "header", "script", "style"],
            },
        )
        md = getattr(result, "markdown", None) or (result or {}).get("markdown", "")
        if not md:
            return None

        # Parse sections from markdown
        return parse_firecrawl_markdown(md, urlname)

    except Exception as e:
        log(f"  Firecrawl error for {urlname}: {e}")
        return None


def parse_firecrawl_markdown(md: str, urlname: str) -> dict:
    """
    Extract structured data from Firecrawl markdown of a program detail page.
    Returns a dict in the same shape as the direct API detail response.
    """
    result: dict = {
        "_source": "firecrawl",
        "urlname": urlname,
        "requirement": [],
    }

    # --- Requirements section ---
    req_section = re.search(r"(?:Application Requirements?|Documents? Required?)(.*?)(?:##|\Z)", md, re.DOTALL | re.IGNORECASE)
    if req_section:
        req_text = req_section.group(1)
        reqs = []
        for line in req_text.split("\n"):
            line = line.strip().lstrip("-•*").strip()
            if len(line) > 5:
                reqs.append({"id": 0, "en_name": line, "example": [], "memo": ""})
        result["requirement"] = reqs

    # --- Fees / subsidy section ---
    fee_section = re.search(r"(?:Promotion Materials?|Fees?|Tuition)(.*?)(?:##|\Z)", md, re.DOTALL | re.IGNORECASE)
    if fee_section:
        result["subsidy"] = fee_section.group(1).strip()

    # --- Charges ---
    tuition_match = re.search(r"(?:Tuition|Self-paying)[^\d]*?([\d,]+)\s*(RMB|CNY|¥)", md, re.IGNORECASE)
    if tuition_match:
        result["charges"] = ["--", "--", f"{tuition_match.group(1)} {tuition_match.group(2)}"]

    # --- Duration ---
    duration_match = re.search(r"Duration[:\s]+([\d.]+\s*(?:year|month|week|semester)s?)", md, re.IGNORECASE)
    if duration_match:
        result["education_duration"] = duration_match.group(1).strip()

    return result


# ─── Step 3: Parallel detail fetch with checkpoint ───────────────────────────

def load_checkpoint() -> set[int]:
    """Return set of product IDs already successfully fetched."""
    if not CHECKPOINT_FILE.exists():
        return set()
    try:
        data = json.loads(CHECKPOINT_FILE.read_text(encoding="utf-8"))
        return set(data.get("completed_ids", []))
    except Exception:
        return set()


def save_checkpoint(completed_ids: set[int], enriched: list[dict]):
    """Write checkpoint: completed IDs + current enriched records."""
    CHECKPOINT_FILE.parent.mkdir(parents=True, exist_ok=True)
    CHECKPOINT_FILE.write_text(
        json.dumps(
            {"completed_ids": list(completed_ids), "enriched_count": len(enriched)},
            indent=2,
        ),
        encoding="utf-8",
    )


def enrich_one(
    summary: dict,
    use_firecrawl: bool,
    firecrawl_key: str,
    completed_ids: set[int],
) -> dict:
    """
    Worker function: fetch detail for one product and merge with its summary.
    Thread-safe (no shared mutable state except the read-only sets/config).
    """
    product_id = summary.get("id")
    urlname    = summary.get("urlname", "")

    if product_id in completed_ids:
        # Already fetched in a previous (resumed) run
        return {**summary, "_detail_source": "checkpoint"}

    time.sleep(REQUEST_DELAY)

    # Primary: direct API
    detail = fetch_product_detail(product_id)
    detail_source = "api"

    # Fallback: Firecrawl (only if API returned nothing useful)
    if (detail is None or not detail.get("requirement")) and use_firecrawl and urlname:
        log(f"  API miss for {product_id} ({urlname}) — trying Firecrawl …")
        fc_data = fetch_product_detail_firecrawl(urlname, firecrawl_key)
        if fc_data:
            detail = fc_data
            detail_source = "firecrawl"

    # Merge detail into summary
    enriched = {**summary, "_detail_source": detail_source}
    if detail:
        enriched["detail"] = detail

    return enriched


def enrich_all_products(
    summaries: list[dict],
    resume: bool = False,
    use_firecrawl: bool = False,
    firecrawl_key: str = "",
    workers: int = MAX_WORKERS,
) -> list[dict]:
    """
    Concurrently fetch detail data for all products.
    Checkpoints every 100 records so interrupted runs can resume.
    """
    log(f"\nStep 2 — Fetching detail data for {len(summaries)} programs …")
    log(f"  Workers: {workers}  |  Firecrawl fallback: {'ON' if use_firecrawl else 'OFF'}")

    completed_ids: set[int] = load_checkpoint() if resume else set()
    if completed_ids:
        log(f"  Resuming: {len(completed_ids)} already fetched from checkpoint")

    # Load any previously enriched records from checkpoint output
    enriched_records: list[dict] = []
    checkpoint_records: dict[int, dict] = {}
    if resume and OUTPUT_FILE.exists():
        try:
            prev = json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))
            for rec in prev.get("programs", []):
                pid = rec.get("id")
                if pid:
                    checkpoint_records[pid] = rec
            log(f"  Loaded {len(checkpoint_records)} records from previous output")
        except Exception:
            pass

    pending = [s for s in summaries if s.get("id") not in completed_ids]
    if resume:
        enriched_records = [checkpoint_records[pid] for pid in completed_ids if pid in checkpoint_records]
        log(f"  Pending: {len(pending)} programs to fetch")

    total = len(summaries)
    done_count = len(completed_ids)

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(enrich_one, s, use_firecrawl, firecrawl_key, completed_ids): s
            for s in pending
        }

        for future in as_completed(futures):
            try:
                record = future.result()
                enriched_records.append(record)
                pid = record.get("id")
                if pid:
                    completed_ids.add(pid)
                done_count += 1

                # Progress log every 50 records
                if done_count % 50 == 0 or done_count == total:
                    pct = int(100 * done_count / total)
                    log(f"  Progress: {done_count}/{total} ({pct}%)")

                # Checkpoint every 100 records
                if done_count % 100 == 0:
                    save_checkpoint(completed_ids, enriched_records)
                    _flush_output(enriched_records)

            except Exception as e:
                summary = futures[future]
                log(f"  ERROR enriching {summary.get('id')}: {e}")
                enriched_records.append({**summary, "_detail_source": "error", "_error": str(e)})

    log(f"  Detail fetch complete: {len(enriched_records)} records")
    return enriched_records


# ─── Output helpers ───────────────────────────────────────────────────────────

def _flush_output(records: list[dict], path: Path = OUTPUT_FILE):
    """Write current enriched records to the output file (incremental save)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            {
                "scraped_at": datetime.now(UTC).isoformat(),
                "source": SC_BASE,
                "total_programs": len(records),
                "programs": records,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )


# ─── Statistics ───────────────────────────────────────────────────────────────

def print_summary(records: list[dict]):
    api_hits     = sum(1 for r in records if r.get("_detail_source") == "api")
    fc_hits      = sum(1 for r in records if r.get("_detail_source") == "firecrawl")
    errors       = sum(1 for r in records if r.get("_detail_source") == "error")
    checkpoints  = sum(1 for r in records if r.get("_detail_source") == "checkpoint")
    with_details = sum(1 for r in records if r.get("detail"))
    with_reqs    = sum(1 for r in records if r.get("detail", {}).get("requirement"))

    unis = {r.get("school_name") for r in records if r.get("school_name")}

    log("\n" + "=" * 60)
    log("SCRAPE SUMMARY")
    log("=" * 60)
    log(f"  Total programs      : {len(records)}")
    log(f"  Unique universities : {len(unis)}")
    log(f"  Detail via API      : {api_hits}")
    log(f"  Detail via Firecrawl: {fc_hits}")
    log(f"  Resumed (checkpoint): {checkpoints}")
    log(f"  Errors              : {errors}")
    log(f"  Have detail data    : {with_details}")
    log(f"  Have requirements   : {with_reqs}")
    log("=" * 60)


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Scrape scholarshipchina.com — fetches list + detail for all programs"
    )
    parser.add_argument(
        "--filter-unis",
        type=str,
        default="",
        help='Comma-separated partial university names, e.g. "Tsinghua,Peking,Fudan"',
    )
    parser.add_argument(
        "--max-programs",
        type=int,
        default=0,
        help="Limit total programs fetched from list (0 = all). For testing.",
    )
    parser.add_argument(
        "--use-firecrawl",
        action="store_true",
        help="Enable Firecrawl fallback for records where the direct API returns no detail",
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Resume an interrupted run using the checkpoint file",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=OUTPUT_FILE,
        help="Output JSON file path",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=MAX_WORKERS,
        help=f"Concurrent worker threads (default: {MAX_WORKERS})",
    )
    args = parser.parse_args()
    max_workers = args.workers

    firecrawl_key = os.getenv("FIRECRAWL_API_KEY", "")
    if args.use_firecrawl and not firecrawl_key:
        log("WARNING: --use-firecrawl set but FIRECRAWL_API_KEY not in .env — fallback disabled")
        args.use_firecrawl = False

    filter_unis = [u.strip() for u in args.filter_unis.split(",") if u.strip()] if args.filter_unis else None

    log("=" * 60)
    log("ChinaUniMatch — ScholarshipChina Detail Scraper")
    log("=" * 60)
    log(f"  Mode        : {'RESUME' if args.resume else 'FRESH RUN'}")
    log(f"  Filter unis : {filter_unis or 'ALL'}")
    log(f"  Max programs: {args.max_programs or 'ALL'}")
    log(f"  Firecrawl   : {'ON (fallback)' if args.use_firecrawl else 'OFF'}")
    log(f"  Workers     : {MAX_WORKERS}")
    log("=" * 60)

    # Step 1: product summaries
    summaries = fetch_all_product_summaries(
        max_programs=args.max_programs,
        filter_unis=filter_unis,
    )

    if not summaries:
        log("No products found. Check your --filter-unis spelling or network.")
        return

    # Step 2: enrich with detail data
    enriched = enrich_all_products(
        summaries,
        resume=args.resume,
        use_firecrawl=args.use_firecrawl,
        firecrawl_key=firecrawl_key,
        workers=max_workers,
    )

    # Step 3: final save
    _flush_output(enriched, args.output)
    save_checkpoint({r["id"] for r in enriched if r.get("id")}, enriched)

    print_summary(enriched)
    log(f"\nOutput  -> {args.output}")
    log(f"Next    -> python tools/normalize_program_data.py --input {args.output}")


if __name__ == "__main__":
    main()
