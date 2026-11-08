import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds: number;
}

/**
 * Simple in-memory fixed-window rate limiter.
 * Suitable for a single instance; for multi-instance production use Redis.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, limit, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0, limit, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { ok: true, remaining: limit - entry.count, limit, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
}

/** Best-effort client IP for rate limiting keys. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

export function envInt(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}
