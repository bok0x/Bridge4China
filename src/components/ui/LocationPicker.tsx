"use client";

import { useState, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when user clicks outside
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const q = search.toLowerCase().trim();

  // Build filtered list: include a province if its name matches OR any of its cities match
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

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="input-glass text-xs py-2 w-full flex items-center justify-between gap-2 text-left"
        style={{
          color: displayLabel
            ? "var(--color-text-primary)"
            : "var(--color-text-tertiary)",
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

      {/* ── Dropdown ── */}
      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-2xl"
          style={{
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--glass-border-subtle)",
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
            {/* Clear option — only shown when a value is selected */}
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
              // Show province header when: searching and province name matches,
              // OR not searching (show all), OR it's a municipality,
              // OR any matching cities found (for context)
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
                        color: provinceActive
                          ? "var(--color-accent)"
                          : "var(--color-text-primary)",
                        background: provinceActive
                          ? "var(--color-accent-muted)"
                          : undefined,
                      }}
                    >
                      {loc.province}
                      {!loc.isMunicipality && loc.cities.length > 0 && (
                        <span
                          className="ml-1 text-[10px]"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          ›
                        </span>
                      )}
                    </button>
                  )}

                  {/* City rows — indented, only for non-municipalities */}
                  {!loc.isMunicipality &&
                    loc.matchingCities.map((c) => {
                      const cityActive = value?.city === c.city;
                      return (
                        <button
                          key={c.city}
                          type="button"
                          onClick={() =>
                            select({ province: loc.province, city: c.city })
                          }
                          className="w-full pl-7 pr-3 py-1.5 text-xs text-left transition-colors hover:bg-white/5"
                          style={{
                            color: cityActive
                              ? "var(--color-accent)"
                              : "var(--color-text-secondary)",
                            background: cityActive
                              ? "var(--color-accent-muted)"
                              : undefined,
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
              <p
                className="px-3 py-5 text-xs text-center"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                No location found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}