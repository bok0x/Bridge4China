import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { FileText, Bookmark, CreditCard, User, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { count: appCount },
    { count: savedCount },
    { data: latestApplication },
    { data: pendingPayments },
  ] = await Promise.all([
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", user?.id ?? ""),
    supabase.from("SavedProgram").select("*", { count: "exact", head: true }).eq("userId", user?.id ?? ""),
    supabase
      .from("applications")
      .select("status, updatedAt")
      .eq("user_id", user?.id ?? "")
      .order("updatedAt", { ascending: false })
      .limit(1)
      .then(({ data }) => ({ data })),
    supabase
      .from("Payment")
      .select("id, status, amount, currency, createdAt")
      .eq("userId", user?.id ?? "")
      .eq("status", "pending")
      .then(({ data }) => ({ data })),
  ]);

  const userName = user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "there";
  const latestStatus = latestApplication?.[0]?.status;
  const hasPendingPayment = (pendingPayments?.length ?? 0) > 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black mb-1">Welcome back, {userName}</h1>
        <p style={{ color: "var(--color-text-secondary)" }} className="text-sm">
          {user?.email}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-accent-muted)" }}>
              <FileText size={18} style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <p className="font-heading font-bold text-2xl">{appCount ?? 0}</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Applications</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(56,172,207,0.1)" }}>
              <Bookmark size={18} style={{ color: "#38ACCF" }} />
            </div>
            <div>
              <p className="font-heading font-bold text-2xl">{savedCount ?? 0}</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Saved Programs</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="sm">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: hasPendingPayment ? "rgba(245,158,11,0.15)" : "rgba(54,180,137,0.1)" }}
            >
              <CreditCard size={18} style={{ color: hasPendingPayment ? "#f59e0b" : "var(--color-accent)" }} />
            </div>
            <div>
              <p className="font-heading font-bold text-2xl">{hasPendingPayment ? "Pending" : "OK"}</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Payment Status</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Next action nudge */}
      {hasPendingPayment && (
        <div
          className="rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <div>
            <p className="font-medium text-sm" style={{ color: "#f59e0b" }}>Payment pending verification</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              Your payment is being reviewed. You will be notified once confirmed.
            </p>
          </div>
        </div>
      )}

      {latestStatus && (
        <div
          className="rounded-2xl px-5 py-4 mb-6 flex items-center justify-between gap-4"
          style={{ background: "var(--color-accent-muted)", border: "1px solid rgba(54,180,137,0.2)" }}
        >
          <div>
            <p className="font-medium text-sm" style={{ color: "var(--color-accent)" }}>
              Latest application: {latestStatus.replace("_", " ")}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              Continue where you left off or check your application status.
            </p>
          </div>
          <Link href="/dashboard/applications" className="btn-ghost text-sm flex items-center gap-1.5 flex-shrink-0">
            View <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <GlassCard>
        <h2 className="font-heading font-bold text-lg mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/discover" className="btn-accent text-sm">Browse Programs</Link>
          <Link href="/scholarships" className="btn-ghost text-sm">Find Scholarships</Link>
          <Link href="/apply" className="btn-ghost text-sm">Start Application</Link>
          <Link href="/dashboard/profile" className="btn-ghost text-sm flex items-center gap-1.5">
            <User size={14} />
            Edit Profile
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
