"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Metadata } from "next";

const COUNTRIES = [
  "Algeria", "Angola", "Bahrain", "Bangladesh", "Cameroon", "Congo", "Egypt",
  "Ethiopia", "Ghana", "India", "Indonesia", "Iran", "Iraq", "Jordan", "Kenya",
  "Kuwait", "Lebanon", "Libya", "Malaysia", "Mali", "Morocco", "Mozambique",
  "Niger", "Nigeria", "Oman", "Pakistan", "Palestine", "Qatar", "Saudi Arabia",
  "Senegal", "Somalia", "South Africa", "Sudan", "Syria", "Tanzania", "Tunisia",
  "Turkey", "Uganda", "United Arab Emirates", "Yemen", "Zimbabwe",
];

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setName(data.name ?? "");
        setCountry(data.country ?? "");
        setPhone(data.phone ?? "");
        setEmail(data.email ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, country, phone }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save");
    } else {
      setSuccess(true);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-heading font-black mb-6">Profile</h1>
        <GlassCard>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl" style={{ background: "var(--color-bg-tertiary)" }} />
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-black mb-1">Profile</h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Manage your personal information
        </p>
      </div>

      <GlassCard>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="input-glass w-full opacity-60 cursor-not-allowed"
            />
            <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
              Email cannot be changed here
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="input-glass w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Country of origin
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-glass w-full"
            >
              <option value="">Select country…</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              WhatsApp / Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+212 6XX XXX XXX"
              className="input-glass w-full"
            />
          </div>

          {error && (
            <p className="text-sm rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm rounded-xl px-4 py-3" style={{ background: "rgba(54,180,137,0.1)", color: "var(--color-accent)", border: "1px solid rgba(54,180,137,0.2)" }}>
              Profile saved successfully.
            </p>
          )}

          <button type="submit" disabled={saving} className="btn-accent">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
