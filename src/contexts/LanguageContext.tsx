"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  Lang,
  LANGUAGES,
  TranslationKey,
  translations,
} from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved && translations[saved]) {
      applyLang(saved);
      setLangState(saved);
    }
  }, []);

  function applyLang(l: Lang) {
    const isRTL = LANGUAGES.find((x) => x.code === l)?.rtl ?? false;
    document.documentElement.setAttribute("lang", l);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  }

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
    applyLang(l);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return (translations[lang] as Record<string, string>)[key] ?? key;
    },
    [lang]
  );

  const isRTL = LANGUAGES.find((x) => x.code === lang)?.rtl ?? false;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
