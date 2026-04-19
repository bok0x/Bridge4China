import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const popup = searchParams.get("popup") === "true";

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (popup) {
        const html = `<!DOCTYPE html><html><head><title>Signing in…</title></head><body>
<script>
  try { window.opener.postMessage("oauth-success", "${origin}"); } catch(e) {}
  window.close();
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:40px;color:#48C59C;">Signed in! Closing…</p>
</body></html>`;
        return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (popup) {
    const html = `<!DOCTYPE html><html><body><script>
  try { window.opener.postMessage("oauth-error", "${origin}"); } catch(e) {}
  window.close();
</script></body></html>`;
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
