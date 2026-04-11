"""
Normalize raw scraped program data into the canonical schema.

Handles two input formats:
  1. Legacy (scrape_scholarshipchina.py): {"api_calls": [...], "schools": [...], "products": [...]}
  2. Enriched (scrape_scholarship_china.py): {"programs": [{...list_data..., "detail": {...}}]}

The enriched format is preferred: it contains the structured requirement[] array and
subsidy HTML from the /api/sc/products/{id} detail endpoint, which resolves the
84% incompleteness caused by missing tuition and document requirement data.

Usage:
    python tools/normalize_program_data.py
    python tools/normalize_program_data.py --input .tmp/raw_programs_detail.json --output .tmp/normalized_programs.json
"""

import json
import argparse
import re
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator, model_validator

INPUT_FILE  = Path(".tmp/raw_programs_detail.json")   # new enriched format (preferred)
LEGACY_FILE = Path(".tmp/raw_scholarshipchina.json")   # old format (fallback)
OUTPUT_FILE = Path(".tmp/normalized_programs.json")
REPORT_FILE = Path(".tmp/validation_report.json")

# Document requirement IDs from the detail API → model field names
REQUIREMENT_ID_MAP: dict[int, str] = {
    1:  "requiresPassportPhoto",
    2:  "requiresPassportId",
    4:  "requiresTranscripts",
    5:  "requiresTranscripts",
    11: "requiresHighestDegree",
    12: "requiresHighestDegree",
    13: "requiresPhysicalExam",
    14: "requiresNonCriminalRecord",
    15: "requiresNonCriminalRecord",
    16: "requiresEnglishCert",
    17: "requiresChineseCert",
    18: "requiresChineseCert",   # HSK cert — treat as Chinese cert
    20: "requiresApplicationForm",
    21: "requiresApplicationForm",
    22: "requiresStudyPlan",
    23: "requiresStudyPlan",
    25: "requiresRecommendations",
    27: "requiresRecommendations",
    28: "requiresRecommendations",
}
TWO_LETTER_IDS = {28}  # IDs that indicate 2 recommendation letters


# ─── Schema ───────────────────────────────────────────────────────────────────

class ScholarshipModel(BaseModel):
    type: str = "UNIVERSITY"  # CSC | PROVINCIAL | UNIVERSITY | SILK_ROAD | OTHER
    name: str = ""
    duration: str = ""
    coversTuition: bool = False
    livingAllowance: Optional[int] = None  # CNY per month
    policyDetails: str = ""


def make_program_id(university_slug: str, program_name: str, degree: str, language: str) -> str:
    """Generate a stable, unique ID for a program using a short MD5 hash."""
    key = f"{university_slug}|{program_name}|{degree}|{language}"
    return hashlib.md5(key.encode("utf-8")).hexdigest()[:16]


class ProgramModel(BaseModel):
    # Identity
    id: str = ""
    universityName: str
    universitySlug: str = ""
    city: str = ""
    province: str = ""

    # Program details
    field: str = ""
    programName: str
    degree: str  # BACHELOR | MASTER | PHD | DIPLOMA
    teachingLanguage: str = "ENGLISH"  # ENGLISH | CHINESE | BILINGUAL
    intakeSeason: str = ""
    applicationDeadline: Optional[str] = None
    programDuration: str = ""
    acceptsMinors: bool = False

    # Fees (CNY per year unless noted)
    originalTuition: int = 0
    tuitionAfterScholarship: Optional[int] = None
    accommodationFee: Optional[int] = None
    registrationFee: Optional[int] = None
    applicationFee: Optional[int] = None
    serviceFee: Optional[int] = None
    feeNotes: str = ""   # raw subsidy text for display

    # Eligibility
    minAge: Optional[int] = None
    maxAge: Optional[int] = None
    locationRestrictions: list[str] = []
    minGpaScore: Optional[float] = None
    minIeltsScore: Optional[float] = None
    minToeflScore: Optional[int] = None

    # Documents (boolean flags — derived from requirement[] array when available)
    requiresPassportPhoto: bool = True
    requiresPassportId: bool = True
    requiresTranscripts: bool = True
    requiresHighestDegree: bool = True
    requiresPhysicalExam: bool = False
    requiresNonCriminalRecord: bool = False
    requiresEnglishCert: bool = False
    requiresChineseCert: bool = False
    requiresApplicationForm: bool = True
    requiresStudyPlan: bool = True
    requiresCV: bool = False
    requiresRecommendations: bool = False
    recommendationLetterCount: int = 0
    requiresPortfolio: bool = False
    rawRequirements: list[str] = []  # human-readable names for UI display

    # Scholarship info
    scholarships: list[ScholarshipModel] = []

    # Meta
    sourceUrl: str = ""
    detailSource: str = ""  # api | firecrawl | legacy
    status: str = "complete"  # complete | incomplete
    missingFields: list[str] = []

    @field_validator("degree")
    @classmethod
    def validate_degree(cls, v):
        # Canonical values must match the TypeScript Degree type exactly
        valid = {"NON_DEGREE", "ASSOCIATE", "BACHELOR", "MASTER", "DOCTORAL", "STUDY_TOUR", "JUNIOR_COLLEGE_UPGRADE", "DIPLOMA"}
        v_upper = v.upper().strip()
        # Map legacy "PHD" to canonical "DOCTORAL"
        if v_upper == "PHD":
            return "DOCTORAL"
        if v_upper in valid:
            return v_upper
        # Fuzzy map
        if "BACH" in v_upper or "BSC" in v_upper or "B.A" in v_upper:
            return "BACHELOR"
        if "MAST" in v_upper or "MSC" in v_upper or "MBA" in v_upper:
            return "MASTER"
        if "PHD" in v_upper or "DOCT" in v_upper:
            return "DOCTORAL"
        if "DIPL" in v_upper or "CERT" in v_upper:
            return "DIPLOMA"
        return "BACHELOR"  # default fallback

    @field_validator("teachingLanguage")
    @classmethod
    def validate_language(cls, v):
        v_upper = v.upper().strip()
        if "CHIN" in v_upper and "ENG" in v_upper:
            return "BILINGUAL"
        if "CHIN" in v_upper:
            return "CHINESE"
        return "ENGLISH"

    @model_validator(mode="after")
    def check_required_fields(self):
        missing = []
        if not self.programName:
            missing.append("programName")
        if not self.universityName:
            missing.append("universityName")
        if self.originalTuition == 0:
            missing.append("originalTuition")
        if not self.teachingLanguage:
            missing.append("teachingLanguage")
        if missing:
            self.missingFields = missing
            self.status = "incomplete"
        return self


# ─── Parsers ──────────────────────────────────────────────────────────────────

# Values that mean "no data" in the API — treat as empty string
_EMPTY_VALUES = {"--", "-", "n/a", "N/A", "null", "none", "0", ""}


def fee_val(v) -> str:
    """
    Return a clean string for fee parsing, or '' if the value is a placeholder.
    The istudyedu API uses '--' extensively to mean "not applicable".
    """
    if v is None:
        return ""
    s = str(v).strip()
    return "" if s in _EMPTY_VALUES else s


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def parse_cny_amount(text: str) -> Optional[int]:
    """Extract a CNY integer from strings like 'CNY 25,000/year' or '¥25000'."""
    if not text:
        return None
    # Remove currency symbols and normalize
    clean = re.sub(r"[¥CNYcny,RMBrmb\s]", "", text)
    # Find a number
    m = re.search(r"(\d+(?:\.\d+)?)", clean)
    if m:
        return int(float(m.group(1)))
    return None


def parse_deadline(text: str) -> Optional[str]:
    """Parse a deadline string into ISO date or None."""
    if not text:
        return None
    # Try common date patterns
    patterns = [
        r"(\d{4}[-/]\d{1,2}[-/]\d{1,2})",
        r"(\d{1,2}[-/]\d{1,2}[-/]\d{4})",
        r"(\w+ \d{1,2},?\s*\d{4})",
        r"(\d{1,2}\s+\w+\s+\d{4})",
    ]
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            return m.group(1)
    return None


def parse_scholarship_type(text: str) -> str:
    t = text.upper()
    if "CSC" in t or "CHINESE GOVERNMENT" in t:
        return "CSC"
    if "SILK" in t or "ROAD" in t:
        return "SILK_ROAD"
    if "PROVINCE" in t or "PROVINCIAL" in t:
        return "PROVINCIAL"
    if "UNIVERSITY" in t or "COLLEGE" in t or "INSTITUTE" in t:
        return "UNIVERSITY"
    return "OTHER"


def parse_requirements_from_array(requirement_list: list[dict]) -> dict:
    """
    Parse the structured requirement[] array from the detail API.
    This is the authoritative source — far more accurate than text parsing.

    Each item: {"id": int, "en_name": str, "example": [...], "memo": str}
    """
    flags = {
        "requiresPassportPhoto":   False,
        "requiresPassportId":      False,
        "requiresTranscripts":     False,
        "requiresHighestDegree":   False,
        "requiresPhysicalExam":    False,
        "requiresNonCriminalRecord": False,
        "requiresEnglishCert":     False,
        "requiresChineseCert":     False,
        "requiresApplicationForm": False,
        "requiresStudyPlan":       False,
        "requiresCV":              False,
        "requiresRecommendations": False,
        "recommendationLetterCount": 0,
        "requiresPortfolio":       False,
        "rawRequirements":         [],
    }

    if not requirement_list:
        return flags

    for req in requirement_list:
        req_id   = req.get("id", 0)
        req_name = req.get("en_name", "")

        flags["rawRequirements"].append(req_name)

        field = REQUIREMENT_ID_MAP.get(req_id)
        if field:
            flags[field] = True
            if req_id in TWO_LETTER_IDS:
                flags["recommendationLetterCount"] = 2
            elif field == "requiresRecommendations" and flags["recommendationLetterCount"] == 0:
                flags["recommendationLetterCount"] = 1
        else:
            # Unknown ID: fall back to name-based detection
            name_lower = req_name.lower()
            if "passport photo" in name_lower or "photo" in name_lower:
                flags["requiresPassportPhoto"] = True
            if "passport" in name_lower and ("id" in name_lower or "page" in name_lower or "copy" in name_lower):
                flags["requiresPassportId"] = True
            if "transcript" in name_lower or "academic record" in name_lower:
                flags["requiresTranscripts"] = True
            if "degree" in name_lower or "diploma" in name_lower:
                flags["requiresHighestDegree"] = True
            if "physical" in name_lower or "medical" in name_lower or "health" in name_lower:
                flags["requiresPhysicalExam"] = True
            if "criminal" in name_lower or "police" in name_lower:
                flags["requiresNonCriminalRecord"] = True
            if "english" in name_lower and ("proficiency" in name_lower or "ielts" in name_lower or "toefl" in name_lower):
                flags["requiresEnglishCert"] = True
            if "hsk" in name_lower or "chinese proficiency" in name_lower:
                flags["requiresChineseCert"] = True
            if "application form" in name_lower or "admission form" in name_lower:
                flags["requiresApplicationForm"] = True
            if "study plan" in name_lower or "personal statement" in name_lower or "motivation" in name_lower:
                flags["requiresStudyPlan"] = True
            if "recommendation" in name_lower or "reference letter" in name_lower:
                flags["requiresRecommendations"] = True
                if "two" in name_lower or "2" in name_lower:
                    flags["recommendationLetterCount"] = 2
                elif flags["recommendationLetterCount"] == 0:
                    flags["recommendationLetterCount"] = 1
            if ("cv" == name_lower.strip() or "curriculum vitae" in name_lower or
                    "resume" in name_lower or "self-introduction" in name_lower):
                flags["requiresCV"] = True
            if "portfolio" in name_lower or "artwork" in name_lower:
                flags["requiresPortfolio"] = True

    return flags


def detect_document_requirements(text: str) -> dict:
    """
    Fallback: detect document requirements from free text (used for legacy records
    without the structured requirement[] array).
    """
    t = text.lower()
    count = 2 if ("two recommendation" in t or "2 recommendation" in t) else (1 if "recommendation" in t else 0)
    return {
        "requiresPassportPhoto":    "passport photo" in t or "recent photo" in t,
        "requiresPassportId":       "passport" in t and ("copy" in t or "page" in t or "scan" in t),
        "requiresTranscripts":      "transcript" in t or "academic record" in t,
        "requiresHighestDegree":    "degree" in t and ("certif" in t or "diploma" in t or "notariz" in t),
        "requiresPhysicalExam":     "physical exam" in t or "medical" in t or "health exam" in t,
        "requiresNonCriminalRecord":"criminal" in t or "police" in t or "no criminal" in t,
        "requiresEnglishCert":      "ielts" in t or "toefl" in t or "english proficiency" in t or "language cert" in t,
        "requiresChineseCert":      "hsk" in t or "chinese proficiency" in t,
        "requiresApplicationForm":  "application form" in t or "admission form" in t,
        "requiresStudyPlan":        "study plan" in t or "personal statement" in t or "motivation" in t,
        "requiresCV":               "curriculum vitae" in t or " cv " in t or "resume" in t,
        "requiresRecommendations":  "recommendation" in t or "reference letter" in t,
        "recommendationLetterCount": count,
        "requiresPortfolio":        "portfolio" in t or "artwork" in t,
        "rawRequirements":          [],
    }


def parse_subsidy_html(html: str) -> dict:
    """
    Extract structured fee info from the subsidy HTML field returned by the detail API.
    Returns partial fee fields to merge into the normalized record.
    """
    if not html:
        return {}

    # Strip HTML tags to get plain text
    plain = re.sub(r"<[^>]+>", " ", html)
    plain = re.sub(r"&nbsp;", " ", plain)
    plain = re.sub(r"\s+", " ", plain).strip()

    fees: dict = {"feeNotes": plain[:500]}  # store first 500 chars for display

    # Registration fee
    reg_match = re.search(r"[Rr]egistration\s+fee[:\s]*([0-9,]+)\s*(RMB|CNY|¥)?", plain)
    if reg_match:
        fees["registrationFee"] = int(reg_match.group(1).replace(",", ""))

    # Application fee
    app_match = re.search(r"[Aa]pplication\s+fee[:\s]*([0-9,]+)\s*(RMB|CNY|¥)?", plain)
    if app_match:
        fees["applicationFee"] = int(app_match.group(1).replace(",", ""))

    # Service fee
    svc_match = re.search(r"[Ss]ervice\s+fee[:\s]*([0-9,]+)\s*(RMB|CNY|¥)?", plain)
    if svc_match:
        fees["serviceFee"] = int(svc_match.group(1).replace(",", ""))

    return fees


def normalize_record(raw: dict) -> Optional[dict]:
    """
    Convert a raw scraped record to the normalized Program schema.

    Handles three input shapes:
      A) Enriched new format:  {id, school_name, subject, ..., detail: {requirement[], subsidy, ...}}
      B) Legacy wrapped format: {api_data: {...}}
      C) Legacy direct format:  flat product dict (no detail key)
    """
    # ── Detect format and unwrap ────────────────────────────────────────────────
    detail_data   = raw.get("detail") or {}          # enriched format (A)
    detail_source = raw.get("_detail_source", "legacy")
    api = raw.get("api_data", raw)                   # handles B and C

    # In the enriched format (A), list-level fields are at the top level
    # In the detail API response, some field names differ (e.g. "school" vs "school_name")
    detail_school = detail_data.get("school") or detail_data.get("school_name") or ""

    # ── University name ─────────────────────────────────────────────────────────
    university_name = (
        api.get("school_name") or          # list API
        detail_school or                   # detail API
        api.get("en_name") or
        api.get("university_name") or
        api.get("universityName") or
        raw.get("universityName") or
        extract_from_raw_text(raw.get("raw_text", ""), "university")
    )

    # ── Program name ────────────────────────────────────────────────────────────
    program_name = (
        api.get("en_name") or              # list API (en_name = program title)
        api.get("subject") or
        detail_data.get("en_name") or
        api.get("program_name") or
        api.get("programName") or
        raw.get("programName") or
        extract_from_raw_text(raw.get("raw_text", ""), "program")
    )

    if not university_name or not program_name:
        return None

    # ── Degree ──────────────────────────────────────────────────────────────────
    degree_raw = (
        api.get("education") or
        detail_data.get("education") or
        api.get("degree") or
        raw.get("degree") or
        "BACHELOR"
    )

    # ── Language ────────────────────────────────────────────────────────────────
    language_raw = (
        api.get("language") or
        detail_data.get("language") or
        api.get("teaching_language") or
        raw.get("teachingLanguage") or
        "English"
    )

    # ── Duration ────────────────────────────────────────────────────────────────
    duration = (
        detail_data.get("education_duration") or
        api.get("duration") or
        raw.get("programDuration") or
        ""
    )

    # ── Tuition ─────────────────────────────────────────────────────────────────
    #
    # charges[] layout differs between list API and detail API:
    #   List API:   [original_tuition, after_scholarship, self_pay]   (3 elements, '--' = N/A)
    #   Detail API: [original_tuition, after_scholarship]             (2 elements, scholarship programs)
    #               [original_tuition, after_scholarship, self_pay]   (3 elements, self-financed)
    #
    # For scholarship programs:  original_tuition is in charges[0] or tuition_fee
    # For self-financed programs: self_pay is in self_tuition_fee or charges[2]
    #
    # fee_val() strips '--' (which is truthy but means "no data")

    list_charges  = [fee_val(c) for c in (api.get("charges") or [])]
    det_charges   = [fee_val(c) for c in (detail_data.get("charges") or [])]

    # self-financed tuition (paid by student)
    self_pay_str = (
        fee_val(api.get("self_tuition_fee")) or
        # list charges[2] = self_pay slot
        (list_charges[2] if len(list_charges) > 2 else "") or
        # detail charges[2] if 3 elements
        (det_charges[2] if len(det_charges) > 2 else "")
    )

    # scholarship/original tuition
    original_str = (
        fee_val(api.get("tuition_fee")) or
        # list charges[0] = original tuition
        (list_charges[0] if list_charges else "") or
        # detail charges[0]
        (det_charges[0] if det_charges else "") or
        fee_val(api.get("tuition"))
    )

    # Use self_pay if available, otherwise original (covers both program types)
    tuition_str = self_pay_str or original_str
    tuition = parse_cny_amount(tuition_str) or 0

    # Tuition after scholarship (what the student actually pays under scholarship)
    after_scholarship_str = (
        fee_val(api.get("tuition_last_fee")) or
        fee_val(detail_data.get("tuition_last_fee")) or
        (list_charges[1] if len(list_charges) > 1 else "") or
        (det_charges[1] if len(det_charges) > 1 else "")
    )
    tuition_after = parse_cny_amount(after_scholarship_str) if after_scholarship_str else None
    # A "0" after-scholarship means fully covered — keep it as 0, not None
    if tuition_after is None and after_scholarship_str in ("0", "0.00", "0.00RMB/year"):
        tuition_after = 0

    # ── Accommodation ───────────────────────────────────────────────────────────
    room_fee_str = (
        fee_val(api.get("single_room_fee")) or
        fee_val(api.get("double_room_fee")) or
        fee_val(api.get("room_fee")) or
        fee_val(api.get("scholarship_room_fee")) or
        ""
    )

    # ── Scholarship ─────────────────────────────────────────────────────────────
    scholarship_type_raw = (
        detail_data.get("scholarship") or      # detail API uses "scholarship"
        api.get("scholarship_type") or
        api.get("scholarship_str") or
        raw.get("scholarshipType") or
        ""
    )
    scholarship_policy = detail_data.get("scholarship_policy") or ""
    scholarship = None
    if scholarship_type_raw and scholarship_type_raw.lower() not in ("self-financed", "self-paying", ""):
        scholarship = ScholarshipModel(
            type=parse_scholarship_type(scholarship_type_raw),
            name=scholarship_type_raw,
            coversTuition=(
                "free tuition" in scholarship_type_raw.lower() or
                "full scholarship" in scholarship_type_raw.lower() or
                "tuition waived" in scholarship_policy.lower()
            ),
            livingAllowance=api.get("living_allowance"),
            policyDetails=scholarship_policy[:500],
        )

    # ── Deadline ────────────────────────────────────────────────────────────────
    deadline_str = (
        api.get("end_at") or
        detail_data.get("end_at") or
        api.get("deadline_date") or
        api.get("deadline") or
        raw.get("applicationDeadline") or
        ""
    )
    if isinstance(deadline_str, bool):
        deadline_str = ""

    # ── Minors ──────────────────────────────────────────────────────────────────
    accepts_minors = bool(api.get("is_accept_minors") or detail_data.get("is_accept_minors") or 0)

    # ── Document requirements ────────────────────────────────────────────────────
    # Priority: structured requirement[] from detail API → fallback text parsing
    requirement_list = detail_data.get("requirement") or []
    if requirement_list:
        doc_flags = parse_requirements_from_array(requirement_list)
    else:
        docs_text = raw.get("documents_raw", "") + raw.get("raw_text", "")
        doc_flags = detect_document_requirements(docs_text)

    # ── Subsidy / fee notes ──────────────────────────────────────────────────────
    subsidy_html = detail_data.get("subsidy") or ""
    subsidy_fees = parse_subsidy_html(subsidy_html)

    # ── Source URL ───────────────────────────────────────────────────────────────
    urlname = api.get("urlname") or detail_data.get("urlname") or ""
    source_url = (
        f"https://www.scholarshipchina.com/programs/{urlname}" if urlname else
        raw.get("detail_url") or raw.get("source") or ""
    )

    # ── Assemble ─────────────────────────────────────────────────────────────────
    uni_slug = slugify(university_name)
    data = {
        "id":                    make_program_id(uni_slug, program_name, degree_raw or "BACHELOR", language_raw),
        "universityName":        university_name,
        "universitySlug":        uni_slug,
        "city":                  api.get("city") or detail_data.get("city") or raw.get("city") or "",
        "province":              api.get("province") or detail_data.get("province") or raw.get("province") or "",
        "field":                 api.get("subject") or api.get("field") or raw.get("field") or "",
        "programName":           program_name,
        "degree":                degree_raw or "BACHELOR",
        "teachingLanguage":      language_raw,
        "acceptsMinors":         accepts_minors,
        "intakeSeason":          (
            api.get("arrival_season") or detail_data.get("arrival_season") or
            api.get("intake_season") or raw.get("intakeSeason") or "September"
        ),
        "applicationDeadline":   parse_deadline(str(deadline_str)) if deadline_str else None,
        "programDuration":       duration,
        "originalTuition":       tuition,
        "tuitionAfterScholarship": tuition_after if tuition > 0 else None,
        "accommodationFee":      parse_cny_amount(str(room_fee_str)) if room_fee_str else None,
        "registrationFee":       (
            subsidy_fees.get("registrationFee") or
            parse_cny_amount(str(api.get("registration_fee") or ""))
        ),
        "applicationFee":        (
            subsidy_fees.get("applicationFee") or
            parse_cny_amount(str(api.get("application_fee") or ""))
        ),
        "serviceFee":            (
            subsidy_fees.get("serviceFee") or
            parse_cny_amount(str(api.get("service_fee") or ""))
        ),
        "feeNotes":              subsidy_fees.get("feeNotes", ""),
        "scholarships":          [scholarship.model_dump()] if scholarship else [],
        "sourceUrl":             source_url,
        "detailSource":          detail_source,
        **doc_flags,
    }

    try:
        model = ProgramModel(**data)
        return model.model_dump()
    except Exception as e:
        return {**data, "status": "error", "error": str(e)}


def extract_from_raw_text(text: str, field: str) -> str:
    """Fallback: extract university or program name from raw text."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        return ""
    if field == "university":
        for line in lines:
            if any(k in line.lower() for k in ["university", "college", "institute", "academy"]):
                return line[:100]
    return lines[0][:100] if lines else ""


# ─── Main ─────────────────────────────────────────────────────────────────────

def main(input_file: Path = INPUT_FILE, output_file: Path = OUTPUT_FILE):
    # Auto-fallback: if the preferred enriched file doesn't exist, try the legacy file
    if not input_file.exists():
        if input_file == INPUT_FILE and LEGACY_FILE.exists():
            print(f"[INFO] {INPUT_FILE} not found — falling back to legacy {LEGACY_FILE}")
            input_file = LEGACY_FILE
        else:
            print(f"[ERROR] Input file not found: {input_file}")
            print("  Run tools/scrape_scholarship_china.py first.")
            return

    raw_data = json.loads(input_file.read_text(encoding="utf-8"))

    # ── Detect format ──────────────────────────────────────────────────────────
    if isinstance(raw_data, list):
        # Pure list of records
        all_records = raw_data
        print(f"Input format: list — {len(all_records)} records")

    elif "programs" in raw_data and raw_data["programs"] and "detail" in (raw_data["programs"][0] or {}):
        # New enriched format from scrape_scholarship_china.py
        all_records = raw_data["programs"]
        print(f"Input format: enriched detail — {len(all_records)} records")

    elif "programs" in raw_data or "api_calls" in raw_data:
        # Legacy format from scrape_scholarshipchina.py
        api_calls = raw_data.get("api_calls", [])
        api_program_data: list[dict] = []
        for call in api_calls:
            data = call.get("data", {})
            if isinstance(data, list):
                api_program_data.extend(data)
            elif isinstance(data, dict):
                items = (
                    data.get("data") or data.get("list") or
                    data.get("items") or data.get("records") or []
                )
                if isinstance(items, list):
                    api_program_data.extend(items)

        if api_program_data:
            all_records = [{"api_data": item, "raw_text": "", "source": BASE_URL} for item in api_program_data]
        else:
            all_records = raw_data.get("programs", [])
        print(f"Input format: legacy — {len(all_records)} records (from {len(api_calls)} api_calls)")

    else:
        all_records = []
        print("[WARN] Unrecognized input format — 0 records found")

    normalized: list[dict] = []
    skipped: list[dict] = []
    errors: list[dict] = []

    for rec in all_records:
        try:
            result = normalize_record(rec)
            if result is None:
                skipped.append({"reason": "missing university or program name", "raw": str(rec)[:200]})
            elif result.get("status") == "incomplete":
                normalized.append(result)
            elif result.get("status") == "error":
                errors.append(result)
            else:
                normalized.append(result)
        except Exception as e:
            errors.append({"error": str(e), "raw": str(rec)[:200]})

    # Save normalized output
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(json.dumps(normalized, indent=2, ensure_ascii=False), encoding="utf-8")

    # Save validation report
    report = {
        "run_at": datetime.utcnow().isoformat(),
        "total_input": len(all_records),
        "normalized": len([r for r in normalized if r.get("status") != "incomplete"]),
        "incomplete": len([r for r in normalized if r.get("status") == "incomplete"]),
        "skipped": len(skipped),
        "errors": len(errors),
        "skip_details": skipped,
        "error_details": errors,
    }
    REPORT_FILE.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"\nDone. Normalized: {report['normalized']} complete, {report['incomplete']} incomplete, {report['skipped']} skipped, {report['errors']} errors")
    print(f"  Output -> {output_file}")
    print(f"  Report -> {REPORT_FILE}")


BASE_URL = "https://www.scholarshipchina.com"

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Normalize raw scraped program data")
    parser.add_argument("--input", type=Path, default=INPUT_FILE)
    parser.add_argument("--output", type=Path, default=OUTPUT_FILE)
    args = parser.parse_args()
    main(args.input, args.output)
