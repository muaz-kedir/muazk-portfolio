import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "mukti_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const ALG = "HS256";

export interface Session {
  id: string;
  email: string;
  name: string | null;
}

function getRawSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not configured. Generate one (see .env.example) and set it in .env."
    );
  }
  return secret;
}

/**
 * Derive a Web Crypto CryptoKey from the AUTH_SECRET string.
 *
 * jose v6 dropped acceptance of raw Uint8Array keys for HS256 in favour of
 * the Web Crypto API.  We convert the secret bytes with importKey so that
 * signing works identically in Node.js 20+, Vitest (jsdom / node pool),
 * and the Edge runtime.
 */
async function getKey(): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(getRawSecret());
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Create a signed session token for an admin. */
export async function signSession(admin: Session): Promise<string> {
  const key = await getKey();
  return new SignJWT({ email: admin.email, name: admin.name ?? null })
    .setProtectedHeader({ alg: ALG })
    .setSubject(admin.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

/** Verify a raw token and return the session, or null if invalid/expired. */
export async function verifySessionToken(
  token: string | undefined
): Promise<Session | null> {
  if (!token) return null;
  try {
    const key = await getKey();
    const { payload } = await jwtVerify(token, key);
    const id = payload.sub;
    const email = payload.email;
    if (typeof id !== "string" || typeof email !== "string") return null;
    return {
      id,
      email,
      name: typeof payload.name === "string" ? payload.name : null,
    };
  } catch {
    return null;
  }
}

/** Read the current session from the request cookies (server components / actions). */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Set the HttpOnly session cookie (call from a Server Action or Route Handler). */
export async function setSessionCookie(admin: Session): Promise<void> {
  const token = await signSession(admin);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

/** Clear the session cookie (call from a Server Action or Route Handler). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  store.delete(SESSION_COOKIE);
}
