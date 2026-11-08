import { prisma } from "@/lib/db";
import { AdminPage, PageHeader } from "@/components/admin/page";
import { ExperienceManager } from "@/components/admin/experience-manager";
import { getI18n } from "@/lib/i18n/server";

const EXPERIENCE_KINDS = [
  "INTERNSHIP",
  "EMPLOYMENT",
  "CERTIFICATION",
  "TRAINING",
  "ACADEMIC_PROJECT",
  "ACHIEVEMENT",
];

/**
 * The admin dashboard always reads live rows from the database, so this
 * segment is allowed to block instead of being prerendered.
 */
export const instant = false;

export default async function AdminExperiencePage() {
  const { t } = await getI18n();
  const items = await prisma.experience.findMany({
    where: { kind: { not: "EDUCATION" } },
    orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }],
  });

  return (
    <AdminPage>
      <PageHeader
        title={t("admin.experience.title")}
        description={t("admin.experience.description")}
      />
      <div className="mt-8">
        <ExperienceManager items={items} kinds={EXPERIENCE_KINDS} defaultKind="EMPLOYMENT" />
      </div>
    </AdminPage>
  );
}
