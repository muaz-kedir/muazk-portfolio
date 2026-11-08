import { prisma } from "@/lib/db";
import { StatisticsManager } from "@/components/admin/statistics-manager";
import { AdminPage, PageHeader } from "@/components/admin/page";
import { getI18n } from "@/lib/i18n/server";

/**
 * The admin dashboard always reads live rows from the database, so this
 * segment is allowed to block instead of being prerendered.
 */
export const instant = false;

export default async function AdminStatisticsPage() {
  const { t } = await getI18n();

  const stats = await prisma.statistic.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <AdminPage>
      <PageHeader
        title={t("admin.statistics.title")}
      />
      <StatisticsManager stats={stats} />
    </AdminPage>
  );
}