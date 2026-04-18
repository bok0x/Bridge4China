"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FileText, TrendingUp, DollarSign, Filter, Award } from "lucide-react";

interface StatsData {
  applications: {
    total: number;
    last30Days: number;
    byStatus: { status: string; count: number }[];
  };
  topUniversities: { name: string; count: number }[];
  topFilters: { filter: string; count: number }[];
  payments: {
    recent: Payment[];
    totalRevenue: number;
  };
}

interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  receiptNote: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  ACCEPTED: "#36B489",
  SUBMITTED: "#38ACCF",
  IN_PROGRESS: "#f59e0b",
  DRAFT: "#6b7280",
  REJECTED: "#ef4444",
  UNDER_REVIEW: "#8b5cf6",
};

export default function AdminPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function updatePaymentStatus(id: string, status: string) {
    setUpdatingPayment(id);
    await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    // Refresh stats
    const res = await fetch("/api/admin/stats");
    const data = await res.json();
    setStats(data);
    setUpdatingPayment(null);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "var(--color-bg-secondary)" }} />
        ))}
      </div>
    );
  }

  if (!stats) {
    return <p style={{ color: "var(--color-text-secondary)" }}>Failed to load stats.</p>;
  }

  const accepted = stats.applications.byStatus.find((s) => s.status === "ACCEPTED")?.count ?? 0;
  const conversionRate = stats.applications.total
    ? Math.round((accepted / stats.applications.total) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={<FileText size={18} style={{ color: "var(--color-accent)" }} />}
          label="Total Applications"
          value={stats.applications.total}
          sub={`+${stats.applications.last30Days} last 30 days`}
          accent="var(--color-accent-muted)"
        />
        <KpiCard
          icon={<TrendingUp size={18} style={{ color: "#38ACCF" }} />}
          label="Acceptance Rate"
          value={`${conversionRate}%`}
          sub={`${accepted} accepted`}
          accent="rgba(56,172,207,0.1)"
        />
        <KpiCard
          icon={<DollarSign size={18} style={{ color: "#f59e0b" }} />}
          label="Verified Revenue"
          value={`${stats.payments.totalRevenue.toLocaleString()} MAD`}
          sub={`${stats.payments.recent.filter((p) => p.status === "verified").length} payments`}
          accent="rgba(245,158,11,0.1)"
        />
        <KpiCard
          icon={<Award size={18} style={{ color: "#8b5cf6" }} />}
          label="Pending Payments"
          value={stats.payments.recent.filter((p) => p.status === "pending").length}
          sub="awaiting verification"
          accent="rgba(139,92,246,0.1)"
        />
      </div>

      {/* Applications by status + Top universities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="font-heading font-bold text-base mb-4">Applications by Status</h2>
          {stats.applications.byStatus.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>No data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.applications.byStatus
                .sort((a, b) => b.count - a.count)
                .map(({ status, count }) => {
                  const pct = Math.round((count / stats.applications.total) * 100);
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: STATUS_COLORS[status] ?? "var(--color-text-primary)" }}>{status}</span>
                        <span style={{ color: "var(--color-text-secondary)" }}>{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: "var(--color-bg-tertiary)" }}>
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: STATUS_COLORS[status] ?? "var(--color-accent)" }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="font-heading font-bold text-base mb-4">Top Universities Applied To</h2>
          {stats.topUniversities.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>No data yet.</p>
          ) : (
            <ol className="space-y-2">
              {stats.topUniversities.map(({ name, count }, i) => (
                <li key={name} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-center font-heading font-bold" style={{ color: "var(--color-text-tertiary)" }}>
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{name}</span>
                  <span className="font-medium" style={{ color: "var(--color-accent)" }}>{count}</span>
                </li>
              ))}
            </ol>
          )}
        </GlassCard>
      </div>

      {/* Top filters */}
      {stats.topFilters.length > 0 && (
        <GlassCard>
          <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
            <Filter size={16} style={{ color: "var(--color-accent)" }} />
            Most Used Filters (last 30 days)
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.topFilters.map(({ filter, count }) => (
              <span
                key={filter}
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: "var(--color-accent-muted)", color: "var(--color-accent)" }}
              >
                {filter} <span style={{ opacity: 0.7 }}>({count})</span>
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Payments */}
      <GlassCard>
        <h2 className="font-heading font-bold text-base mb-4">Recent Payments</h2>
        {stats.payments.recent.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                  {["Date", "User", "Amount", "Method", "Note", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-medium" style={{ color: "var(--color-text-secondary)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.payments.recent.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--glass-border-subtle)" }}>
                    <td className="px-3 py-2.5" style={{ color: "var(--color-text-secondary)" }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      {p.userId.slice(0, 8)}…
                    </td>
                    <td className="px-3 py-2.5 font-medium">
                      {p.amount} {p.currency}
                    </td>
                    <td className="px-3 py-2.5" style={{ color: "var(--color-text-secondary)" }}>{p.method}</td>
                    <td className="px-3 py-2.5 max-w-[140px] truncate" style={{ color: "var(--color-text-secondary)" }}>
                      {p.receiptNote ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: p.status === "verified" ? "rgba(54,180,137,0.15)" : p.status === "rejected" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                          color: p.status === "verified" ? "#36B489" : p.status === "rejected" ? "#ef4444" : "#f59e0b",
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {p.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updatePaymentStatus(p.id, "verified")}
                            disabled={updatingPayment === p.id}
                            className="text-xs px-2 py-1 rounded-lg font-medium transition-colors"
                            style={{ background: "rgba(54,180,137,0.15)", color: "#36B489" }}
                          >
                            {updatingPayment === p.id ? "…" : "Verify"}
                          </button>
                          <button
                            onClick={() => updatePaymentStatus(p.id, "rejected")}
                            disabled={updatingPayment === p.id}
                            className="text-xs px-2 py-1 rounded-lg font-medium transition-colors"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  accent: string;
}) {
  return (
    <GlassCard padding="sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: accent }}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-heading font-bold text-2xl leading-none mb-1">{value}</p>
          <p className="text-xs font-medium mb-0.5">{label}</p>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{sub}</p>
        </div>
      </div>
    </GlassCard>
  );
}
