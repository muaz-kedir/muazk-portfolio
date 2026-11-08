import { prisma } from "@/lib/db";
import { AdminPage, PageHeader } from "@/components/admin/page";
import { SkillsManager } from "@/components/admin/skills-manager";
import { getI18n } from "@/lib/i18n/server";

/**
 * The admin dashboard always reads live rows from the database, so this
 * segment is allowed to block instead of being prerendered.
 */
export const instant = false;

export default async function AdminSkillsPage() {
  const { t } = await getI18n();
  const skills = await prisma.skill.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      icon: true,
      displayOrder: true,
      published: true,
      url: true,
      urlLabel: true,
    },
  });

  return (
    <AdminPage>
      <PageHeader
        title={t("admin.skills.title")}
        description={t("admin.skills.description")}
      />
      <div className="mt-8">
        <SkillsManager skills={skills} />
      </div>
    </AdminPage>
  );
}
