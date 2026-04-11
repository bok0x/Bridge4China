"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES, Lang } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  function select(code: Lang) {
    setLang(code);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-heading font-semibold transition-all duration-200"
        style={{
          background: open
            ? "var(--color-accent-muted)"
            : "rgba(255,255,255,0.06)",
          border: `1px solid ${open ? "var(--color-accent)" : "rgba(255,255,255,0.12)"}`,
          color: open ? "var(--color-accent)" : "var(--color-text-secondary)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe size={14} />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
        <ChevronDown
          size={13}
          className="transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-2xl overflow-hidden z-50"
          style={{
            background: "rgba(10, 25, 18, 0.92)",
            backdropFilter: "blur(30px) saturate(180%)",
            WebkitBackdropFilter: "blur(30px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
          role="listbox"
        >
          <div className="p-1.5 flex flex-col gap-0.5">
            {LANGUAGES.map((l) => {
              const active = l.code === lang;
              return (
                <button
                  key={l.code}
                  role="option"
                  aria-selected={active}
                  onClick={() => select(l.code)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-heading font-medium transition-all duration-150 text-left"
                  style={{
                    background: active ? "var(--color-accent-muted)" : "transparent",
                    color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-secondary)";
                    }
                  }}
                >
                  <span className="text-base leading-none">{l.flag}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs leading-none mb-0.5">
                      {l.code.toUpperCase()}
                    </span>
                    <span className="text-xs opacity-70 leading-none">{l.native}</span>
                  </div>
                  {active && (
                    <Check
                      size={13}
                      className="ml-auto flex-shrink-0"
                      style={{ color: "var(--color-accent)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
