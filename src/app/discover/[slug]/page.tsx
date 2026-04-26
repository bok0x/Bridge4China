import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UniversityDetailClient } from "./UniversityDetailClient";
import type { Metadata } from "next";

export const revalidate = 3600;

async function getUniversityBySlug(slug: string) {
  // Attempt 1: Supabase (production)
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("University")
      .select(
        `id, name, nameZh, slug, city, province, ranking, logoUrl, coverUrl, website, description,
         programs:Program(
           id, programName, degree, teachingLanguage, field, intakeSeason,
           applicationDeadline, originalTuition, tuitionAfterScholarship,
           accommodationFee, requiresPhysicalExam, requiresNonCriminalRecord, requiresEnglishCert,
           scholarships:Scholarship(type, name, coversTuition, livingAllowance)
         )`
      )
      .eq("slug", slug)
      .single();
    if (!error && data) return data;
  } catch {
    // Supabase not configured
  }

  // Attempt 2: /data/universities/{slug}.json (populated by pipeline)
  try {
    const { readFileSync } = await import("fs");
    const { join } = await import("path");
    const file = join(process.cwd(), "data", "universities", `${slug}.json`);
    const raw = JSON.parse(readFileSync(file, "utf-8"));
    return {
      id: raw.universitySlug ?? slug,
      name: raw.universityName ?? slug,
      nameZh: null,
      slug: raw.universitySlug ?? slug,
      city: raw.city ?? "",
      province: raw.province ?? "",
      ranking: raw.arwuWorldRank ? Number(raw.arwuWorldRank) : null,
      logoUrl: null,
      coverUrl: null,
      website: null,
      description: null,
      programs: (raw.programs ?? []).map((p: Record<string, unknown>) => ({
        id: p.id,
        programName: p.programName,
        degree: p.degree,
        teachingLanguage: p.teachingLanguage,
        field: p.field,
        intakeSeason: p.intakeSeason,
        applicationDeadline: p.applicationDeadline ?? null,
        originalTuition: p.originalTuition,
        tuitionAfterScholarship: p.tuitionAfterScholarship ?? null,
        accommodationFee: p.accommodationFee ?? null,
        requiresPhysicalExam: p.requiresPhysicalExam ?? false,
        requiresNonCriminalRecord: p.requiresNonCriminalRecord ?? false,
        requiresEnglishCert: p.requiresEnglishCert ?? false,
        scholarships: (p.scholarships as { type: string; name: string }[] | undefined) ?? [],
      })),
    };
  } catch {
    // University file not found
  }

  return null;
}

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const university = await getUniversityBySlug(params.slug);
  if (!university) return { title: "University Not Found" };
  return { title: university.name };
}

export default async function UniversityDetailPage({ params }: Props) {
  const university = await getUniversityBySlug(params.slug);

  if (!university) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <UniversityDetailClient uni={university as any} />;
}
