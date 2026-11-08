"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { statisticSchema, type StatisticInput } from "@/lib/validation/schemas";
import type { $ZodIssue } from "zod/v4/core";

export type StatisticResult = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function createStatistic(input: StatisticInput): Promise<StatisticResult> {
  await requireAdmin();
  const parsed = statisticSchema.safeParse(input);
  if (!parsed.success) return { error: "errors.validationFailed", fieldErrors: mapErrors(parsed.error.issues) };
  try {
    await prisma.statistic.create({ data: parsed.data });
    updateTag("statistics");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedCreate" };
  }
}

export async function updateStatistic(id: string, input: StatisticInput): Promise<StatisticResult> {
  await requireAdmin();
  const parsed = statisticSchema.safeParse(input);
  if (!parsed.success) return { error: "errors.validationFailed", fieldErrors: mapErrors(parsed.error.issues) };
  try {
    await prisma.statistic.update({
      where: { id },
      data: { ...parsed.data, published: parsed.data.published ?? undefined, isVisible: parsed.data.isVisible ?? undefined },
    });
    updateTag("statistics");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedUpdate" };
  }
}

export async function deleteStatistic(id: string): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.statistic.delete({ where: { id } });
    updateTag("statistics");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedDelete" };
  }
}

export async function toggleStatisticPublished(id: string, published: boolean): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.statistic.update({ where: { id }, data: { published } });
    updateTag("statistics");
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