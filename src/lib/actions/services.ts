"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { serviceSchema, type ServiceInput } from "@/lib/validation/schemas";
import { mapZodErrors } from "@/lib/validation/format";

export type ServiceResult = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function createService(input: ServiceInput): Promise<ServiceResult> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { error: "errors.validationFailed", fieldErrors: mapZodErrors(parsed.error.issues) };
  try {
    await prisma.service.create({ data: parsed.data });
    updateTag("services");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedCreate" };
  }
}

export async function updateService(id: string, input: ServiceInput): Promise<ServiceResult> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { error: "errors.validationFailed", fieldErrors: mapZodErrors(parsed.error.issues) };
  try {
    await prisma.service.update({
      where: { id },
      // `null` (not `undefined`) so clearing a link actually removes it.
      data: { ...parsed.data, url: parsed.data.url ?? null, urlLabel: parsed.data.urlLabel ?? null },
    });
    updateTag("services");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedUpdate" };
  }
}

export async function deleteService(id: string): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.service.delete({ where: { id } });
    updateTag("services");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedDelete" };
  }
}
