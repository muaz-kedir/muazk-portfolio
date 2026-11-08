import { prisma } from "@/lib/db";
import { AdminPage, PageHeader } from "@/components/admin/page";
import { MediaManager } from "@/components/admin/media-manager";
import { getI18n } from "@/lib/i18n/server";

/**
 * The admin dashboard always reads live rows from the database, so this
 * segment is allowed to block instead of being prerendered.
 */
export const instant = false;

export default async function AdminMediaPage() {
  const { t } = await getI18n();
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      url: true,
      originalName: true,
      mimeType: true,
      size: true,
      category: true,
      isPublic: true,
      createdAt: true,
    },
  });

  return (
    <AdminPage>
      <PageHeader
        title={t("admin.media.title")}
        description={t("admin.media.description")}
      />
      <div className="mt-8">
        <MediaManager media={media} />
      </div>
    </AdminPage>
  );
}
