import Link from "next/link";
import { prisma } from "@/lib/db";
import { AdminPage, PageHeader } from "@/components/admin/page";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectActions } from "@/components/admin/project-actions";
import { getI18n } from "@/lib/i18n/server";
import { LANGUAGES } from "@/lib/i18n/config";
import { formatDate } from "@/lib/utils";

/**
 * The admin dashboard always reads live rows from the database, so this
 * segment is allowed to block instead of being prerendered.
 */
export const instant = false;

export default async function AdminProjectsPage() {
  const { t, locale } = await getI18n();
  const projects = await prisma.project.findMany({
    orderBy: [{ displayOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
      isFeatured: true,
      displayOrder: true,
      updatedAt: true,
    },
  });

  return (
    <AdminPage>
      <PageHeader
        title={t("admin.projects.title")}
        description={t("admin.projects.description")}
        action={
          <Link href="/admin/projects/new" className={buttonVariants("primary", "md")}>
            <Icon name="Plus" className="h-4 w-4" /> {t("admin.projects.newProject")}
          </Link>
        }
      />

      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="FolderKanban"
            title={t("admin.projects.emptyTitle")}
            description={t("admin.projects.emptyDescription")}
            action={
              <Link href="/admin/projects/new" className={buttonVariants("primary", "md")}>
                <Icon name="Plus" className="h-4 w-4" /> {t("admin.projects.newProject")}
              </Link>
            }
          />
        </div>
      ) : (
        <Card className="mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left text-xs uppercase tracking-wide text-faint">
                  <th className="px-4 py-3 font-medium">{t("admin.projects.colProject")}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.projects.colCategory")}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.projects.colStatus")}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.projects.colOrder")}</th>
                  <th className="px-4 py-3 font-medium">{t("admin.projects.colUpdated")}</th>
                  <th className="px-4 py-3 text-right font-medium">{t("admin.projects.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-border-subtle/50 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/projects/${p.id}/edit`}
                        className="flex items-center gap-2 font-medium text-content hover:text-accent"
                      >
                        {p.title}
                        {p.isFeatured ? (
                          <Badge tone="accent">
                            <Icon name="Star" className="mr-1 h-3 w-3" />
                            {t("admin.projects.featured")}
                          </Badge>
                        ) : null}
                      </Link>
                      <span className="text-xs text-faint">/{p.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.category || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">{p.displayOrder}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(p.updatedAt, undefined, LANGUAGES[locale].tag)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/projects/${p.id}/edit`}
                          className="text-muted hover:text-content"
                          aria-label={t("admin.common.edit")}
                        >
                          <Icon name="Pencil" className="h-4 w-4" />
                        </Link>
                        <ProjectActions id={p.id} status={p.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AdminPage>
  );
}
