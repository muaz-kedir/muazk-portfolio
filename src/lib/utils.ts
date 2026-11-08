import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Convert a title to a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Make a slug unique against an existing set, returning e.g. `my-slug-2`. */
export function uniqueSlug(base: string, existing: Iterable<string>): string {
  const taken = new Set(existing);
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

/** Format a date as e.g. "Mar 2024" or "2024 — present". */
export function formatDate(
  date: Date | string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" },
  locale = "en-US"
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, opts).format(d);
}

/** Build an absolute URL from the configured SITE_URL. */
export function absoluteUrl(path = "/"): string {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Truncate a string to a max length, adding an ellipsis when needed. */
export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

/** Initials from a name, e.g. "Mukti" -> "M". */
export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Parse a comma- or newline-separated list into a clean string array. */
export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
