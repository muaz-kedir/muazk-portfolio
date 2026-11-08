import type { $ZodIssue } from "zod/v4/core";

/**
 * Flatten Zod v4 issues into a { field: message } record.
 * Zod v4 changed ZodIssue.path to PropertyKey[] (string | number | symbol).
 * We filter out symbol keys — they never correspond to named form fields.
 */
export function mapZodErrors(
  issues: $ZodIssue[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path
      .filter((p): p is string | number => typeof p !== "symbol")
      .map(String)
      .join(".");
    if (key && !out[key]) out[key] = issue.message;
    if (!key && !out._form) out._form = issue.message;
  }
  return out;
}

/**
 * Return the first human-readable message from a Zod v4 error.
 */
export function firstZodError(issues: $ZodIssue[]): string {
  return issues[0]?.message ?? "errors.invalidInput";
}
