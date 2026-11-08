import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "./config";
import { createTranslate, getDictionary } from "./index";

/**
 * Read the visitor's language preference from the request cookie.
 * Falls back to English for first-time visitors.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

/** Locale + dictionary + translate helper for Server Components. */
export async function getI18n() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return { locale, dict, t: createTranslate(dict) };
}
