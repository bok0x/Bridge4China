import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { scoreSession, SessionAnswer } from "@/app/iq-test/iqTestData";

export async function POST(req: NextRequest) {
  const body = await req.json() as { sessionId: string; answers: SessionAnswer[] };
  const { sessionId, answers } = body;

  if (!sessionId || !Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const scores = scoreSession(answers);

  const result = await prisma.iqResult.create({
    data: {
      userId: user?.id ?? null,
      sessionId,
      iqScore: scores.iq,
      friScore: scores.fri,
      qriScore: scores.qri,
      vciScore: scores.vci,
      vsiScore: scores.vsi,
      wmiScore: scores.wmi,
      percentile: scores.percentile,
      answers: answers as object,
    },
  });

  return NextResponse.json({ id: result.id, scores });
}
