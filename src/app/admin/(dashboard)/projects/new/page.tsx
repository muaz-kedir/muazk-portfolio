import { prisma } from "@/lib/db";
import { AdminPage, PageHeader } from "@/components/admin/page";
import { ProjectForm } from "@/components/admin/project-form";
import { getI18n } from "@/lib/i18n/server";

/**
 * The admin dashboard always reads live rows from the database, so this
 * segment is allowed to block instead of being prerendered.
 */
export const instant = false;

export default async function NewProjectPage() {
  const { t } = await getI18n();
  const mediaImages = await prisma.media.findMany({
    where: { isPublic: true, mimeType: { startsWith: "image/" } },
    select: { id: true, url: true, originalName: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminPage>
      <PageHeader
        title={t("admin.projects.newProject")}
        description={t("admin.projects.description")}
      />
      <div className="mt-8 max-w-3xl">
        <ProjectForm mediaImages={mediaImages} />
      </div>
    </AdminPage>
  );
}
