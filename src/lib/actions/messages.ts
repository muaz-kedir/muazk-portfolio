"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { contactSchema, replySchema, type ContactInput } from "@/lib/validation/schemas";
import { mapZodErrors, firstZodError } from "@/lib/validation/format";
import { rateLimit, getClientIp, envInt } from "@/lib/rate-limit";
import { sendContactNotification } from "@/lib/email";

export type ContactState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Seconds to wait before retrying (rate limit). */
  retryAfterSeconds?: number;
};

/** Public contact form submission. Not authenticated; rate-limited. */
export async function submitContact(
  _prevState: ContactState | undefined,
  formData: FormData
): Promise<ContactState> {
  const ip = await getClientIp();
  const rl = rateLimit(
    `contact:${ip}`,
    envInt("RATE_LIMIT_CONTACT_PER_MINUTE", 5),
    60_000
  );
  if (!rl.ok) {
    return { error: "errors.tooManyMessages", retryAfterSeconds: rl.retryAfterSeconds };
  }

  const parsed = contactSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    inquiryType: String(formData.get("inquiryType") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    company: String(formData.get("company") ?? ""),
  });

  if (!parsed.success) {
    return { error: firstZodError(parsed.error.issues), fieldErrors: mapZodErrors(parsed.error.issues) };
  }

  // Honeypot tripped — pretend success without storing.
  if (parsed.data.company) {
    return { ok: true };
  }

  try {
    const msg = await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        inquiryType: parsed.data.inquiryType,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    });

    const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL;
    if (notifyEmail) {
      await sendContactNotification({
        to: notifyEmail,
        replyTo: parsed.data.email,
        subject: `[Portfolio] ${parsed.data.subject}`,
        text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\nType: ${parsed.data.inquiryType}\n\n${parsed.data.message}`,
      });
    }

    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    // We deliberately don't claim email delivery to the visitor.
    void msg;
    return { ok: true };
  } catch {
    return { error: "errors.contactFailed" };
  }
}

// --- Admin inbox operations ------------------------------------------------

export async function markMessageRead(id: string, isRead: boolean): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.contactMessage.update({ where: { id }, data: { isRead } });
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedUpdate" };
  }
}

export async function archiveMessage(id: string, isArchived: boolean): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.contactMessage.update({ where: { id }, data: { isArchived } });
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedUpdate" };
  }
}

export async function deleteMessage(id: string): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.contactMessage.delete({ where: { id } });
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedDelete" };
  }
}

export async function replyToMessage(input: { id: string; adminReply: string }): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return { error: firstZodError(parsed.error.issues) };
  try {
    await prisma.contactMessage.update({
      where: { id: parsed.data.id },
      data: { adminReply: parsed.data.adminReply ?? null, isRead: true },
    });
    revalidatePath("/admin/messages");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedSaveReply" };
  }
}
