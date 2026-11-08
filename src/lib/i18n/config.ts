/**
 * Multilingual UI configuration.
 *
 * The portfolio ships three interface languages: English, Amharic and Afaan
 * Oromoo. Translations live in `dictionaries/` as plain TypeScript objects —
 * no database, API or backend changes are required, and switching languages is
 * a purely client-side preference persisted in a cookie + localStorage.
 */

export const LOCALES = ["en", "am", "or"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie read on the server during SSR (keeps the first paint correctly translated). */
export const LOCALE_COOKIE = "site-locale";

/** localStorage mirror, used when cookies are unavailable. */
export const LOCALE_STORAGE_KEY = "site-locale";

export type LanguageMeta = {
  /** Two-letter code shown in the compact switcher. */
  short: string;
  /** Endonym — the language's name in its own script. */
  native: string;
  /** English name, shown as a secondary label. */
  english: string;
  /** BCP-47 tag used for `Intl` formatting and the `lang` attribute. */
  tag: string;
  dir: "ltr" | "rtl";
};

export const LANGUAGES: Record<Locale, LanguageMeta> = {
  en: { short: "EN", native: "English", english: "English", tag: "en-US", dir: "ltr" },
  am: { short: "AM", native: "አማርኛ", english: "Amharic", tag: "am-ET", dir: "ltr" },
  or: { short: "OR", native: "Afaan Oromoo", english: "Afaan Oromoo", tag: "om-ET", dir: "ltr" },
};

/** Ordered list used by the language switcher. */
export const LANGUAGE_LIST: Locale[] = [...LOCALES];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Normalise an arbitrary value to a supported locale. */
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
