"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { skillSchema, type SkillInput } from "@/lib/validation/schemas";
import type { $ZodIssue } from "zod/v4/core";

export type SkillResult = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function createSkill(input: SkillInput): Promise<SkillResult> {
  await requireAdmin();
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) return { error: "errors.validationFailed", fieldErrors: mapErrors(parsed.error.issues) };
  try {
    await prisma.skill.create({ data: parsed.data });
    updateTag("skills");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedCreate" };
  }
}

export async function updateSkill(id: string, input: SkillInput): Promise<SkillResult> {
  await requireAdmin();
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) return { error: "errors.validationFailed", fieldErrors: mapErrors(parsed.error.issues) };
  try {
    await prisma.skill.update({
      where: { id },
      // `null` (not `undefined`) so clearing a link actually removes it.
      data: { ...parsed.data, url: parsed.data.url ?? null, urlLabel: parsed.data.urlLabel ?? null },
    });
    updateTag("skills");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedUpdate" };
  }
}

export async function deleteSkill(id: string): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.skill.delete({ where: { id } });
    updateTag("skills");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedDelete" };
  }
}

export async function toggleSkillPublished(id: string, published: boolean): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.skill.update({ where: { id }, data: { published } });
    updateTag("skills");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedUpdate" };
  }
}

function mapErrors(issues: $ZodIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path
      .filter((p): p is string | number => typeof p !== "symbol")
      .map(String)
      .join(".");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
