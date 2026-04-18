"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, BookOpen, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SITE_NAME } from "@/lib/constants";
import { useComparisonStore } from "@/stores/comparisonStore";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";

const NAV_LINKS = [
  { label: "How It Works",           href: "/#how-it-works" },
  { label: "Before Coming to China", href: "/before-china" },
  { label: "Cost of Living",         href: "/cost-of-living" },
  { label: "Universities",           href: "/discover" },
  { label: "Lifestyle",              href: "/lifestyle" },
] as const;

// CurrencyPicker (inline)
function CurrencyPicker() {
  const { currency, setCurrency } = useCurrency()
  const options: Currency[] = ["USD", "MAD", "RMB"]
  return (
    <div className="hidden md:flex items-center rounded-lg overflow-hidden" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
      {options.map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className="px-2.5 py-1 text-xs font-semibold font-heading transition-all"
          style={{
            background: currency === c ? "var(--color-accent)" : "transparent",
            color: currency === c ? "#fff" : "var(--color-text-secondary)",
          }}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

// Mobile CurrencyPicker
function MobileCurrencyPicker() {
  const { currency, setCurrency } = useCurrency()
  const options: Currency[] = ["USD", "MAD", "RMB"]
  return (
    <div className="flex items-center rounded-lg overflow-hidden mb-2" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
      {options.map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className="flex-1 px-2.5 py-2 text-xs font-semibold font-heading transition-all"
          style={{
            background: currency === c ? "var(--color-accent)" : "transparent",
            color: currency === c ? "#fff" : "var(--color-text-secondary)",
          }}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { programs: compared } = useComparisonStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => setUser(data.user));
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    } catch {
      // Supabase not configured — auth UI stays hidden
    }
  }, []);

  async function handleSignOut() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    setUser(null);
    setOpen(false);
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass py-3" : "py-5 bg-transparent"
      )}
      style={scrolled ? { borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" } : {}}
    >
      <div className="container-app flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 relative">
            <Image
              src="/Green-Logo.png"
              alt={SITE_NAME}
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span
            className="font-heading font-800 text-lg tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Bridge<span style={{ color: "var(--color-accent)" }}>4</span>China
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-accent)]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Compare badge */}
          {compared.length > 0 && (
            <Link
              href="/compare"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-heading badge-accent"
            >
              <BookOpen size={13} />
              Compare ({compared.length}/3)
            </Link>
          )}

          {/* Currency Picker */}
          <CurrencyPicker />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/dashboard" className="btn-ghost text-sm py-2 flex items-center gap-1.5">
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="btn-ghost text-sm py-2 flex items-center gap-1.5">
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="btn-ghost text-sm py-2 flex items-center gap-1.5">
                <LogIn size={14} />
                Sign in
              </Link>
              <Link href="/apply" className="btn-accent btn-liquid text-sm py-2">
                Apply Now
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg glass-hover"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 mx-4 glass rounded-2xl overflow-hidden animate-slide-up">
          <div className="p-4 flex flex-col gap-1">
            {/* Mobile currency picker at top */}
            <MobileCurrencyPicker />

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-accent)]"
                style={{ color: "var(--color-text-primary)" }}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="mt-2 btn-ghost text-center flex items-center justify-center gap-2"
                >
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn-ghost text-center flex items-center justify-center gap-2 w-full"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 btn-ghost text-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/apply"
                  onClick={() => setOpen(false)}
                  className="mt-1 btn-accent btn-liquid text-center"
                >
                  Apply Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
