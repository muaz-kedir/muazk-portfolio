import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectCard } from "@/components/projects/project-card";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getI18n } from "@/lib/i18n/server";
import { getPublishedProjects } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.meta.projects,
    description: dict.meta.projectsDescription,
  };
}

async function ProjectsList() {
  const { t } = await getI18n();
  const projects = await getPublishedProjects();
  if (projects.length === 0) {
    return (
      <div className="mt-12">
        <EmptyState
          icon="FolderKanban"
          title={t("projects.emptyTitle")}
          description={t("projects.emptyDescription")}
        />
      </div>
    );
  }
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}

function ListFallback() {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
      ))}
    </div>
  );
}

export default async function ProjectsPage() {
  const { t } = await getI18n();

  return (
    <Container size="wide" className="py-16">
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-content"
        >
          <Icon name="ArrowRight" className="h-4 w-4 rotate-180" />
          {t("projects.backHome")}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-content sm:text-4xl">
          {t("projects.listTitle")}
        </h1>
        <p className="max-w-2xl text-muted">{t("projects.listDescription")}</p>
      </div>
      <Suspense fallback={<ListFallback />}>
        <ProjectsList />
      </Suspense>
    </Container>
  );
}
