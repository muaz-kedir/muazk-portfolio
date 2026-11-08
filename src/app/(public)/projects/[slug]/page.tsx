import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { CaseStudy } from "@/components/projects/case-study";
import {
  getPublishedProjectBySlug,
  getRelatedProjects,
} from "@/lib/queries";
import { getI18n } from "@/lib/i18n/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug).catch(() => null);
  if (!project) {
    const { dict } = await getI18n();
    return { title: dict.meta.projectNotFound };
  }
  return {
    title: project.title,
    description: project.shortDescription ?? project.description ?? undefined,
    openGraph: {
      title: project.title,
      description: project.shortDescription ?? undefined,
      images: project.thumbnail ? [project.thumbnail.url] : undefined,
    },
  };
}

async function ProjectContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project || project.status !== "PUBLISHED") {
    notFound();
  }
  const related = await getRelatedProjects(slug, project.category);
  return <CaseStudy project={project} related={related} />;
}

function ContentFallback() {
  return (
    <Container className="py-12">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="mt-6 h-12 w-2/3" />
      <Skeleton className="mt-4 h-4 w-1/2" />
      <Skeleton className="mt-10 aspect-video w-full rounded-2xl" />
    </Container>
  );
}

export default function ProjectPage({ params }: Props) {
  return (
    <Suspense fallback={<ContentFallback />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}
