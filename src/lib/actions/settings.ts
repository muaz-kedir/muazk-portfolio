"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { settingsSchema, type SettingsInput } from "@/lib/validation/schemas";
import { mapZodErrors } from "@/lib/validation/format";
import { Prisma } from "@/generated/prisma/client";

export type SettingsResult = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function updateSettings(input: SettingsInput): Promise<SettingsResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { error: "errors.validationFailed", fieldErrors: mapZodErrors(parsed.error.issues) };
  const data = parsed.data;
  const row = {
    siteTitle: data.siteTitle,
    metaDescription: data.metaDescription,
    favicon: data.favicon,
    footerContent: data.footerContent,
    // Prisma Json fields require InputJsonValue — cast from the Zod-validated record
    socialLinks: data.socialLinks !== undefined ? (data.socialLinks as Prisma.InputJsonValue) : Prisma.JsonNull,
    contactEmail: data.contactEmail,
    themeAccent: data.themeAccent,
    cvVisible: data.cvVisible,
    socialImageId: data.socialImageId ?? null,
  };
  try {
    const existing = await prisma.siteSettings.findFirst();
    if (existing) {
      await prisma.siteSettings.update({ where: { id: existing.id }, data: row });
    } else {
      await prisma.siteSettings.create({ data: row });
    }
    updateTag("settings");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedUpdate" };
  }
}
