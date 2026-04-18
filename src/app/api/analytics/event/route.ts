import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, payload } = body as { eventType: string; payload: Record<string, unknown> };

    if (!eventType) return NextResponse.json({ ok: false });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("AnalyticsEvent").insert({
      eventType,
      payload: payload ?? {},
      userId: user?.id ?? null,
    });
  } catch {
    // Non-blocking — never fail a page because of analytics
  }

  return NextResponse.json({ ok: true });
}
