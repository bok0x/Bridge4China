import { NextRequest, NextResponse } from "next/server";
import { MOCK_PROGRAMS } from "@/lib/mock-programs";
import type { Program } from "@/types";

function normalizeJsonProgram(p: Record<string, unknown>): Program {
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

async function loadDataPrograms(): Promise<Program[] | null> {
  try {
    const { readFileSync } = await import("fs");
    const { join } = await import("path");
    const file = join(process.cwd(), "data", "programs", "all_programs.json");
    const raw = readFileSync(file, "utf-8");
    const parsed = JSON.parse(raw);
    const items = (parsed.programs ?? parsed) as Record<string, unknown>[];
    return items.length > 0 ? items.map(normalizeJsonProgram) : null;
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const allPrograms: Program[] = (await loadDataPrograms()) ?? MOCK_PROGRAMS;
  const program = allPrograms.find((p) => p.id === id) ?? null;

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  return NextResponse.json(program);
}
