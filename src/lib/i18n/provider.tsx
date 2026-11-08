"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LANGUAGES,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  isLocale,
  type Locale,
} from "./config";
import { createTranslate, getDictionary } from "./index";
import type { Dictionary, Translate } from "./types";

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
  t: Translate;
  setLocale: (next: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const ONE_YEAR = 60 * 60 * 24 * 365;

function persistLocale(locale: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  } catch {
    /* cookies disabled — localStorage below still keeps the preference */
  }
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* storage unavailable */
  }
}

export function LanguageProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const restored = useRef(false);

  /* Keep the document language attribute in sync for screen readers. */
  useEffect(() => {
    document.documentElement.lang = LANGUAGES[locale].tag.split("-")[0];
    document.documentElement.dir = LANGUAGES[locale].dir;
  }, [locale]);

  /* Restore a preference saved locally when the cookie is missing (e.g. cleared). */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(stored) && stored !== initialLocale) {
        persistLocale(stored);
        queueMicrotask(() => setLocaleState(stored));
        router.refresh();
      }
    } catch {
      /* storage unavailable */
    }
  }, [initialLocale, router]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      setLocaleState(next);
      persistLocale(next);
      /* Re-render Server Components with the new language (no full reload). */
      router.refresh();
    },
    [locale, router]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dict: getDictionary(locale),
      t: createTranslate(getDictionary(locale)),
      setLocale,
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access the active language, its dictionary and the translate helper. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <LanguageProvider>");
  }
  return ctx;
}
