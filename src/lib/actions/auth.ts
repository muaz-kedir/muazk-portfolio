"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import {
  setSessionCookie,
  clearSessionCookie,
  getSession,
} from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/schemas";
import { rateLimit, getClientIp, envInt } from "@/lib/rate-limit";

export type LoginState = {
  ok?: boolean;
  error?: string;
  email?: string;
  /** Seconds to wait before retrying (rate limit). */
  retryAfterSeconds?: number;
};

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  if (await getSession()) redirect("/admin");

  const ip = await getClientIp();
  const rl = rateLimit(
    `login:${ip}`,
    envInt("RATE_LIMIT_LOGIN_PER_MINUTE", 5),
    60_000
  );
  if (!rl.ok) {
    return { error: "errors.tooManyAttempts", retryAfterSeconds: rl.retryAfterSeconds };
  }

  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "errors.invalidCredentials" };
  }

  const admin = await prisma.admin.findUnique({
    where: { email: parsed.data.email.trim().toLowerCase() },
  });
  // Constant-time-ish failure: still run a hash compare against a dummy.
  const ok = admin
    ? await verifyPassword(parsed.data.password, admin.passwordHash)
    : await verifyPassword(parsed.data.password, "$2b$12$abcdefghijklmnopqrstuv");
  if (!admin || !ok) {
    return { error: "errors.invalidCredentials" };
  }

  await setSessionCookie({
    id: admin.id,
    email: admin.email,
    name: admin.name ?? null,
  });
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}
