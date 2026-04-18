"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface QuizLead {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  country: string | null;
  recommendedMajors: string[];
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["new", "contacted", "enrolled", "rejected"];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  new: { bg: "rgba(56,172,207,0.12)", color: "#38ACCF" },
  contacted: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  enrolled: { bg: "rgba(54,180,137,0.12)", color: "#36B489" },
  rejected: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
};

export default function QuizLeadsTab() {
  const [leads, setLeads] = useState<QuizLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET || "admin";
  const authHeader = `Bearer ${adminSecret}`;

  async function fetchLeads() {
    try {
      const res = await fetch("/api/quiz-leads", {
        headers: { Authorization: authHeader },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLeads(data);
    } catch (e) {
      setError("Failed to load quiz leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      await fetch(`/api/quiz-leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ status }),
      });
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
    } finally {
      setUpdating(null);
    }
  }

  function exportCSV() {
    const headers = ["Name", "Email", "WhatsApp", "Recommended Majors", "Status", "Date"];
    const rows = filtered.map((l) => [
      l.fullName,
      l.email,
      l.whatsapp,
      (l.recommendedMajors ?? []).join("; "),
      l.status,
      new Date(l.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered =
    statusFilter === "all" ? leads : leads.filter((l) => l.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 rounded-xl animate-pulse"
            style={{ background: "var(--color-bg-secondary)" }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <p style={{ color: "#ef4444" }}>{error}</p>;
  }

  return (
    <GlassCard>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="font-heading font-bold text-base">
          Quiz Leads{" "}
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: "var(--color-accent-muted)", color: "var(--color-accent)" }}
          >
            {leads.length}
          </span>
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm rounded-lg px-3 py-1.5 outline-none border"
            style={{
              background: "var(--color-bg-secondary)",
              color: "var(--color-text-primary)",
              borderColor: "var(--glass-border)",
            }}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={{ background: "var(--color-accent-muted)", color: "var(--color-accent)" }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          No leads found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
                {["Name", "Email", "WhatsApp", "Recommended Majors", "Status", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 font-medium"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, idx) => {
                const colors = STATUS_COLORS[lead.status] ?? {
                  bg: "rgba(107,114,128,0.1)",
                  color: "#6b7280",
                };
                return (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: "1px solid var(--glass-border-subtle)",
                      background:
                        idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <td className="px-3 py-2.5 font-medium">{lead.fullName}</td>
                    <td
                      className="px-3 py-2.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {lead.email}
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {lead.whatsapp}
                    </td>
                    <td
                      className="px-3 py-2.5 max-w-[180px]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <span className="truncate block" title={(lead.recommendedMajors ?? []).join(", ")}>
                        {(lead.recommendedMajors ?? []).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={lead.status}
                        disabled={updating === lead.id}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-full font-medium outline-none cursor-pointer"
                        style={{ background: colors.bg, color: colors.color, border: "none" }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td
                      className="px-3 py-2.5"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
