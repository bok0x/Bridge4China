"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, BookOpen, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SITE_NAME } from "@/lib/constants";
import { useComparisonStore } from "@/stores/comparisonStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_KEYS = [
  { key: "nav_discover" as const, href: "/discover" },
  { key: "nav_compare"  as const, href: "/compare"  },
  { key: "nav_scholarships" as const, href: "/scholarships" },
  { key: "nav_apply"   as const, href: "/apply"    },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { programs: compared } = useComparisonStore();
  const { t } = useLanguage();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
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
          <div className="w-8 h-8 relative">
            <Image
              src="/logo-icon.svg"
              alt={SITE_NAME}
              width={32}
              height={32}
              className="object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <span
            className="font-heading font-800 text-lg tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            China<span style={{ color: "var(--color-accent)" }}>Uni</span>Match
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_KEYS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-accent)]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t(link.key)}
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
              {t("nav_compare")} ({compared.length}/3)
            </Link>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher />

          <ThemeToggle />

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
              <Link href="/apply" className="btn-accent text-sm py-2">
                {t("apply_now")}
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
            {NAV_KEYS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--color-accent-muted)] hover:text-[var(--color-accent)]"
                style={{ color: "var(--color-text-primary)" }}
              >
                {t(link.key)}
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
                  className="mt-1 btn-accent text-center"
                >
                  {t("apply_now")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
