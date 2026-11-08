import Link from "next/link";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectCard } from "@/components/projects/project-card";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { getI18n } from "@/lib/i18n/server";
import type { ProjectWithThumbnail } from "@/lib/queries";

export async function FeaturedProjects({
  projects,
}: {
  projects: ProjectWithThumbnail[];
}) {
  const { t } = await getI18n();
  const list = projects.slice(0, 6);

  return (
    <section
      id="projects"
      className="section-divider relative scroll-mt-20 overflow-hidden"
    >
      {/* Background: glow at the bottom + faint grid (same language as Skills) */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[480px] w-[min(1100px,100%)] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgb(var(--accent-rgb) / 0.18) 0%, rgb(var(--accent-2-rgb) / 0.09) 45%, transparent 72%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--accent-2-rgb) / 0.10) 0%, transparent 68%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grid grid-mask opacity-20"
        aria-hidden="true"
      />

      <Container className="relative py-24">
        <FadeUp>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t("projects.eyebrow")}
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-content sm:text-4xl lg:text-5xl">
                {t("projects.titleLead")}{" "}
                <span className="text-gradient">{t("projects.titleAccent")}</span>
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
                {t("projects.description")}
              </p>
            </div>
            <Link
              href="/projects"
              className={`${buttonVariants("outline", "md")} group transition-all duration-300 hover:shadow-[0_0_24px_rgb(var(--accent-rgb)/0.18)]`}
            >
              {t("projects.viewAll")}
              <Icon
                name="ArrowRight"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Divider under the header */}
          <div
            className="mt-10 h-px bg-gradient-to-r from-accent/30 via-border to-transparent"
            aria-hidden="true"
          />
        </FadeUp>

        {list.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              icon="FolderKanban"
              title={t("projects.emptyTitle")}
              description={t("projects.emptyDescription")}
            />
          </div>
        ) : (
          <StaggerContainer
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            delay={0.1}
          >
            {list.map((p, i) => (
              <StaggerItem key={p.id}>
                <ProjectCard project={p} index={i} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </Container>
    </section>
  );
}