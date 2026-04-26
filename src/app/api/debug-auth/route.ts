import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const authCookie = allCookies.find((c) => c.name === "sb-gofjasbvyhtbhyxxcrzd-auth-token");

  let rawFirst100 = "";
  let parsedDirectly = false;
  let parsedAfterDecode = false;
  let decodedFirst100 = "";

  if (authCookie) {
    rawFirst100 = authCookie.value.slice(0, 100);
    try {
      JSON.parse(authCookie.value);
      parsedDirectly = true;
    } catch {}
    try {
      const decoded = decodeURIComponent(authCookie.value);
      decodedFirst100 = decoded.slice(0, 100);
      JSON.parse(decoded);
      parsedAfterDecode = true;
    } catch {}
  }

  // Test server client with cookies() (Route Handler pattern)
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

  const { data: sessionData } = await supabase.auth.getSession();

  return NextResponse.json({
    cookieExists: !!authCookie,
    cookieLength: authCookie?.value.length,
    rawFirst100,
    decodedFirst100,
    parsedDirectly,
    parsedAfterDecode,
    getSessionResult: !!sessionData.session,
  });
}
