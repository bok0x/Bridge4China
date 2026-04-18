import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
  if (!adminEmails.includes(user.email ?? "")) redirect("/dashboard");

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-app">
        <div className="flex items-center gap-3 mb-8">
          <div className="badge badge-accent">Admin</div>
          <h1 className="text-2xl font-heading font-black">Analytics Dashboard</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
