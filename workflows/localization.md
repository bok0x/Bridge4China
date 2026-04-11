# Workflow: UI Localization & Language Management

**Objective:** Add, update, or validate translations for the ChinaUniMatch multi-language system (EN / AR / FR / RU).

---

## Architecture

### Translation Layer
- **Dictionary:** `src/lib/i18n.ts`  
  Flat key-value store, one object per language. All strings defined here.
- **Context:** `src/contexts/LanguageContext.tsx`  
  Provides `lang`, `setLang(code)`, `t(key)`, and `isRTL` to all client components.  
  Persists selection in `localStorage`. Sets `lang` + `dir` attributes on `<html>`.
- **Switcher:** `src/components/layout/LanguageSwitcher.tsx`  
  Glassy dropdown in Navbar. Shows flag + language code.

### Supported Languages
| Code | Language | RTL? |
|------|----------|------|
| `en` | English  | No   |
| `ar` | Arabic   | Yes  |
| `fr` | French   | No   |
| `ru` | Russian  | No   |

---

## How to Add a New Language

1. **Add metadata** in `src/lib/i18n.ts` → `LANGUAGES` array:
   ```ts
   { code: "zh", label: "Chinese", native: "中文", flag: "🇨🇳" }
   ```

2. **Add translation block** in the `translations` object:
   ```ts
   zh: {
     nav_discover: "发现",
     ...
   }
   ```

3. **Update the `Lang` type** to include the new code:
   ```ts
   export type Lang = "en" | "ar" | "fr" | "ru" | "zh";
   ```

4. **Verify** all keys are present by checking for TypeScript errors — the `t()` function is typed against `TranslationKey`.

---

## How to Add a New Translation Key

1. Add the key + English value to `translations.en` in `src/lib/i18n.ts`.
2. Add the same key to all other language blocks (`ar`, `fr`, `ru`).
3. Use the key in any client component via `const { t } = useLanguage()` → `t("your_new_key")`.

> **Rule:** Never hard-code visible UI strings in components. All text goes through `t()`.

---

## RTL Support

When language is `ar` (or any future RTL language where `rtl: true`):
- `document.documentElement.dir` is set to `"rtl"` by `LanguageContext`
- Tailwind's logical properties (e.g. `ms-auto`, `ps-4`) handle layout mirroring automatically
- Custom CSS should use `[dir="rtl"]` selectors for exceptions

---

## Edge Cases & Known Constraints

- **Server components** (e.g. original `UniversityGallery`) cannot use the language context directly. Convert to client component or pass language as a prop.
- **Static text in metadata** (page titles, OG tags in `layout.tsx`) is not yet translated — these remain in English until Next.js `generateMetadata` is updated.
- **Field-of-study names** (`FIELDS_OF_STUDY` in `constants.ts`) are English only — these map to the database; translating them requires a separate lookup table.

---

## Validation Checklist

Before deploying a language update:
- [ ] All keys in `translations.en` exist in `translations.ar`, `translations.fr`, `translations.ru`
- [ ] RTL layout checked in Arabic at mobile and desktop breakpoints
- [ ] LanguageSwitcher dropdown closes on outside click
- [ ] Language persists after page reload (localStorage key: `"lang"`)
- [ ] No hard-coded strings remain in Hero, Navbar, or other translated components
