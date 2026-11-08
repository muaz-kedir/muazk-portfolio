import { redirect } from "next/navigation";
import { getSession, type Session } from "./session";

/**
 * Require an authenticated administrator.
 *
 * This is the real authorization boundary. The proxy (`src/proxy.ts`) only
 * performs an optimistic redirect; every server-side mutation and admin server
 * component must call this (or `getSession()`) and verify permissions on the
 * server regardless of the client.
 */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export { getSession };
export type { Session };
