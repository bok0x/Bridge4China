# Location Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the silent 0-results bug for city searches and replace fragmented Province + City dropdowns with a single hierarchical LocationPicker throughout the app.

**Architecture:** Add a `CHINESE_LOCATIONS` hierarchy to constants.ts (all 31 provinces + their cities + a derived `CITY_TO_PROVINCE` lookup). Create a `LocationPicker` React component. Wire it into `FilterSidebar` (replacing two broken dropdowns) and `Hero` (replacing the city select and fixing the root bug at line 173). `DiscoverClient` and the API routes need zero changes — they already handle `province` and `city` as independent URL params.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion (not used here), Lucide icons (MapPin, ChevronDown, X already available)

**Note on testing:** The project has no test runner configured (no jest/vitest in package.json). All verification is done via `npm run dev` + browser checks listed in each task.

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `src/lib/constants.ts` | Add `CHINESE_LOCATIONS`, `CITY_TO_PROVINCE`; keep old exports as derived aliases |
| Create | `src/components/ui/LocationPicker.tsx` | New hierarchical searchable picker component |
| Modify | `src/components/discovery/FilterSidebar.tsx` | Remove Province + City dropdowns; add `LocationPicker` |
| Modify | `src/components/home/Hero.tsx` | Remove city `<select>`; add `LocationPicker`; fix line 173 bug |

---

## Task 1: Add CHINESE_LOCATIONS to constants.ts

**Files:**
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Replace the two flat exports with the hierarchical structure**

Open `src/lib/constants.ts`. Replace the entire `CHINESE_PROVINCES` and `CHINESE_CITIES` blocks (lines 26–102) with:

```typescript
// ── Location hierarchy: all 31 provinces + their university cities ──────────
export const CHINESE_LOCATIONS: {
  province: string;
  isMunicipality: boolean;
  cities: { city: string; count: number }[];
}[] = [
  // Municipalities (city name === province name)
  { province: "Beijing",      isMunicipality: true,  cities: [{ city: "Beijing",      count: 92 }] },
  { province: "Shanghai",     isMunicipality: true,  cities: [{ city: "Shanghai",     count: 68 }] },
  { province: "Tianjin",      isMunicipality: true,  cities: [{ city: "Tianjin",      count: 57 }] },
  { province: "Chongqing",    isMunicipality: true,  cities: [{ city: "Chongqing",    count: 65 }] },
  // Provinces sorted by total program count
  { province: "Hubei",        isMunicipality: false, cities: [{ city: "Wuhan",        count: 83 }] },
  { province: "Guangdong",    isMunicipality: false, cities: [{ city: "Guangzhou",    count: 83 }, { city: "Shenzhen", count: 14 }] },
  { province: "Henan",        isMunicipality: false, cities: [{ city: "Zhengzhou",    count: 67 }] },
  { province: "Shaanxi",      isMunicipality: false, cities: [{ city: "Xi'an",        count: 63 }] },
  { province: "Sichuan",      isMunicipality: false, cities: [{ city: "Chengdu",      count: 58 }] },
  { province: "Anhui",        isMunicipality: false, cities: [{ city: "Hefei",        count: 54 }] },
  { province: "Jiangxi",      isMunicipality: false, cities: [{ city: "Nanchang",     count: 54 }] },
  { province: "Jiangsu",      isMunicipality: false, cities: [
    { city: "Nanjing",     count: 53 },
    { city: "Suzhou",      count: 26 },
    { city: "Wuxi",        count: 12 },
    { city: "Xuzhou",      count: 12 },
    { city: "Changzhou",   count: 11 },
  ]},
  { province: "Hunan",        isMunicipality: false, cities: [{ city: "Changsha",     count: 52 }] },
  { province: "Heilongjiang", isMunicipality: false, cities: [{ city: "Harbin",       count: 51 }] },
  { province: "Zhejiang",     isMunicipality: false, cities: [
    { city: "Hangzhou",    count: 47 },
    { city: "Ningbo",      count: 15 },
    { city: "Wenzhou",     count: 11 },
  ]},
  { province: "Liaoning",     isMunicipality: false, cities: [{ city: "Shenyang",     count: 45 }, { city: "Dalian", count: 30 }] },
  { province: "Yunnan",       isMunicipality: false, cities: [{ city: "Kunming",      count: 45 }] },
  { province: "Hebei",        isMunicipality: false, cities: [{ city: "Shijiazhuang", count: 44 }] },
  { province: "Shandong",     isMunicipality: false, cities: [{ city: "Jinan",        count: 43 }, { city: "Qingdao", count: 25 }] },
  { province: "Shanxi",       isMunicipality: false, cities: [{ city: "Taiyuan",      count: 41 }] },
  { province: "Fujian",       isMunicipality: false, cities: [{ city: "Fuzhou",       count: 36 }, { city: "Xiamen", count: 16 }] },
  { province: "Guizhou",      isMunicipality: false, cities: [{ city: "Guiyang",      count: 35 }] },
  { province: "Guangxi",      isMunicipality: false, cities: [{ city: "Nanning",      count: 35 }] },
  { province: "Gansu",        isMunicipality: false, cities: [{ city: "Lanzhou",      count: 30 }] },
  { province: "Nei Mongol",   isMunicipality: false, cities: [{ city: "Hohhot",       count: 24 }] },
  { province: "Xinjiang",     isMunicipality: false, cities: [{ city: "Urumqi",       count: 26 }] },
  { province: "Ningxia",      isMunicipality: false, cities: [{ city: "Yinchuan",     count: 18 }] },
  { province: "Hainan",       isMunicipality: false, cities: [{ city: "Haikou",       count: 13 }] },
  { province: "Qinghai",      isMunicipality: false, cities: [{ city: "Xining",       count: 12 }] },
  { province: "Jilin",        isMunicipality: false, cities: [] },
  { province: "Tibet",        isMunicipality: false, cities: [{ city: "Lhasa",        count:  7 }] },
];

/** Derived: city name → province name. "Hangzhou" → "Zhejiang" */
export const CITY_TO_PROVINCE: Record<string, string> = Object.fromEntries(
  CHINESE_LOCATIONS.flatMap((loc) => loc.cities.map((c) => [c.city, loc.province]))
);

// ── Backwards-compatible aliases (existing imports keep working) ─────────────
/** @deprecated Use CHINESE_LOCATIONS instead */
export const CHINESE_PROVINCES = CHINESE_LOCATIONS.map((l) => l.province);

/** @deprecated Use CHINESE_LOCATIONS instead */
export const CHINESE_CITIES: { city: string; count: number }[] =
  CHINESE_LOCATIONS.flatMap((l) => l.cities);
```

- [ ] **Step 2: Verify the build still compiles**

```bash
cd "f:/Claude Project/ChinaUniMatch" && npx tsc --noEmit
```

Expected: no errors. If you see errors about missing `CHINESE_PROVINCES` or `CHINESE_CITIES`, the backwards-compat aliases are not in scope — recheck the export placement.

- [ ] **Step 3: Quick sanity check on the lookup**

In a Node REPL or by adding a `console.log` temporarily at the bottom of constants.ts:
```typescript
// Temporary check — delete after verifying
console.log(CITY_TO_PROVINCE["Hangzhou"]); // → "Zhejiang"
console.log(CITY_TO_PROVINCE["Nanchang"]); // → "Jiangxi"
console.log(CITY_TO_PROVINCE["Wuhan"]);    // → "Hubei"
```

- [ ] **Step 4: Remove the temporary log and commit**

```bash
git add src/lib/constants.ts
git commit -m "feat: add CHINESE_LOCATIONS hierarchy and CITY_TO_PROVINCE lookup"
```

---

## Task 2: Create LocationPicker component

**Files:**
- Create: `src/components/ui/LocationPicker.tsx`

- [ ] **Step 1: Create the file with the full component**

Create `src/components/ui/LocationPicker.tsx` with the following content:

```tsx
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
              // OR not searching (show all), OR it's a municipality
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
                          {loc.province} ({c.city})
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "f:/Claude Project/ChinaUniMatch" && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/LocationPicker.tsx
git commit -m "feat: add LocationPicker component with province/city hierarchy"
```

---

## Task 3: Wire LocationPicker into FilterSidebar

**Files:**
- Modify: `src/components/discovery/FilterSidebar.tsx`

- [ ] **Step 1: Update the import line**

In `FilterSidebar.tsx`, find this line (line 7):
```typescript
import { FIELDS_OF_STUDY, CHINESE_PROVINCES, CHINESE_CITIES } from "@/lib/constants";
```

Replace it with:
```typescript
import { FIELDS_OF_STUDY } from "@/lib/constants";
import { LocationPicker, type LocationValue } from "@/components/ui/LocationPicker";
```

- [ ] **Step 2: Replace the City and Province filter groups**

Find and remove the City block (lines 214–226):
```tsx
        {/* City */}
        <FilterGroup label="City">
          <select
            value={currentCity}
            onChange={(e) => updateFilter("city", e.target.value || null)}
            className="input-glass text-xs py-2"
          >
            <option value="">All Cities</option>
            {CHINESE_CITIES.map(({ city, count }) => (
              <option key={city} value={city}>{city} ({count})</option>
            ))}
          </select>
        </FilterGroup>
```

Find and remove the Province block (lines 228–240):
```tsx
        {/* Province */}
        <FilterGroup label="Province">
          <select
            value={currentProvince ?? ""}
            onChange={(e) => updateFilter("province", e.target.value || null)}
            className="input-glass text-xs py-2"
          >
            <option value="">All Provinces</option>
            {CHINESE_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </FilterGroup>
```

Replace both removed blocks with this single block (insert where City was):
```tsx
        {/* Location — replaces separate City + Province dropdowns */}
        <FilterGroup label="Location">
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
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "f:/Claude Project/ChinaUniMatch" && npx tsc --noEmit
```

Expected: no errors. If you see an error about `currentCity` or `currentProvince` being unused, they are still used in the LocationPicker `value` prop — double-check you haven't removed those variable declarations from lines 60–61.

- [ ] **Step 4: Start dev server and verify filter sidebar**

```bash
npm run dev
```

Open `http://localhost:3000/discover` in a browser.

Check:
- Filter sidebar shows a "Location" section with the LocationPicker (no more separate Province / City dropdowns)
- Clicking the picker opens a dropdown with province headers and city sub-items
- Typing "Hang" narrows to "Zhejiang (Hangzhou)"
- Selecting "Zhejiang (Hangzhou)" closes the dropdown and shows the label; URL gains `?province=Zhejiang&city=Hangzhou`; program list updates correctly
- Selecting "Zhejiang" (province only) shows all Zhejiang programs
- Clicking "Clear location" removes both params from the URL

- [ ] **Step 5: Commit**

```bash
git add src/components/discovery/FilterSidebar.tsx
git commit -m "feat: replace Province+City dropdowns in FilterSidebar with LocationPicker"
```

---

## Task 4: Fix Hero.tsx — replace city select and patch root bug

**Files:**
- Modify: `src/components/home/Hero.tsx`

- [ ] **Step 1: Update the import line**

In `Hero.tsx`, find line 12:
```typescript
import { FIELDS_OF_STUDY, CHINESE_CITIES, WHATSAPP_URL } from "@/lib/constants";
```

Replace with:
```typescript
import { FIELDS_OF_STUDY, WHATSAPP_URL } from "@/lib/constants";
import { LocationPicker, type LocationValue } from "@/components/ui/LocationPicker";
```

- [ ] **Step 2: Replace `city` in form state with a separate `location` state**

Find the form state declaration (around line 143):
```typescript
  const [form, setForm] = useState({
    lastDegree: "",
    gpa:        "",
    field:      "",
    degree:     "",
    city:       "",
    language:   "",
    scholarship: false,
  });
```

Replace with (add `location` state above `form`):
```typescript
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [form, setForm] = useState({
    lastDegree: "",
    gpa:        "",
    field:      "",
    degree:     "",
    language:   "",
    scholarship: false,
  });
```

- [ ] **Step 3: Fix handleSubmit — replace the broken line 173**

Find the `handleSubmit` function (around lines 167–176):
```typescript
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (form.field)                                   p.set("field",          form.field);
    if (form.degree)                                  p.set("degree",         form.degree);
    if (form.language && form.language !== "any")     p.set("language",       form.language);
    if (form.city)                                    p.set("province",       form.city);
    if (form.scholarship)                             p.set("hasScholarship", "true");
    router.push(`/discover?${p.toString()}`);
  }
```

Replace with:
```typescript
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (form.field)                                p.set("field",          form.field);
    if (form.degree)                               p.set("degree",         form.degree);
    if (form.language && form.language !== "any")  p.set("language",       form.language);
    if (location?.province)                        p.set("province",       location.province);
    if (location?.city)                            p.set("city",           location.city);
    if (form.scholarship)                          p.set("hasScholarship", "true");
    router.push(`/discover?${p.toString()}`);
  }
```

- [ ] **Step 4: Replace the city `<select>` in the JSX with LocationPicker**

Find the city select block in step 2 of the form (around lines 494–510):
```tsx
                      {/* City / Province */}
                      <div>
                        <FieldLabel label={t("city")} />
                        <select
                          className="input-glass w-full"
                          value={form.city}
                          onChange={(e) => set("city", e.target.value)}
                        >
                          <option value="">{t("anywhere")}</option>
                          {CHINESE_CITIES.map(({ city, count }) => (
                            <option key={city} value={city}>
                              {city} ({count})
                            </option>
                          ))}
                        </select>
                      </div>
```

Replace with:
```tsx
                      {/* Location — province or city */}
                      <div>
                        <FieldLabel label={t("city")} />
                        <LocationPicker
                          value={location}
                          onChange={setLocation}
                          placeholder={t("anywhere")}
                          className="w-full"
                        />
                      </div>
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd "f:/Claude Project/ChinaUniMatch" && npx tsc --noEmit
```

Expected: no errors. Common issue: if `form.city` is still referenced anywhere (e.g., in the `set()` helper), remove those references.

- [ ] **Step 6: Test the hero form end-to-end**

Ensure the dev server is running (`npm run dev`). Open `http://localhost:3000`.

Test case A — City search (the original bug):
1. Complete step 1 (pick any last degree + GPA)
2. Click "Next"
3. In the Location picker, select "Zhejiang (Hangzhou)"
4. Click "Find My Matches"
5. Expected URL: `/discover?province=Zhejiang&city=Hangzhou`
6. Expected result: Zhejiang University programs appear (previously: 0 results)

Test case B — Province only:
1. In Location picker, select "Zhejiang" (the province header, not a city)
2. Submit
3. Expected URL: `/discover?province=Zhejiang` (no city param)
4. Expected: all Zhejiang programs (Hangzhou + Ningbo + Wenzhou universities)

Test case C — Municipality:
1. Select "Beijing" in the picker
2. Submit
3. Expected URL: `/discover?province=Beijing`
4. Expected: Beijing programs still appear (no regression)

Test case D — No location:
1. Leave picker empty
2. Submit
3. Expected URL: `/discover?` (no province, no city)
4. Expected: all programs shown

- [ ] **Step 7: Commit**

```bash
git add src/components/home/Hero.tsx
git commit -m "fix: replace city select with LocationPicker in Hero; fix province/city URL params"
```

---

## Task 5: Final regression check

- [ ] **Step 1: Verify discover page direct URL navigation**

Navigate directly to these URLs and verify the program counts:

| URL | Expected |
|-----|----------|
| `/discover?city=Nanchang` | Jiangxi programs (Nanchang universities) |
| `/discover?province=Jiangsu` | All Jiangsu programs (Nanjing, Suzhou, Wuxi, Xuzhou, Changzhou) |
| `/discover?province=Fujian&city=Xiamen` | Only Xiamen programs |
| `/discover?degree=MASTER&province=Zhejiang` | Master programs in Zhejiang |
| `/discover` | All 10,222 programs |

- [ ] **Step 2: Verify FilterSidebar + Hero picker are in sync**

1. Go to `/discover`
2. Use FilterSidebar to select "Guangdong (Shenzhen)"
3. Verify URL: `?province=Guangdong&city=Shenzhen`
4. Go back to homepage, select "Guangdong (Shenzhen)" in Hero
5. Verify same URL structure after submit

- [ ] **Step 3: Verify backwards-compat exports still work**

No action needed if TypeScript compiled without errors in earlier tasks — the derived exports guarantee this.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -p
git commit -m "fix: location picker regression fixes"
```

---

## Spec Coverage Checklist

| Spec requirement | Covered by |
|-----------------|------------|
| Fix Hero.tsx:173 bug | Task 4 Step 3 |
| Add CITY_TO_PROVINCE mapping | Task 1 Step 1 |
| Province (City) display format | Task 2 (LocationPicker renders `"Zhejiang (Hangzhou)"`) |
| Replace FilterSidebar dropdowns | Task 3 |
| Replace Hero city select | Task 4 Step 4 |
| Municipalities shown as single items | Task 2 (`isMunicipality` branch) |
| Clear button | Task 2 (`select(null)` on clear) |
| Backwards compat for CHINESE_PROVINCES / CHINESE_CITIES | Task 1 Step 1 (derived exports) |
| DiscoverClient unchanged | Not a task — confirmed no changes needed |
| API routes unchanged | Not a task — confirmed no changes needed |