import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminPage, PageHeader } from "@/components/admin/page";
import { ProjectForm, type ProjectFormInitial } from "@/components/admin/project-form";
import { getI18n } from "@/lib/i18n/server";

/**
 * The admin dashboard always reads live rows from the database, so this
 * segment is allowed to block instead of being prerendered.
 */
export const instant = false;

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = await getI18n();
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      screenshots: { orderBy: { displayOrder: "asc" }, select: { mediaId: true } },
    },
  });
  if (!project) notFound();

  const mediaImages = await prisma.media.findMany({
    where: { isPublic: true, mimeType: { startsWith: "image/" } },
    select: { id: true, url: true, originalName: true },
    orderBy: { createdAt: "desc" },
  });

  const initial: ProjectFormInitial = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    description: project.description,
    category: project.category,
    role: project.role,
    technologies: project.technologies,
    features: project.features,
    overview: project.overview,
    problem: project.problem,
    targetUsers: project.targetUsers,
    goals: project.goals,
    architecture: project.architecture,
    challenges: project.challenges,
    testingNotes: project.testingNotes,
    futureImprovements: project.futureImprovements,
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
    status: project.status,
    isFeatured: project.isFeatured,
    displayOrder: project.displayOrder,
    thumbnailMediaId: project.thumbnailMediaId,
    screenshotIds: project.screenshots.map((s) => s.mediaId),
  };

  return (
    <AdminPage>
      <PageHeader
        title={t("admin.projects.editProject")}
        description={project.title}
      />
      <div className="mt-8 max-w-3xl">
        <ProjectForm project={initial} mediaImages={mediaImages} />
      </div>
    </AdminPage>
  );
}
