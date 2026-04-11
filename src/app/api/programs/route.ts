import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROGRAMS } from "@/lib/mock-programs";
import type { Program } from "@/types";

/**
 * Normalize a flat JSON record (from the data pipeline) into the nested Program
 * shape the rest of the app expects.
 *
 * The pipeline outputs flat fields like `universityName`, `city`, `province` at
 * the top level, but all components and filter logic read from `p.university.name`,
 * `p.university.city`, etc. This function bridges that gap so both the Supabase
 * path (which already returns nested data) and the JSON-file fallback work the
 * same way.
 */
function normalizeJsonProgram(p: Record<string, unknown>): Program {
  // If already has a nested university object, it came from Supabase — pass through
  if (p.university && typeof p.university === "object") {
    return p as unknown as Program;
  }

  const universitySlug = (p.universitySlug as string) ?? "";
  const universityName = (p.universityName as string) ?? "";
  const city = (p.city as string) ?? "";
  const province = (p.province as string) ?? "";

  return {
    ...(p as unknown as Program),
    university: {
      id: universitySlug,
      name: universityName,
      slug: universitySlug,
      city,
      province,
      ranking: null,
      logoUrl: null,
      coverUrl: null,
      website: null,
      description: null,
    },
  };
}

// Try Supabase first, fall back to data files, then mock programs
async function getAllPrograms(): Promise<Program[]> {
  // Attempt 1: Supabase
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("Program")
      .select(
        `id, universityId, field, programName, programCode, degree, teachingLanguage,
         intakeSeason, intakeYear, applicationDeadline, programDuration,
         originalTuition, tuitionAfterScholarship,
         accommodationFee, accommodationSingleFee, accommodationDoubleFee,
         registrationFee, applicationFee, serviceFee,
         minAge, maxAge, acceptsMinors, locationRestrictions,
         minGpaScore, minIeltsScore, minToeflScore, hasCscaScore,
         requiresPassportPhoto, requiresPassportId, requiresTranscripts,
         requiresHighestDegree, requiresPhysicalExam, requiresNonCriminalRecord,
         requiresEnglishCert, requiresApplicationForm, requiresStudyPlan,
         requiresRecommendations, recommendationLetterCount,
         university:University(id, name, nameZh, slug, city, province, ranking, logoUrl, coverUrl, website, description),
         scholarships:Scholarship(id, programId, type, name, category, duration, coversTuition, livingAllowance, policyDetails)`
      )
      .order("programName")
      .limit(500);
    if (!error && data && data.length > 0) {
      return data as unknown as Program[];
    }
  } catch {
    // Supabase not configured — continue to fallbacks
  }

  // Attempt 2: /data/programs/all_programs.json (populated after pipeline run)
  try {
    const { readFileSync } = await import("fs");
    const { join } = await import("path");
    const file = join(process.cwd(), "data", "programs", "all_programs.json");
    const raw = readFileSync(file, "utf-8");
    const parsed = JSON.parse(raw);
    const items = (parsed.programs ?? parsed) as Record<string, unknown>[];
    if (items.length > 0) {
      return items.map(normalizeJsonProgram);
    }
  } catch {
    // Data pipeline not run yet — use mock data
  }

  // Fallback: hardcoded mock programs
  return MOCK_PROGRAMS;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const search        = searchParams.get("search")?.toLowerCase() ?? "";
  const degree        = searchParams.get("degree") ?? "";
  const language      = searchParams.get("language") ?? "";
  const field         = searchParams.get("field")?.toLowerCase() ?? "";
  const province      = searchParams.get("province")?.toLowerCase() ?? "";
  const city          = searchParams.get("city")?.toLowerCase() ?? "";
  const universityName = searchParams.get("universityName")?.toLowerCase() ?? "";
  const intakeSeason  = searchParams.get("intakeSeason")?.toLowerCase() ?? "";
  const acceptsMinors = searchParams.get("acceptsMinors");
  const hasCscaScore  = searchParams.get("hasCscaScore");
  const hasScholarship = searchParams.get("hasScholarship") === "true";
  const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "24"));

  const allPrograms = await getAllPrograms();

  const filtered = allPrograms.filter((p) => {
    // university object is guaranteed by normalizeJsonProgram
    const uName = (p.university?.name ?? "").toLowerCase();
    const uCity = (p.university?.city ?? "").toLowerCase();
    const uProv = (p.university?.province ?? "").toLowerCase();

    if (search && !p.programName?.toLowerCase().includes(search) &&
        !p.field?.toLowerCase().includes(search) && !uName.includes(search)) return false;
    if (degree && p.degree !== degree) return false;
    if (language && p.teachingLanguage !== language) return false;
    if (field && !p.field?.toLowerCase().includes(field)) return false;
    if (province && !uProv.includes(province)) return false;
    if (city && !uCity.includes(city)) return false;
    if (universityName && !uName.includes(universityName)) return false;
    if (intakeSeason && p.intakeSeason?.toLowerCase() !== intakeSeason) return false;
    if (acceptsMinors === "true" && !p.acceptsMinors) return false;
    if (acceptsMinors === "false" && p.acceptsMinors) return false;
    if (hasCscaScore === "true" && !p.hasCscaScore) return false;
    if (hasCscaScore === "false" && p.hasCscaScore) return false;
    if (hasScholarship && (p.scholarships?.length ?? 0) === 0) return false;
    return true;
  });

  const total = filtered.length;
  const from = (page - 1) * limit;
  const programs = filtered.slice(from, from + limit);

  return NextResponse.json({ programs, total, page, limit });
}
