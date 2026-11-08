import { prisma } from "@/lib/db";
import { AdminPage, PageHeader } from "@/components/admin/page";
import { ExperienceManager } from "@/components/admin/experience-manager";
import { getI18n } from "@/lib/i18n/server";

/**
 * The admin dashboard always reads live rows from the database, so this
 * segment is allowed to block instead of being prerendered.
 */
export const instant = false;

export default async function AdminEducationPage() {
  const { t } = await getI18n();
  const items = await prisma.experience.findMany({
    where: { kind: "EDUCATION" },
    orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }],
  });

  return (
    <AdminPage>
      <PageHeader
        title={t("admin.experience.educationTitle")}
        description={t("admin.experience.educationDescription")}
      />
      <div className="mt-8">
        <ExperienceManager items={items} kinds={["EDUCATION"]} defaultKind="EDUCATION" />
      </div>
    </AdminPage>
  );
}
