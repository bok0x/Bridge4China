"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Search } from "lucide-react";
import { FilterSidebar } from "@/components/discovery/FilterSidebar";
import { UniversityCard } from "@/components/discovery/UniversityCard";
import { ProgramListTable } from "@/components/discovery/ProgramListTable";
import { ViewToggle } from "@/components/discovery/ViewToggle";
import type { Program } from "@/types";
import { CITY_TO_PROVINCE } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";

const LIMIT = 24;

/** Compact index record shape (subset of Program, from /programs-index.json) */
interface IndexProgram {
  id: string;
  universityName: string;
  universitySlug: string;
  city: string;
  province: string;
  programName: string;
  field: string;
  degree: string;
  teachingLanguage: string;
  intakeSeason: string;
  applicationDeadline?: string | null;
  programDuration: string;
  originalTuition: number;
  tuitionAfterScholarship?: number | null;
  accommodationFee?: number | null;
  acceptsMinors: boolean;
  hasCscaScore: boolean;
  scholarships: { type: string; name: string }[];
}

/** Convert a compact index record to the full Program shape components expect */
function toProgram(p: IndexProgram): Program {
  return {
    ...(p as unknown as Program),
    universityId: p.universitySlug,
    programCode: "",
    locationRestrictions: [],
    recommendationLetterCount: 0,
    requiresPassportPhoto: false,
    requiresPassportId: false,
    requiresTranscripts: false,
    requiresHighestDegree: false,
    requiresPhysicalExam: false,
    requiresNonCriminalRecord: false,
    requiresEnglishCert: false,
    requiresApplicationForm: false,
    requiresStudyPlan: false,
    requiresRecommendations: false,
    university: {
      id: p.universitySlug,
      name: p.universityName,
      slug: p.universitySlug,
      city: p.city,
      province: p.province,
      ranking: null,
      logoUrl: null,
      coverUrl: null,
      website: null,
      description: null,
    },
    scholarships: p.scholarships.map((s, i) => ({
      id: `${p.id}-s${i}`,
      programId: p.id,
      category: "",
      duration: "",
      coversTuition: false,
      ...s,
    })) as import("@/types").Scholarship[],
  };
}

export function DiscoverClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = searchParams.get("view") ?? "card";
  const page = parseInt(searchParams.get("page") ?? "1");

  // ── Search input with debounce ──────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const prevSearchParam = useRef(searchParams.get("search") ?? "");

  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    if (!urlSearch && prevSearchParam.current) setSearchInput("");
    prevSearchParam.current = urlSearch;
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) { params.set("search", value.trim()); } else { params.delete("search"); }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 350);
  };

  // ── Load full index once on mount ──────────────────────────────────────────
  const [allPrograms, setAllPrograms] = useState<IndexProgram[]>([]);
  const [indexLoading, setIndexLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    fetch("/programs-index.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setAllPrograms(data.programs ?? []);
        setIndexLoading(false);
      })
      .catch(() => {
        setIndexError(true);
        setIndexLoading(false);
      });
  }, []);

  // ── Client-side filter — runs instantly on every searchParam change ────────
  const filtered = useMemo(() => {
    if (allPrograms.length === 0) return [];

    const search        = (searchParams.get("search") ?? "").toLowerCase();
    const degree        = searchParams.get("degree") ?? "";
    const language      = searchParams.get("language") ?? "";
    const field         = (searchParams.get("field") ?? "").toLowerCase();
    const province      = (searchParams.get("province") ?? "").toLowerCase();
    const city          = (searchParams.get("city") ?? "").toLowerCase();
    const universityName = (searchParams.get("universityName") ?? "").toLowerCase();
    const intakeSeason  = (searchParams.get("intakeSeason") ?? "").toLowerCase();
    const acceptsMinors = searchParams.get("acceptsMinors");
    const hasCscaScore  = searchParams.get("hasCscaScore");
    const hasScholarship = searchParams.get("hasScholarship") === "true";

    // Resolve city → province so programs without a city field still match
    const cityKey = Object.keys(CITY_TO_PROVINCE).find(k => k.toLowerCase() === city);
    const effectiveProvince = province || (city && cityKey ? CITY_TO_PROVINCE[cityKey].toLowerCase() : "");

    return allPrograms.filter((p) => {
      const uName = p.universityName.toLowerCase();
      const uCity = p.city.toLowerCase();
      const uProv = p.province.toLowerCase();

      if (search && !p.programName.toLowerCase().includes(search) &&
          !p.field.toLowerCase().includes(search) && !uName.includes(search) &&
          !uCity.includes(search)) return false;
      if (degree && p.degree !== degree) return false;
      if (language && p.teachingLanguage !== language) return false;
      if (field && !p.field.toLowerCase().includes(field)) return false;
      if (effectiveProvince && !uProv.includes(effectiveProvince)) return false;
      // Only sub-filter by city when the program actually has city data
      if (city && uCity.length > 0 && !uCity.includes(city)) return false;
      if (universityName && !uName.includes(universityName)) return false;
      if (intakeSeason && p.intakeSeason.toLowerCase() !== intakeSeason) return false;
      if (acceptsMinors === "true" && !p.acceptsMinors) return false;
      if (acceptsMinors === "false" && p.acceptsMinors) return false;
      if (hasCscaScore === "true" && !p.hasCscaScore) return false;
      if (hasCscaScore === "false" && p.hasCscaScore) return false;
      if (hasScholarship && p.scholarships.length === 0) return false;
      return true;
    });
  }, [allPrograms, searchParams]);

  // ── Paginate ───────────────────────────────────────────────────────────────
  const total = filtered.length;
  const totalPages = Math.ceil(total / LIMIT);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * LIMIT, page * LIMIT).map(toProgram),
    [filtered, page]
  );

  // ── Reset to page 1 when filters change ───────────────────────────────────
  const prevFilters = useRef("");
  useEffect(() => {
    const filters = searchParams.toString().replace(/page=\d+/, "");
    if (filters !== prevFilters.current) {
      prevFilters.current = filters;
    }
  }, [searchParams]);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") { params.delete(key); } else { params.set(key, value); }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );
  void updateFilter; // used by FilterSidebar via URL, not directly

  return (
    <div className="min-h-screen pt-36 pb-16">
      <div className="container-app">
        {/* Header */}
        <div className="mb-8">
          <div className="badge badge-accent mb-3">{t("discover_badge")}</div>
          <h1 className="text-4xl md:text-5xl font-heading font-black mb-3">
            {t("discover_title")}
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            {indexLoading
              ? t("discover_loading")
              : indexError
              ? t("discover_error")
              : `${total.toLocaleString()} of ${allPrograms.length.toLocaleString()} programs`}
          </p>
        </div>

        {/* Search + View Toggle */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-xl">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--color-text-tertiary)" }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("discover_search")}
              className="input-glass pl-10"
            />
          </div>
          <ViewToggle />
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside>
            <FilterSidebar />
          </aside>

          <div>
            {indexLoading ? (
              <LoadingSkeleton view={view} />
            ) : paginated.length === 0 ? (
              <EmptyState searchParams={searchParams} pathname={pathname} />
            ) : view === "list" ? (
              <>
                <ProgramListTable programs={paginated} />
                {totalPages > 1 && (
                  <PaginationBar page={page} totalPages={totalPages} searchParams={searchParams} />
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginated.map((program) => (
                    <UniversityCard key={program.id} program={program} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <PaginationBar page={page} totalPages={totalPages} searchParams={searchParams} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton({ view }: { view: string }) {
  if (view === "list") {
    return (
      <div className="rounded-2xl overflow-hidden animate-pulse" style={{ border: "1px solid var(--glass-border-subtle)" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3"
            style={{ borderBottom: "1px solid var(--glass-border-subtle)", background: i % 2 === 0 ? "var(--color-bg-primary)" : "var(--color-bg-secondary)" }}>
            <div className="h-4 rounded w-20" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-4 rounded flex-1 max-w-[220px]" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-4 rounded w-24" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-4 rounded w-16" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-4 rounded w-20" style={{ background: "var(--color-bg-tertiary)" }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
          style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--glass-border-subtle)", height: 320 }}>
          <div className="w-full h-44" style={{ background: "var(--color-bg-tertiary)" }} />
          <div className="p-4 space-y-3">
            <div className="h-4 rounded w-3/4" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-3 rounded w-1/2" style={{ background: "var(--color-bg-tertiary)" }} />
            <div className="h-3 rounded w-2/3" style={{ background: "var(--color-bg-tertiary)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PaginationBar({
  page, totalPages, searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  const buildHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `?${params.toString()}`;
  };
  return (
    <div className="flex justify-center gap-2 mt-10">
      {page > 1 && <a href={buildHref(page - 1)} className="btn-ghost text-sm">Previous</a>}
      <span className="px-4 py-2 text-sm rounded-xl glass" style={{ color: "var(--color-text-secondary)" }}>
        Page {page} of {totalPages}
      </span>
      {page < totalPages && <a href={buildHref(page + 1)} className="btn-ghost text-sm">Next</a>}
    </div>
  );
}

function EmptyState({
  searchParams,
  pathname,
}: {
  searchParams: ReturnType<typeof useSearchParams>;
  pathname: string;
}) {
  const province = searchParams.get("province");
  const city = searchParams.get("city");
  const search = searchParams.get("search");

  const clearLocationHref = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("province");
    p.delete("city");
    p.delete("page");
    return `${pathname}?${p.toString()}`;
  })();

  const clearAllHref = pathname;

  return (
    <div className="glass rounded-3xl p-16 text-center">
      <p className="font-heading font-bold text-lg mb-2">No programs match your filters</p>
      {city && province ? (
        <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
          No results for <strong>{city}</strong> in <strong>{province}</strong>.{" "}
          <a href={clearLocationHref} className="underline" style={{ color: "var(--color-accent-green)" }}>
            Browse all {province} programs
          </a>
        </p>
      ) : search ? (
        <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
          No programs found for &ldquo;{search}&rdquo;. Try a different keyword or clear your filters.
        </p>
      ) : (
        <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
          Try adjusting your search or clearing some filters.
        </p>
      )}
      <a href={clearAllHref} className="btn-ghost text-sm">Clear all filters</a>
    </div>
  );
}
