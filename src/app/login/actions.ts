"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signInAction(prevState: { error: string }, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

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
    return { error: "Login succeeded but session was not created. Please try again." };
  }

  redirect("/dashboard");
}
