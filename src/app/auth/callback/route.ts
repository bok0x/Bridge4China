import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const redirectTo = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: object }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            redirectTo.cookies.set(name, value, (options ?? {}) as Parameters<typeof redirectTo.cookies.set>[2])
          );
        },
      },
    }
  );

  // Path 1: email confirmation link (?token_hash=&type=signup)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) return redirectTo;
  }

  // Path 2: OAuth code exchange (?code=)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Best-effort: sync Prisma User record. Never block auth if this fails.
      const authUser = data.session?.user ?? data.user;
      if (authUser?.email) {
        try {
          await prisma.user.upsert({
            where: { supabaseId: authUser.id },
            update: {},
            create: {
              supabaseId: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
            },
          });
        } catch {
          // DB sync failed — user is still authenticated, let them through
        }
      }
      return redirectTo;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
