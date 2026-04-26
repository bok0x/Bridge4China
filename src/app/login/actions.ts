"use server";
import { createClient } from "@/lib/supabase/server";

export async function signInAction(
  prevState: { error: string; redirectTo?: string },
  formData: FormData
): Promise<{ error: string; redirectTo?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirect = (formData.get("redirect") as string) || "/dashboard";

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
      return { error: "No account found or wrong password." };
    }
    if (msg.includes("email not confirmed")) {
      return { error: "Please verify your email before signing in." };
    }
    return { error: error.message };
  }

  if (!data.session) {
    return { error: "Login succeeded but no session was created. Please try again." };
  }

  // Return the redirect URL to the client — the client navigates after
  // cookies from Set-Cookie headers are stored in the browser.
  return { error: "", redirectTo: redirect };
}
