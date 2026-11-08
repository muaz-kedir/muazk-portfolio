import { prisma } from "@/lib/db";
import { AdminPage, PageHeader } from "@/components/admin/page";
import { SettingsForm } from "@/components/admin/settings-form";
import { getI18n } from "@/lib/i18n/server";

/**
 * The admin dashboard always reads live rows from the database, so this
 * segment is allowed to block instead of being prerendered.
 */
export const instant = false;

export default async function AdminSettingsPage() {
  const { t } = await getI18n();
  const settings = await prisma.siteSettings.findFirst();

  const mediaImages = await prisma.media.findMany({
    where: { isPublic: true, mimeType: { startsWith: "image/" } },
    select: { id: true, originalName: true },
    orderBy: { createdAt: "desc" },
  });

  const initial = {
    siteTitle: settings?.siteTitle ?? "Mukti — Software Engineer",
    metaDescription: settings?.metaDescription ?? null,
    favicon: settings?.favicon ?? "/favicon.ico",
    footerContent: settings?.footerContent ?? null,
    contactEmail: settings?.contactEmail ?? null,
    themeAccent: settings?.themeAccent ?? "blue",
    cvVisible: settings?.cvVisible ?? false,
    socialImageId: settings?.socialImageId ?? null,
  };

  return (
    <AdminPage>
      <PageHeader
        title={t("admin.settings.title")}
        description={t("admin.settings.description")}
      />
      <div className="mt-8">
        <SettingsForm settings={initial} mediaImages={mediaImages} />
      </div>
    </AdminPage>
  );
}
