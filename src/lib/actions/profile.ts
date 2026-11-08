"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { profileSchema, type ProfileInput } from "@/lib/validation/schemas";
import { mapZodErrors } from "@/lib/validation/format";
import { Prisma } from "@/generated/prisma/client";

export type ProfileResult = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function updateProfile(input: ProfileInput): Promise<ProfileResult> {
  await requireAdmin();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: "errors.validationFailed", fieldErrors: mapZodErrors(parsed.error.issues) };
  const data = parsed.data;
  const row = {
    name: data.name,
    title: data.title,
    eyebrow: data.eyebrow,
    heroHeadline: data.heroHeadline,
    heroDescription: data.heroDescription,
    bio: data.bio,
    interests: data.interests,
    approach: data.approach,
    learningGoals: data.learningGoals,
    ambitions: data.ambitions,
    education: data.education,
    publicEmail: data.publicEmail,
    githubUrl: data.githubUrl,
    linkedinUrl: data.linkedinUrl,
    // Prisma Json fields require InputJsonValue — cast from the Zod-validated record
    otherLinks: data.otherLinks !== undefined ? (data.otherLinks as Prisma.InputJsonValue) : Prisma.JsonNull,
    isAvailable: data.isAvailable,
    aboutVisible: data.aboutVisible,
    cvVisible: data.cvVisible,
    profileImageId: data.profileImageId ?? null,
    cvFileId: data.cvFileId ?? null,
  };
  try {
    const existing = await prisma.profile.findFirst();
    if (existing) {
      await prisma.profile.update({ where: { id: existing.id }, data: row });
    } else {
      await prisma.profile.create({ data: row });
    }
    updateTag("profile");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedUpdate" };
  }
}
