"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import {
  saveUpload,
  deleteUpload,
  publicUrlFor,
  type UploadKind,
} from "@/lib/storage";

export type MediaResult = {
  ok?: boolean;
  error?: string;
  media?: {
    id: string;
    url: string;
    originalName: string | null;
    mimeType: string;
    size: number;
    category: string;
    isPublic: boolean;
  };
};

const VALID_CATEGORIES = [
  "PROFILE",
  "PROJECT_THUMBNAIL",
  "PROJECT_SCREENSHOT",
  "CV",
  "SOCIAL",
  "MISC",
] as const;

export async function uploadMedia(formData: FormData): Promise<MediaResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "errors.noFileProvided" };

  const categoryRaw = String(formData.get("category") ?? "MISC");
  const category = (VALID_CATEGORIES as readonly string[]).includes(categoryRaw)
    ? (categoryRaw as (typeof VALID_CATEGORIES)[number])
    : "MISC";
  const isPublic =
    category !== "CV" && String(formData.get("isPublic") ?? "true") !== "false";
  const kind: UploadKind = category === "CV" ? "document" : "image";

  try {
    const saved = await saveUpload(file, { isPublic, kind });
    const media = await prisma.media.create({
      data: {
        storageKey: saved.storageKey,
        url: isPublic
          ? saved.publicUrl ?? publicUrlFor(saved.fileName)
          : "/api/media/private/",
        originalName: saved.originalName,
        mimeType: saved.mimeType,
        size: saved.size,
        category,
        isPublic,
      },
    });
    let url = media.url;
    if (!isPublic) {
      url = `/api/media/private/${media.id}`;
      await prisma.media.update({ where: { id: media.id }, data: { url } });
    }
    revalidatePath("/admin/media");
    return {
      ok: true,
      media: {
        id: media.id,
        url,
        originalName: media.originalName,
        mimeType: media.mimeType,
        size: media.size,
        category: media.category,
        isPublic: media.isPublic,
      },
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.uploadFailed" };
  }
}

export async function deleteMedia(id: string): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  try {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return { ok: true };
    await deleteUpload(media.storageKey);
    await prisma.media.delete({ where: { id } });
    // Media can be referenced by the profile, a project thumbnail or the social image.
    updateTag("profile");
    updateTag("projects");
    updateTag("settings");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "errors.failedDelete" };
  }
}
