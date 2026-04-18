import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isAdmin(email: string | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
  return adminEmails.includes(email ?? "");
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalApplications },
    { count: recentApplications },
    { data: applicationsByStatus },
    { data: topUniversities },
    { data: recentPayments },
    { data: topEvents },
  ] = await Promise.all([
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }).gte("createdAt", thirtyDaysAgo),
    supabase.from("applications").select("status").then(({ data }) => ({
      data: data
        ? Object.entries(
            data.reduce((acc: Record<string, number>, r) => {
              acc[r.status] = (acc[r.status] ?? 0) + 1;
              return acc;
            }, {})
          ).map(([status, count]) => ({ status, count }))
        : [],
    })),
    supabase
      .from("applications")
      .select("program:Program(university:University(name))")
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?.forEach((a: any) => {
          const uniRaw = a.program?.university;
          const name = (Array.isArray(uniRaw) ? uniRaw[0]?.name : uniRaw?.name) ?? "Unknown";
          counts[name] = (counts[name] ?? 0) + 1;
        });
        return {
          data: Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        };
      }),
    supabase
      .from("Payment")
      .select("id, userId, amount, currency, method, status, receiptNote, verifiedAt, createdAt")
      .order("createdAt", { ascending: false })
      .limit(20),
    supabase
      .from("AnalyticsEvent")
      .select("eventType, payload")
      .eq("eventType", "filter_used")
      .gte("createdAt", thirtyDaysAgo)
      .limit(500)
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        data?.forEach((e: { payload: { filter?: string } }) => {
          const key = e.payload?.filter ?? "unknown";
          counts[key] = (counts[key] ?? 0) + 1;
        });
        return {
          data: Object.entries(counts)
            .map(([filter, count]) => ({ filter, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        };
      }),
  ]);

  const totalRevenue = (recentPayments ?? [])
    .filter((p: { status: string }) => p.status === "verified")
    .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

  return NextResponse.json({
    applications: {
      total: totalApplications ?? 0,
      last30Days: recentApplications ?? 0,
      byStatus: applicationsByStatus ?? [],
    },
    topUniversities: topUniversities ?? [],
    topFilters: topEvents ?? [],
    payments: {
      recent: recentPayments ?? [],
      totalRevenue,
    },
  });
}
