import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name ?? "",
    birthday: user.user_metadata?.birthday ?? "",
    phone: user.user_metadata?.phone ?? "",
    nationality_code: user.user_metadata?.nationality_code ?? "",
    country: user.user_metadata?.country ?? "",
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  // name and birthday are intentionally excluded — they cannot be changed after registration
  const { phone, nationality_code, country } = body as {
    phone?: string;
    nationality_code?: string;
    country?: string;
  };

  const { error } = await supabase.auth.updateUser({
    data: {
      ...(phone !== undefined && { phone }),
      ...(nationality_code !== undefined && { nationality_code }),
      ...(country !== undefined && { country }),
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
