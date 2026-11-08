import { en } from "./dictionaries/en";
import { am } from "./dictionaries/am";
import { or } from "./dictionaries/or";
import type { Dictionary, Translate } from "./types";
import { DEFAULT_LOCALE, type Locale } from "./config";

export const dictionaries: Record<Locale, Dictionary> = { en, am, or };

/** Get the dictionary for a locale, falling back to English. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

function interpolate(value: string, params?: Record<string, string | number>): string {
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

/** Resolve a dot-path key inside a dictionary. Unknown keys fall back to the key. */
export function translate(
  dict: Dictionary,
  key: string,
  params?: Record<string, string | number>
): string {
  let cursor: unknown = dict;

  for (const part of key.split(".")) {
    if (cursor && typeof cursor === "object" && part in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  if (typeof cursor !== "string") return key;
  return interpolate(cursor, params);
}

/** Create a typed translate function bound to a dictionary. */
export function createTranslate(dict: Dictionary): Translate {
  return (key, params) => translate(dict, key, params);
}

/**
 * Translate a message that may be a dictionary key (used by server actions and
 * Zod schemas) or an arbitrary runtime string. Unknown strings are returned
 * untouched, so system errors never disappear.
 */
export function translateMessage(
  dict: Dictionary,
  message: string | undefined | null,
  params?: Record<string, string | number>
): string {
  if (!message) return "";
  const resolved = translate(dict, message, params);
  return resolved === message ? message : resolved;
}

export type { Dictionary, Translate } from "./types";
export * from "./config";
