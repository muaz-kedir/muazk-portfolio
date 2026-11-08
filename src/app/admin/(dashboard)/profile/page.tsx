import { prisma } from "@/lib/db";
import { AdminPage, PageHeader } from "@/components/admin/page";
import { ProfileForm } from "@/components/admin/profile-form";
import { getI18n } from "@/lib/i18n/server";

/**
 * The admin dashboard always reads live rows from the database, so this
 * segment is allowed to block instead of being prerendered.
 */
export const instant = false;

export default async function AdminProfilePage() {
  const { t } = await getI18n();
  const profile =
    (await prisma.profile.findFirst()) ??
    null;

  const [mediaImages, mediaDocs] = await Promise.all([
    prisma.media.findMany({
      where: { isPublic: true, mimeType: { startsWith: "image/" } },
      select: { id: true, originalName: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.media.findMany({
      where: { category: "CV" },
      select: { id: true, originalName: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const initial = {
    name: profile?.name ?? "Mukti",
    title: profile?.title ?? null,
    eyebrow: profile?.eyebrow ?? null,
    heroHeadline: profile?.heroHeadline ?? null,
    heroDescription: profile?.heroDescription ?? null,
    bio: profile?.bio ?? null,
    interests: profile?.interests ?? null,
    approach: profile?.approach ?? null,
    learningGoals: profile?.learningGoals ?? null,
    ambitions: profile?.ambitions ?? null,
    education: profile?.education ?? null,
    publicEmail: profile?.publicEmail ?? null,
    githubUrl: profile?.githubUrl ?? null,
    linkedinUrl: profile?.linkedinUrl ?? null,
    isAvailable: profile?.isAvailable ?? true,
    aboutVisible: profile?.aboutVisible ?? true,
    cvVisible: profile?.cvVisible ?? false,
    profileImageId: profile?.profileImageId ?? null,
    cvFileId: profile?.cvFileId ?? null,
  };

  return (
    <AdminPage>
      <PageHeader
        title={t("admin.profile.title")}
        description={t("admin.profile.description")}
      />
      <div className="mt-8">
        <ProfileForm profile={initial} mediaImages={mediaImages} mediaDocs={mediaDocs} />
      </div>
    </AdminPage>
  );
}
