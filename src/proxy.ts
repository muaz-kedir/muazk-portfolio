import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Next.js 16 Proxy (formerly Middleware).
 *
 * Performs an OPTIMISTIC redirect for `/admin` routes. It is NOT the real
 * authorization boundary — every admin Server Component and Server Action
 * independently verifies the session server-side via `requireAdmin()`.
 */

async function getKey(secret: string): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedAdmin =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isLogin = pathname === "/admin/login";

  if (isProtectedAdmin && !isLogin) {
    const rawSecret = process.env.AUTH_SECRET;
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    let ok = false;

    if (token && rawSecret) {
      try {
        const key = await getKey(rawSecret);
        await jwtVerify(token, key);
        ok = true;
      } catch {
        ok = false;
      }
    }

    if (!ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
