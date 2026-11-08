"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { experienceSchema, type ExperienceInput } from "@/lib/validation/schemas";
import { mapZodErrors } from "@/lib/validation/format";

export type ExperienceResult = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function createExperience(input: ExperienceInput): Promise<ExperienceResult> {
  await requireAdmin();
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) return { error: "errors.validationFailed", fieldErrors: mapZodErrors(parsed.error.issues) };
  try {
    await prisma.experience.create({ data: parsed.data });
    updateTag("experience");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedCreate" };
  }
}

export async function updateExperience(id: string, input: ExperienceInput): Promise<ExperienceResult> {
  await requireAdmin();
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) return { error: "errors.validationFailed", fieldErrors: mapZodErrors(parsed.error.issues) };
  try {
    await prisma.experience.update({
      where: { id },
      // `null` (not `undefined`) so clearing a link actually removes it.
      data: { ...parsed.data, url: parsed.data.url ?? null, urlLabel: parsed.data.urlLabel ?? null },
    });
    updateTag("experience");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedUpdate" };
  }
}

export async function deleteExperience(id: string): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.experience.delete({ where: { id } });
    updateTag("experience");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedDelete" };
  }
}
