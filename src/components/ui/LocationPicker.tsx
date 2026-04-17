"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapPin, ChevronDown, X } from "lucide-react";
import { CHINESE_LOCATIONS } from "@/lib/constants";

export interface LocationValue {
  province?: string;
  city?: string;
}

interface LocationPickerProps {
  value: LocationValue | null;
  onChange: (value: LocationValue | null) => void;
  placeholder?: string;
  className?: string;
}

function getDisplayLabel(value: LocationValue | null): string {
  if (!value) return "";
  if (value.city) return `${value.province} (${value.city})`;
  return value.province ?? "";
}

export function LocationPicker({
  value,
  onChange,
  placeholder = "Any location",
  className,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position from trigger button rect
  const reposition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  function openPicker() {
    reposition();
    setOpen(true);
  }

  // Close on outside click — must check both trigger and portal dropdown
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Reposition on scroll or resize while open
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  const q = search.toLowerCase().trim();

  const visibleLocations = CHINESE_LOCATIONS.map((loc) => {
    const provinceMatches = loc.province.toLowerCase().includes(q);
    const matchingCities = q
      ? loc.cities.filter((c) => c.city.toLowerCase().includes(q))
      : loc.cities;
    return { ...loc, provinceMatches, matchingCities };
  }).filter((loc) => !q || loc.provinceMatches || loc.matchingCities.length > 0);

  const displayLabel = getDisplayLabel(value);

  function select(next: LocationValue | null) {
    onChange(next);
    setOpen(false);
    setSearch("");
  }

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={{
        ...dropdownStyle,
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--glass-border-subtle)",
        borderRadius: "0.75rem",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* Search input */}
      <div
        className="p-2"
        style={{ borderBottom: "1px solid var(--glass-border-subtle)" }}
      >
        <input
          autoFocus
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search province or city…"
          className="input-glass text-xs py-1.5 w-full"
        />
      </div>

      {/* Options list */}
      <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
        {value && (
          <button
            type="button"
            onClick={() => select(null)}
            className="w-full px-3 py-2 text-xs text-left flex items-center gap-1.5 transition-colors hover:bg-white/5"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <X size={10} />
            Clear location
          </button>
        )}

        {visibleLocations.map((loc) => {
          const provinceActive = value?.province === loc.province && !value?.city;
          const showProvinceRow =
            !q || loc.provinceMatches || loc.isMunicipality || loc.matchingCities.length > 0;

          return (
            <div key={loc.province}>
              {showProvinceRow && (
                <button
                  type="button"
                  onClick={() => select({ province: loc.province })}
                  className="w-full px-3 py-2 text-xs text-left font-semibold transition-colors hover:bg-white/5"
                  style={{
                    color: provinceActive ? "var(--color-accent)" : "var(--color-text-primary)",
                    background: provinceActive ? "var(--color-accent-muted)" : undefined,
                  }}
                >
                  {loc.province}
                  {!loc.isMunicipality && loc.cities.length > 0 && (
                    <span className="ml-1 text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                      ›
                    </span>
                  )}
                </button>
              )}

              {!loc.isMunicipality &&
                loc.matchingCities.map((c) => {
                  const cityActive = value?.city === c.city;
                  return (
                    <button
                      key={c.city}
                      type="button"
                      onClick={() => select({ province: loc.province, city: c.city })}
                      className="w-full pl-7 pr-3 py-1.5 text-xs text-left transition-colors hover:bg-white/5"
                      style={{
                        color: cityActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                        background: cityActive ? "var(--color-accent-muted)" : undefined,
                      }}
                    >
                      {c.city}
                    </button>
                  );
                })}
            </div>
          );
        })}

        {visibleLocations.length === 0 && (
          <p className="px-3 py-5 text-xs text-center" style={{ color: "var(--color-text-tertiary)" }}>
            No location found
          </p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* ── Trigger button ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="input-glass text-xs py-2 w-full flex items-center justify-between gap-2 text-left"
        style={{
          color: displayLabel ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
        }}
      >
        <span className="flex items-center gap-1.5 truncate min-w-0">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate">{displayLabel || placeholder}</span>
        </span>
        <ChevronDown
          size={12}
          className={`flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Portal dropdown — escapes any overflow:hidden parent ── */}
      {typeof document !== "undefined" && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
