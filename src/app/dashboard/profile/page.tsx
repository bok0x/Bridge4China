"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { COUNTRY_CODES } from "@/components/ui/PhoneInput";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-heading font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
      {children}
    </h2>
  );
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
        {label} <span style={{ fontSize: 11, marginLeft: 4 }}>🔒</span>
      </label>
      <input
        type="text"
        value={value}
        disabled
        className="input-glass w-full"
        style={{ opacity: 0.45, cursor: "not-allowed" }}
      />
    </div>
  );
}

function Alert({ type, message }: { type: "error" | "success"; message: string }) {
  const isError = type === "error";
  return (
    <p className="text-sm rounded-xl px-4 py-3" style={{
      background: isError ? "rgba(239,68,68,0.1)" : "rgba(54,180,137,0.1)",
      color: isError ? "#f87171" : "var(--color-accent)",
      border: `1px solid ${isError ? "rgba(239,68,68,0.2)" : "rgba(54,180,137,0.2)"}`,
    }}>
      {message}
    </p>
  );
}

export default function ProfilePage() {
  // Profile data (loaded from API)
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [phoneCode, setPhoneCode] = useState("+212");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Phone section
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Password section
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Email section
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(data => {
        setName(data.name ?? "");
        setBirthday(data.birthday ?? "");
        setEmail(data.email ?? "");

        // Parse stored phone "+212 0612345678" into code + number
        const stored: string = data.phone ?? "";
        const match = COUNTRY_CODES.find(cc => stored.startsWith(cc.code + " "));
        if (match) {
          setPhoneCode(match.code);
          setPhoneNumber(stored.slice(match.code.length + 1));
        } else {
          setPhoneCode(data.nationality_code ?? "+212");
          setPhoneNumber(stored);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Format birthday for display
  const formatBirthday = (iso: string) => {
    if (!iso) return "";
    try {
      const [y, m, d] = iso.split("-");
      const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
    } catch { return iso; }
  };

  async function handlePhoneSave(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneNumber.trim()) { setPhoneMsg({ type: "error", text: "Phone number is required." }); return; }
    setPhoneSaving(true);
    setPhoneMsg(null);
    const phone = `${phoneCode} ${phoneNumber}`;
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, nationality_code: phoneCode }),
    });
    const data = await res.json();
    setPhoneMsg(res.ok ? { type: "success", text: "Phone number updated." } : { type: "error", text: data.error ?? "Failed to save." });
    setPhoneSaving(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd.length < 8) { setPwdMsg({ type: "error", text: "New password must be at least 8 characters." }); return; }
    if (newPwd !== confirmPwd) { setPwdMsg({ type: "error", text: "Passwords do not match." }); return; }

    setPwdSaving(true);
    setPwdMsg(null);

    const supabase = createClient();

    // Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPwd });
    if (signInError) {
      setPwdMsg({ type: "error", text: "Current password is incorrect." });
      setPwdSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPwd });
    if (updateError) {
      setPwdMsg({ type: "error", text: updateError.message });
    } else {
      setPwdMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    }
    setPwdSaving(false);
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === email) {
      setEmailMsg({ type: "error", text: "Please enter a different email address." });
      return;
    }
    setEmailSaving(true);
    setEmailMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      setEmailMsg({ type: "error", text: error.message });
    } else {
      setEmailMsg({ type: "success", text: `A confirmation link was sent to ${newEmail}. Click it to complete the change.` });
      setNewEmail("");
    }
    setEmailSaving(false);
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-heading font-black mb-6">Profile</h1>
        <GlassCard>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 rounded-xl" style={{ background: "var(--color-bg-tertiary)" }} />
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-black mb-1">Profile</h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Manage your account settings
        </p>
      </div>

      {/* ── Identity (locked) ───────────────────────────────────────────────── */}
      <GlassCard>
        <SectionTitle>Identity</SectionTitle>
        <div className="space-y-4">
          <LockedField label="Full name" value={name} />
          <LockedField label="Date of birth" value={formatBirthday(birthday)} />
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Name and birthday cannot be changed after registration. Contact support if there is an error.
          </p>
        </div>
      </GlassCard>

      {/* ── Phone ───────────────────────────────────────────────────────────── */}
      <GlassCard>
        <SectionTitle>Phone Number</SectionTitle>
        <form onSubmit={handlePhoneSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              WhatsApp / Phone
            </label>
            <PhoneInput
              code={phoneCode}
              number={phoneNumber}
              onCodeChange={setPhoneCode}
              onNumberChange={setPhoneNumber}
            />
            <p className="text-xs mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
              ⚡ WhatsApp number recommended
            </p>
          </div>
          {phoneMsg && <Alert type={phoneMsg.type} message={phoneMsg.text} />}
          <button type="submit" disabled={phoneSaving} className="btn-accent">
            {phoneSaving ? "Saving…" : "Save phone"}
          </button>
        </form>
      </GlassCard>

      {/* ── Change Password ─────────────────────────────────────────────────── */}
      <GlassCard>
        <SectionTitle>Change Password</SectionTitle>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Current password
            </label>
            <input
              type="password"
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Your current password"
              className="input-glass w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              New password
            </label>
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Min 8 characters"
              className="input-glass w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Repeat new password"
              className="input-glass w-full"
              style={{ borderColor: confirmPwd && confirmPwd !== newPwd ? "rgba(239,68,68,0.6)" : undefined }}
            />
            {confirmPwd && confirmPwd !== newPwd && (
              <p className="text-xs mt-1" style={{ color: "#f87171" }}>Passwords do not match</p>
            )}
          </div>
          {pwdMsg && <Alert type={pwdMsg.type} message={pwdMsg.text} />}
          <button type="submit" disabled={pwdSaving} className="btn-accent">
            {pwdSaving ? "Updating…" : "Update password"}
          </button>
        </form>
      </GlassCard>

      {/* ── Change Email ────────────────────────────────────────────────────── */}
      <GlassCard>
        <SectionTitle>Change Email</SectionTitle>
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              Current email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="input-glass w-full"
              style={{ opacity: 0.5, cursor: "not-allowed" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
              New email address
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="new@example.com"
              className="input-glass w-full"
            />
          </div>
          {emailMsg && <Alert type={emailMsg.type} message={emailMsg.text} />}
          <button type="submit" disabled={emailSaving} className="btn-accent">
            {emailSaving ? "Sending…" : "Send confirmation"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
