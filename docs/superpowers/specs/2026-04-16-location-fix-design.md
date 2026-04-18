# Location Fix Design Spec
**Date:** 2026-04-16  
**Status:** Approved  
**Subsystem:** Location Matching (Phase 1 of 5)

---

## Context

Users searching for universities in cities like "Hangzhou" or "Nanchang" get zero results. The bug is in `src/components/home/Hero.tsx:173`, which sets `province=Hangzhou` in the URL instead of `city=Hangzhou`. The root cause is that there is no city→province mapping anywhere in the codebase, and the Hero form uses the city name as the province filter.

Additionally, the user experience is fragmented: the FilterSidebar has two separate dropdowns (Province and City) with no relationship between them, making it easy to select conflicting values that produce 0 results.

**Goal:** Fix all location filtering to be structurally correct and give users a single, intuitive location picker with a Province (City) hierarchy.

---

## Architecture

### 1. Data Structure — `src/lib/constants.ts`

Replace the existing flat `CHINESE_PROVINCES` (string[]) and `CHINESE_CITIES` ({ city, count }[]) exports with a single hierarchical structure:

```typescript
export const CHINESE_LOCATIONS: {
  province: string;
  isMunicipality: boolean; // true for Beijing, Shanghai, Tianjin, Chongqing
  cities: { city: string; count: number }[];
}[] = [
  { province: "Beijing",   isMunicipality: true,  cities: [{ city: "Beijing",   count: 92 }] },
  { province: "Shanghai",  isMunicipality: true,  cities: [{ city: "Shanghai",  count: 68 }] },
  { province: "Zhejiang",  isMunicipality: false, cities: [{ city: "Hangzhou",  count: 60 }, ...] },
  { province: "Jiangxi",   isMunicipality: false, cities: [{ city: "Nanchang",  count: 31 }] },
  // ... all 31 provinces/municipalities
  // Source for city→province assignments: public/programs-index.json already has
  // correct {city, province} fields on every program record — extract unique pairs
  // from there to build the full mapping. Chinese administrative geography is static.
];

// Derived lookup — used by Hero.tsx and any code that needs city→province resolution
export const CITY_TO_PROVINCE: Record<string, string> =
  Object.fromEntries(
    CHINESE_LOCATIONS.flatMap(loc => loc.cities.map(c => [c.city, loc.province]))
  );
```

Backwards-compatibility: keep `CHINESE_PROVINCES` and `CHINESE_CITIES` as derived exports for any other code that references them, so we don't break anything.

```typescript
export const CHINESE_PROVINCES = CHINESE_LOCATIONS.map(l => l.province);
export const CHINESE_CITIES = CHINESE_LOCATIONS.flatMap(l => l.cities);
```

---

### 2. New Component — `src/components/ui/LocationPicker.tsx`

A client-side searchable dropdown that renders the province/city hierarchy.

**Props:**
```typescript
interface LocationPickerProps {
  value: { province?: string; city?: string } | null;
  onChange: (value: { province?: string; city?: string } | null) => void;
  placeholder?: string;
  className?: string;
}
```

**Behavior:**
- Search input at the top filters both provinces and cities in real time
- Provinces render as group headers (selectable)
- Cities render as indented items under their province
- Municipalities show as a single item (no sub-city indent)
- Selecting a province → emits `{ province: "Zhejiang" }`
- Selecting a city → emits `{ province: "Zhejiang", city: "Hangzhou" }`
- Display label: `"Zhejiang (Hangzhou)"` for city, `"Zhejiang"` for province, `"Beijing"` for municipality
- "Clear" button resets to null
- Styled using existing Tailwind + glass design tokens to match the rest of the FilterSidebar

---

### 3. Integration Points

#### `src/components/discovery/FilterSidebar.tsx`
- **Remove:** Province dropdown (lines 229–240) and City dropdown (lines 215–226)
- **Add:** Single `<LocationPicker>` bound to `{ province: filters.province, city: filters.city }`
- On picker change → call `onFilterChange({ province, city })` (both can be undefined on clear)

#### `src/components/home/Hero.tsx`
- **Remove:** City `<select>` element
- **Add:** `<LocationPicker>` in its place
- **Fix line 173:** Replace `p.set("province", form.city)` with:
  ```typescript
  if (location?.city)     p.set("city", location.city);
  if (location?.province) p.set("province", location.province);
  ```

#### `src/app/discover/DiscoverClient.tsx`
- **No changes needed.** The existing client-side filter already handles `province` and `city` as independent URL params. The bug was entirely in Hero.tsx conflating the two.

#### `src/app/api/programs/route.ts`
- **No changes needed.** Already supports both `province` and `city` query params independently.

---

## Data Flow

```
User picks "Hangzhou" in LocationPicker
    ↓
Picker emits { province: "Zhejiang", city: "Hangzhou" }
    ↓
Hero sets URL: ?province=Zhejiang&city=Hangzhou
    ↓
DiscoverClient reads both params
    ↓
Filter: program.province === "Zhejiang" AND program.city === "Hangzhou"
    ↓
Returns correct results (e.g., Zhejiang University programs)
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/constants.ts` | Replace flat CHINESE_PROVINCES + CHINESE_CITIES with CHINESE_LOCATIONS hierarchy; add CITY_TO_PROVINCE; keep backwards-compat derived exports |
| `src/components/ui/LocationPicker.tsx` | **New file** — hierarchical searchable location picker |
| `src/components/discovery/FilterSidebar.tsx` | Replace two dropdowns with LocationPicker |
| `src/components/home/Hero.tsx` | Replace city select with LocationPicker; fix line 173 |

**Files NOT changed:** `DiscoverClient.tsx`, `api/programs/route.ts`, `api/universities/route.ts`

---

## Verification

1. **Hero → City selection:** Select "Hangzhou" in Hero form → URL: `?province=Zhejiang&city=Hangzhou` → discover page shows Zhejiang programs (previously: 0 results)
2. **Hero → Province selection:** Select "Zhejiang" → URL: `?province=Zhejiang` → all Zhejiang programs appear
3. **Municipality:** Select "Beijing" → URL: `?province=Beijing` → Beijing programs appear (same as before, no regression)
4. **FilterSidebar:** Selecting a city from the picker returns correct results matching that city
5. **Clear:** Clearing the picker removes all location filters
6. **Backwards compatibility:** Any code referencing old `CHINESE_PROVINCES` or `CHINESE_CITIES` still works via derived exports

---

## Out of Scope (Future Specs)

- Auth system (Google/GitHub/Facebook OAuth)
- Analytics dashboard
- Search fallback logic
- n8n data structure integration