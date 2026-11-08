import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ProjectCard } from "./project-card";
import { getI18n } from "@/lib/i18n/server";
import type { ProjectWithDetails, ProjectWithThumbnail } from "@/lib/queries";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 border-t border-border-subtle/40 py-10 lg:grid-cols-12">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-faint lg:col-span-4">
        {title}
      </h2>
      <div className="text-sm leading-7 text-muted lg:col-span-8">{children}</div>
    </div>
  );
}

export async function CaseStudy({
  project,
  related,
}: {
  project: ProjectWithDetails;
  related: ProjectWithThumbnail[];
}) {
  const { t } = await getI18n();
  const screenshots = project.screenshots;
  return (
    <article>
      <Container size="wide" className="py-12">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-content"
        >
          <Icon name="ArrowRight" className="h-4 w-4 rotate-180" />
          {t("projects.backToProjects")}
        </Link>

        <div className="mt-6 max-w-3xl">
          {project.category ? (
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {project.category}
            </span>
          ) : null}
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-content sm:text-5xl">
            {project.title}
          </h1>
          {project.shortDescription ? (
            <p className="mt-4 text-lg leading-8 text-muted">{project.shortDescription}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} />
            {project.role ? <Badge>{project.role}</Badge> : null}
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-content"
              >
                <Icon name="Github" className="h-4 w-4" /> {t("projects.source")}
              </a>
            ) : null}
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-content"
              >
                <Icon name="ExternalLink" className="h-4 w-4" /> {t("projects.liveDemo")}
              </a>
            ) : null}
          </div>
        </div>

        {screenshots.length > 0 ? (
          <div className="mt-10 grid gap-4">
            {screenshots.map((s) => (
              <div
                key={s.id}
                className="relative aspect-video overflow-hidden rounded-2xl border border-border-subtle bg-elevated"
              >
                <Image
                  src={s.media.url}
                  alt={s.caption ?? project.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
      </Container>

      <Container className="py-8">
        {project.description ? (
          <Section title={t("projects.sections.overview")}>
            <p className="text-base leading-8 text-content">{project.description}</p>
          </Section>
        ) : null}

        {project.problem ? (
          <Section title={t("projects.sections.problem")}>{project.problem}</Section>
        ) : null}
        {project.targetUsers ? (
          <Section title={t("projects.sections.targetUsers")}>{project.targetUsers}</Section>
        ) : null}
        {project.goals ? <Section title={t("projects.sections.goals")}>{project.goals}</Section> : null}

        {project.technologies?.length ? (
          <Section title={t("projects.sections.techStack")}>
            <ul className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <li
                  key={t}
                  className="rounded-lg border border-border-subtle bg-elevated px-3 py-1.5 text-sm text-content"
                >
                  {t}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {project.architecture ? (
          <Section title={t("projects.sections.architecture")}>{project.architecture}</Section>
        ) : null}

        {project.features?.length ? (
          <Section title={t("projects.sections.keyFeatures")}>
            <ul className="space-y-2">
              {project.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Icon name="CheckCircle2" className="mt-1 h-4 w-4 shrink-0 text-accent" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {project.challenges ? (
          <Section title={t("projects.sections.challenges")}>{project.challenges}</Section>
        ) : null}
        {project.testingNotes ? (
          <Section title={t("projects.sections.testing")}>{project.testingNotes}</Section>
        ) : null}
        {project.futureImprovements ? (
          <Section title={t("projects.sections.future")}>{project.futureImprovements}</Section>
        ) : null}
      </Container>

      {(project.githubUrl || project.liveUrl) ? (
        <Container className="py-6">
          <div className="flex flex-wrap gap-3">
            {project.githubUrl ? (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants("secondary", "md")}>
                <Icon name="Github" className="h-4 w-4" /> {t("projects.viewSource")}
              </a>
            ) : null}
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants("primary", "md")}>
                <Icon name="ExternalLink" className="h-4 w-4" /> {t("projects.visitLiveDemo")}
              </a>
            ) : null}
          </div>
        </Container>
      ) : null}

      {related.length > 0 ? (
        <Container size="wide" className="py-16">
          <h2 className="text-xl font-semibold text-content">{t("projects.related")}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Container>
      ) : null}
    </article>
  );
}
