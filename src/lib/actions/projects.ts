"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { projectSchema, type ProjectInput } from "@/lib/validation/schemas";
import { slugify, uniqueSlug } from "@/lib/utils";
import type { $ZodIssue } from "zod/v4/core";

export type ProjectMutationResult = {
  ok?: boolean;
  id?: string;
  slug?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function computeSlug(title: string, slug: string | undefined, excludeId?: string): Promise<string> {
  const base = slugify(slug?.trim() || slugify(title) || "project");
  const existing = await prisma.project.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
    select: { slug: true },
  });
  return uniqueSlug(base, existing.map((p) => p.slug));
}

export async function createProject(input: ProjectInput): Promise<ProjectMutationResult> {
  await requireAdmin();
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "errors.validationFailed", fieldErrors: mapErrors(parsed.error.issues) };
  }
  const data = parsed.data;
  const slug = await computeSlug(data.title, data.slug);
  try {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug,
        shortDescription: data.shortDescription,
        description: data.description,
        category: data.category,
        role: data.role,
        overview: data.overview,
        problem: data.problem,
        targetUsers: data.targetUsers,
        goals: data.goals,
        architecture: data.architecture,
        challenges: data.challenges,
        testingNotes: data.testingNotes,
        futureImprovements: data.futureImprovements,
        technologies: data.technologies,
        features: data.features,
        githubUrl: data.githubUrl,
        liveUrl: data.liveUrl,
        status: data.status,
        isFeatured: data.isFeatured,
        displayOrder: data.displayOrder,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        thumbnailMediaId: data.thumbnailMediaId ?? null,
      },
    });
    await syncScreenshots(project.id, data.screenshotIds);
    updateTag("projects");
    revalidatePath("/", "layout");
    return { ok: true, id: project.id, slug };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedCreate" };
  }
}

export async function updateProject(id: string, input: ProjectInput): Promise<ProjectMutationResult> {
  await requireAdmin();
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return { error: "errors.notFound" };
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "errors.validationFailed", fieldErrors: mapErrors(parsed.error.issues) };
  }
  const data = parsed.data;
  const slug = await computeSlug(data.title, data.slug, id);
  try {
    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data: {
          title: data.title,
          slug,
          shortDescription: data.shortDescription,
          description: data.description,
          category: data.category,
          role: data.role,
          overview: data.overview,
          problem: data.problem,
          targetUsers: data.targetUsers,
          goals: data.goals,
          architecture: data.architecture,
          challenges: data.challenges,
          testingNotes: data.testingNotes,
          futureImprovements: data.futureImprovements,
          technologies: data.technologies,
          features: data.features,
          githubUrl: data.githubUrl,
          liveUrl: data.liveUrl,
          status: data.status,
          isFeatured: data.isFeatured,
          displayOrder: data.displayOrder,
          thumbnailMediaId: data.thumbnailMediaId ?? null,
          publishedAt:
            data.status === "PUBLISHED" && !existing.publishedAt
              ? new Date()
              : existing.publishedAt,
        },
      });
      await tx.projectScreenshot.deleteMany({ where: { projectId: id } });
      for (let i = 0; i < data.screenshotIds.length; i += 1) {
        await tx.projectScreenshot.create({
          data: { projectId: id, mediaId: data.screenshotIds[i], displayOrder: i },
        });
      }
    });
    updateTag("projects");
    revalidatePath("/", "layout");
    return { ok: true, id, slug };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedUpdate" };
  }
}

export async function deleteProject(id: string): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    await prisma.project.delete({ where: { id } });
    updateTag("projects");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedDelete" };
  }
}

export async function setProjectStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED"
): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return { error: "errors.notFound" };
    await prisma.project.update({
      where: { id },
      data: {
        status,
        publishedAt:
          status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });
    updateTag("projects");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.changeStatus" };
  }
}

async function syncScreenshots(projectId: string, mediaIds: string[]): Promise<void> {
  for (let i = 0; i < mediaIds.length; i += 1) {
    await prisma.projectScreenshot.create({
      data: { projectId, mediaId: mediaIds[i], displayOrder: i },
    });
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
