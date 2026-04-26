import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const authCookies = allCookies.filter((c) => c.name.startsWith("sb-"));

  // Test with server client (same as middleware)
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: object }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  return NextResponse.json({
    cookiesReceivedByServer: authCookies.map((c) => ({ name: c.name, length: c.value.length })),
    getSession: {
      hasSession: !!sessionData.session,
      userEmail: sessionData.session?.user?.email ?? null,
      error: sessionError?.message ?? null,
    },
    getUser: {
      hasUser: !!userData.user,
      userEmail: userData.user?.email ?? null,
      error: userError?.message ?? null,
    },
  });
}
