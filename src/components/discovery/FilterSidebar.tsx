"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FIELDS_OF_STUDY } from "@/lib/constants";
import { LocationPicker, type LocationValue } from "@/components/ui/LocationPicker";
import { useLanguage } from "@/contexts/LanguageContext";

const DEGREES = [
  { value: "NON_DEGREE", label: "Non-degree" },
  { value: "ASSOCIATE", label: "Associate" },
  { value: "BACHELOR", label: "Bachelor's" },
  { value: "MASTER", label: "Master's" },
  { value: "DOCTORAL", label: "Doctoral" },
  { value: "STUDY_TOUR", label: "Study Tour" },
  { value: "JUNIOR_COLLEGE_UPGRADE", label: "Jr. College Upgrade" },
  { value: "DIPLOMA", label: "Diploma" },
];

const LANGUAGES = [
  { value: "ENGLISH", label: "English" },
  { value: "CHINESE", label: "Chinese" },
  { value: "RUSSIAN", label: "Russian" },
  { value: "BILINGUAL", label: "Bilingual" },
];

const INTAKE_YEARS = ["2025", "2026"];

const INTAKE_SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

export function FilterSidebar() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
        // Fire-and-forget analytics event
        fetch("/api/analytics/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventType: "filter_used", payload: { filter: key, value } }),
        }).catch(() => {});
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const hasFilters = searchParams.size > 0;

  const currentDegree = searchParams.get("degree");
  const currentLang = searchParams.get("language");
  const currentField = searchParams.get("field");
  const currentProvince = searchParams.get("province");
  const currentCity = searchParams.get("city") ?? "";
  const currentUniversity = searchParams.get("universityName") ?? "";
  const currentIntakeYear = searchParams.get("intakeYear");
  const currentIntakeSeason = searchParams.get("intakeSeason");
  const currentAcceptsMinors = searchParams.get("acceptsMinors");
  const currentHasCscaScore = searchParams.get("hasCscaScore");
  const hasScholarship = searchParams.get("hasScholarship") === "true";

  return (
    <GlassCard padding="sm" className="lg:sticky lg:top-24">
      {/* Header — always visible; tap to expand on mobile */}
      <button
        className="w-full flex items-center justify-between mb-1 px-2 py-1 lg:cursor-default"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
      >
        <div className="flex items-center gap-2 font-heading font-bold text-sm">
          <SlidersHorizontal size={15} />
          {t("filter_filters")}
          {hasFilters && (
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={(e) => { e.stopPropagation(); clearAll(); }}
              className="text-xs flex items-center gap-1 transition-colors hover:text-[var(--color-accent)]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <X size={12} />
              {t("filter_clear")}
            </button>
          )}
          <ChevronDown
            size={16}
            className={`lg:hidden transition-transform ${mobileOpen ? "rotate-180" : ""}`}
            style={{ color: "var(--color-text-tertiary)" }}
          />
        </div>
      </button>

      <div className={`space-y-5 mt-3 ${mobileOpen ? "block" : "hidden lg:block"}`}>

        {/* Scholarship toggle */}
        <div>
          <label className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors hover:bg-[var(--color-accent-muted)]">
            <span className="text-sm font-medium">{t("filter_scholarship_only")}</span>
            <div
              onClick={() => updateFilter("hasScholarship", hasScholarship ? null : "true")}
              className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
              style={{
                background: hasScholarship ? "var(--color-accent)" : "var(--color-bg-tertiary)",
              }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                style={{ transform: hasScholarship ? "translateX(20px)" : "translateX(2px)" }}
              />
            </div>
          </label>
        </div>

        {/* Degree */}
        <FilterGroup label={t("filter_academic_level")}>
          {DEGREES.map((d) => (
            <FilterChip
              key={d.value}
              label={d.label}
              active={currentDegree === d.value}
              onClick={() => updateFilter("degree", currentDegree === d.value ? null : d.value)}
            />
          ))}
        </FilterGroup>

        {/* Language */}
        <FilterGroup label={t("filter_teaching_lang")}>
          {LANGUAGES.map((l) => (
            <FilterChip
              key={l.value}
              label={l.label}
              active={currentLang === l.value}
              onClick={() => updateFilter("language", currentLang === l.value ? null : l.value)}
            />
          ))}
        </FilterGroup>

        {/* Intake Year */}
        <FilterGroup label={t("filter_intake_year")}>
          {INTAKE_YEARS.map((y) => (
            <FilterChip
              key={y}
              label={y}
              active={currentIntakeYear === y}
              onClick={() => updateFilter("intakeYear", currentIntakeYear === y ? null : y)}
            />
          ))}
        </FilterGroup>

        {/* Intake Season */}
        <FilterGroup label={t("filter_intake_season")}>
          {INTAKE_SEASONS.map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={currentIntakeSeason === s}
              onClick={() => updateFilter("intakeSeason", currentIntakeSeason === s ? null : s)}
            />
          ))}
        </FilterGroup>

        {/* Accept Minors */}
        <FilterGroup label={t("filter_accepts_minors")}>
          <FilterChip
            label={t("filter_yes")}
            active={currentAcceptsMinors === "true"}
            onClick={() => updateFilter("acceptsMinors", currentAcceptsMinors === "true" ? null : "true")}
          />
          <FilterChip
            label={t("filter_no")}
            active={currentAcceptsMinors === "false"}
            onClick={() => updateFilter("acceptsMinors", currentAcceptsMinors === "false" ? null : "false")}
          />
        </FilterGroup>

        {/* CSCA Score */}
        <FilterGroup label={t("filter_csca_score")}>
          <FilterChip
            label={t("filter_yes")}
            active={currentHasCscaScore === "true"}
            onClick={() => updateFilter("hasCscaScore", currentHasCscaScore === "true" ? null : "true")}
          />
          <FilterChip
            label={t("filter_no")}
            active={currentHasCscaScore === "false"}
            onClick={() => updateFilter("hasCscaScore", currentHasCscaScore === "false" ? null : "false")}
          />
        </FilterGroup>

        {/* University */}
        <FilterGroup label={t("filter_university_name")}>
          <input
            type="text"
            placeholder={t("filter_university_name")}
            value={currentUniversity}
            onChange={(e) => updateFilter("universityName", e.target.value || null)}
            className="input-glass text-xs py-2 w-full"
          />
        </FilterGroup>

        {/* Location — replaces separate City + Province dropdowns */}
        <FilterGroup label={t("filter_location")}>
          <LocationPicker
            value={
              currentProvince
                ? { province: currentProvince, city: currentCity || undefined }
                : null
            }
            onChange={(loc: LocationValue | null) => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("province");
              params.delete("city");
              params.delete("page");
              if (loc?.province) params.set("province", loc.province);
              if (loc?.city)     params.set("city",     loc.city);
              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            className="w-full"
          />
        </FilterGroup>

        {/* Field of Study */}
        <FilterGroup label={t("filter_field_study")}>
          <select
            value={currentField ?? ""}
            onChange={(e) => updateFilter("field", e.target.value || null)}
            className="input-glass text-xs py-2"
          >
            <option value="">All Fields</option>
            {FIELDS_OF_STUDY.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </FilterGroup>

      </div>
    </GlassCard>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-xs font-heading font-semibold uppercase tracking-wider mb-2 px-2"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5 px-2">{children}</div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      style={{
        background: active ? "var(--color-accent)" : "var(--color-bg-tertiary)",
        color: active ? "#fff" : "var(--color-text-secondary)",
        border: active ? "1px solid var(--color-accent)" : "1px solid var(--glass-border-subtle)",
      }}
    >
      {label}
    </button>
  );
}
