import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { readUpload } from "@/lib/storage";

/**
 * Serve a stored file with access control.
 * Allowed when: the admin is signed in, the file is public, OR the file is a
 * published CV (profile.cvVisible && profile.cvFileId === media.id).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return new Response("Not found", { status: 404 });
  }

  const session = await getSession();
  let allowed = Boolean(session) || media.isPublic;

  if (!allowed && media.category === "CV") {
    const profile = await prisma.profile.findFirst({
      select: { cvVisible: true, cvFileId: true },
    });
    if (profile?.cvVisible && profile.cvFileId === media.id) {
      allowed = true;
    }
  }

  if (!allowed) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const buffer = await readUpload(media.storageKey);
    const isPdf = media.mimeType === "application/pdf";
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": media.mimeType,
        "Content-Disposition": isPdf
          ? `attachment; filename="${media.originalName ?? "file.pdf"}"`
          : "inline",
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new Response("File not available", { status: 404 });
  }
}
