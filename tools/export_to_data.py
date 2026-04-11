"""
Export normalized program data to the /data/ folder (the WAT "Source of Truth" store).

Reads: .tmp/normalized_programs.json  (output of normalize_program_data.py)
Writes:
  data/universities/<slug>.json    — one file per university with all its programs
  data/programs/all_programs.json  — flat list of every program

Run the full pipeline:
    python tools/scrape_scholarshipchina.py
    python tools/normalize_program_data.py
    python tools/export_to_data.py

Usage:
    python tools/export_to_data.py
    python tools/export_to_data.py --input .tmp/normalized_programs.json --data-dir data/
"""

import json
import argparse
import hashlib
from pathlib import Path
from datetime import datetime


def ensure_program_id(prog: dict) -> str:
    """Return existing id or generate a stable one from key program fields."""
    if prog.get("id"):
        return prog["id"]
    key = "|".join([
        prog.get("universitySlug", ""),
        prog.get("programName", ""),
        prog.get("degree", ""),
        prog.get("teachingLanguage", ""),
    ])
    return hashlib.md5(key.encode("utf-8")).hexdigest()[:16]


INPUT_FILE = Path(".tmp/normalized_programs.json")
DATA_DIR = Path("data")


def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def merge_rankings(programs: list[dict], rankings_dir: Path) -> dict[str, dict]:
    """
    Load the latest ARWU ranking file and build a lookup by normalized university name.
    Returns {universitySlug: {worldRank, nationalRank, totalScore}}.
    """
    ranking_lookup: dict[str, dict] = {}

    if not rankings_dir.exists():
        return ranking_lookup

    # Find the most recent ARWU file
    arwu_files = sorted(rankings_dir.glob("arwu_*.json"), reverse=True)
    if not arwu_files:
        return ranking_lookup

    latest = arwu_files[0]
    log(f"  Merging rankings from: {latest.name}")
    try:
        data = json.loads(latest.read_text(encoding="utf-8"))
        for u in data.get("universities", []):
            name = u.get("universityName", "").lower().strip()
            slug = name.replace(" ", "-").replace("'", "").replace(",", "")
            if slug:
                ranking_lookup[slug] = {
                    "arwuWorldRank": u.get("worldRank", ""),
                    "arwuNationalRank": u.get("nationalRank", ""),
                    "arwuTotalScore": u.get("totalScore", ""),
                    "arwuYear": data.get("year", ""),
                }
    except Exception as e:
        log(f"  Warning: could not merge rankings: {e}")

    return ranking_lookup


def main(input_file: Path = INPUT_FILE, data_dir: Path = DATA_DIR):
    if not input_file.exists():
        print(f"[ERROR] Input not found: {input_file}")
        print("  Run tools/normalize_program_data.py first.")
        return

    programs: list[dict] = json.loads(input_file.read_text(encoding="utf-8"))
    log(f"Loaded {len(programs)} programs from {input_file}")

    # Create output directories
    uni_dir = data_dir / "universities"
    prog_dir = data_dir / "programs"
    rankings_dir = data_dir / "rankings"
    uni_dir.mkdir(parents=True, exist_ok=True)
    prog_dir.mkdir(parents=True, exist_ok=True)
    rankings_dir.mkdir(parents=True, exist_ok=True)

    # Load ranking enrichment data (if available)
    ranking_lookup = merge_rankings(programs, rankings_dir)

    # ── Ensure every program has a stable id and deduplicate ─────────────────
    seen_ids: set[str] = set()
    deduped: list[dict] = []
    for prog in programs:
        prog["id"] = ensure_program_id(prog)
        if prog["id"] not in seen_ids:
            seen_ids.add(prog["id"])
            deduped.append(prog)
    if len(deduped) < len(programs):
        log(f"  Deduplication: removed {len(programs) - len(deduped)} exact duplicate(s)")
    programs = deduped

    # ── Group programs by university slug ─────────────────────────────────────
    by_university: dict[str, list[dict]] = {}
    for prog in programs:
        slug = prog.get("universitySlug") or "unknown"
        by_university.setdefault(slug, []).append(prog)

    # ── Write one JSON file per university ────────────────────────────────────
    written_unis = 0
    for slug, uni_programs in by_university.items():
        first = uni_programs[0]
        uni_file = uni_dir / f"{slug}.json"

        # Enrich with ARWU ranking if available
        ranking_data = ranking_lookup.get(slug, {})

        university_doc = {
            "universityName": first.get("universityName", slug),
            "universitySlug": slug,
            "city": first.get("city", ""),
            "province": first.get("province", ""),
            "programCount": len(uni_programs),
            # Ranking fields — populated if ARWU data exists
            "arwuWorldRank": ranking_data.get("arwuWorldRank", ""),
            "arwuNationalRank": ranking_data.get("arwuNationalRank", ""),
            "arwuTotalScore": ranking_data.get("arwuTotalScore", ""),
            "arwuYear": ranking_data.get("arwuYear", ""),
            "exportedAt": datetime.utcnow().isoformat(),
            "programs": uni_programs,
        }

        uni_file.write_text(
            json.dumps(university_doc, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        written_unis += 1

    log(f"Wrote {written_unis} university files → {uni_dir}/")

    # ── Write flat all_programs.json ──────────────────────────────────────────
    all_prog_file = prog_dir / "all_programs.json"
    all_prog_file.write_text(
        json.dumps(
            {
                "exportedAt": datetime.utcnow().isoformat(),
                "total": len(programs),
                "programs": programs,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    log(f"Wrote {len(programs)} programs → {all_prog_file}")

    # ── Write compact search index for client-side filtering ──────────────────
    # This file is served as a static asset from /public/ so the browser can
    # download it once and do all filtering in-browser without API round-trips.
    # Only includes the fields needed for cards, filters, and search.
    public_dir = Path("public")
    public_dir.mkdir(parents=True, exist_ok=True)
    index_file = public_dir / "programs-index.json"

    compact = []
    for p in programs:
        scholarships = p.get("scholarships") or []
        compact.append({
            "id":                      p.get("id", ""),
            "universityName":          p.get("universityName", ""),
            "universitySlug":          p.get("universitySlug", ""),
            "city":                    p.get("city", ""),
            "province":                p.get("province", ""),
            "programName":             p.get("programName", ""),
            "field":                   p.get("field", ""),
            "degree":                  p.get("degree", ""),
            "teachingLanguage":        p.get("teachingLanguage", ""),
            "intakeSeason":            p.get("intakeSeason", ""),
            "applicationDeadline":     p.get("applicationDeadline"),
            "programDuration":         p.get("programDuration", ""),
            "originalTuition":         p.get("originalTuition", 0),
            "tuitionAfterScholarship": p.get("tuitionAfterScholarship"),
            "accommodationFee":        p.get("accommodationFee"),
            "acceptsMinors":           p.get("acceptsMinors", False),
            "hasCscaScore":            p.get("hasCscaScore", False),
            "scholarships": [
                {"type": s.get("type", ""), "name": s.get("name", "")}
                for s in scholarships
            ],
        })

    index_file.write_text(
        json.dumps({"generatedAt": datetime.utcnow().isoformat(), "total": len(compact), "programs": compact},
                   ensure_ascii=False, separators=(",", ":")),  # minified
        encoding="utf-8",
    )
    log(f"Wrote compact search index ({len(compact)} programs) → {index_file}")

    # ── Summary ───────────────────────────────────────────────────────────────
    complete = sum(1 for p in programs if p.get("status") == "complete")
    incomplete = sum(1 for p in programs if p.get("status") == "incomplete")
    log(f"\n/data/ is ready.")
    log(f"  Universities: {written_unis}")
    log(f"  Programs:     {len(programs)} total ({complete} complete, {incomplete} incomplete)")
    if ranking_lookup:
        matched = sum(1 for s in by_university if s in ranking_lookup)
        log(f"  ARWU ranks merged for {matched}/{written_unis} universities")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export normalized program data to /data/ folder")
    parser.add_argument("--input", type=Path, default=INPUT_FILE, help="Normalized programs JSON")
    parser.add_argument("--data-dir", type=Path, default=DATA_DIR, help="Output data directory")
    args = parser.parse_args()

    main(args.input, args.data_dir)
