"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Spotlight } from "@/components/ui/motion";
import { useI18n } from "@/lib/i18n/provider";
import { cn, initials } from "@/lib/utils";
import type { ProjectWithThumbnail } from "@/lib/queries";

/* Distinct gradient palettes per project slot */
const PROJECT_GRADIENTS = [
  "from-accent/20 via-elevated to-blue/15",
  "from-blue/20 via-elevated to-violet/15",
  "from-violet/20 via-elevated to-accent/15",
  "from-emerald/15 via-elevated to-blue/15",
  "from-accent/15 via-elevated to-violet/20",
  "from-blue/15 via-elevated to-emerald/15",
];

export function ProjectCard({
  project,
  index = 0,
}: {
  project: ProjectWithThumbnail;
  index?: number;
}) {
  const { t } = useI18n();
  const gradient = PROJECT_GRADIENTS[index % PROJECT_GRADIENTS.length];
  const number = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="h-full"
      >
        <Spotlight className="h-full">
          <Card className="card-lift relative h-full overflow-hidden rounded-2xl border-border bg-surface/40 backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:shadow-[0_18px_56px_rgb(var(--accent-rgb)/0.16)]">
            {/* Accent edge that appears on hover */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-80"
              aria-hidden="true"
            />

            {/* Thumbnail */}
            <div className="relative aspect-[16/10] overflow-hidden bg-elevated">
              {project.thumbnail ? (
                <Image
                  src={project.thumbnail.url}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                />
              ) : (
                <div
                  className={cn(
                    "flex h-full w-full items-center justify-center bg-gradient-to-br",
                    gradient
                  )}
                >
                  {/* Abstract decorative SVG for no-image cards */}
                  <div className="relative flex h-full w-full items-center justify-center">
                    <svg
                      className="absolute inset-0 h-full w-full text-content opacity-25 transition-transform duration-700 group-hover:scale-105"
                      viewBox="0 0 400 250"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <defs>
                        <radialGradient id={`rg-${project.id}`} cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="rgb(var(--accent-rgb)/0.5)" />
                          <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                        <pattern
                          id={`dots-${project.id}`}
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle cx="1.5" cy="1.5" r="1" fill="currentColor" opacity="0.35" />
                        </pattern>
                      </defs>
                      <rect width="400" height="250" fill={`url(#dots-${project.id})`} />
                      <circle cx="200" cy="125" r="80" fill={`url(#rg-${project.id})`} />
                      <circle cx="200" cy="125" r="100" fill="none" stroke="rgb(var(--accent-rgb)/0.3)" strokeWidth="1" />
                      <circle cx="200" cy="125" r="130" fill="none" stroke="rgb(var(--accent-2-rgb)/0.22)" strokeWidth="1" />
                      <line x1="60" y1="60" x2="340" y2="190" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
                      <line x1="60" y1="190" x2="340" y2="60" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
                    </svg>
                    <span className="relative z-10 text-4xl font-extrabold text-gradient opacity-70 transition-transform duration-500 group-hover:scale-110">
                      {initials(project.title)}
                    </span>
                  </div>
                </div>
              )}

              {/* Gradient overlay at bottom: subtle always, stronger on hover */}
              <div
                className="absolute inset-x-0 bottom-0 h-24 opacity-40 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "linear-gradient(to top, rgba(8,9,13,0.7), transparent)" }}
                aria-hidden="true"
              />

              {project.isFeatured && (
                <span className="absolute left-3 top-3 z-10">
                  <Badge tone="accent">
                    <Icon name="Star" className="mr-1 h-3 w-3" /> {t("projects.featured")}
                  </Badge>
                </span>
              )}

              {/* Corner arrow that slides in on hover */}
              <span
                className="absolute right-3 top-3 z-10 flex h-9 w-9 -translate-y-1 items-center justify-center rounded-full border border-accent/30 bg-surface/90 text-accent opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:bg-surface/70 sm:backdrop-blur-md"
                aria-hidden="true"
              >
                <Icon name="ArrowRight" className="h-4 w-4 -rotate-45" />
              </span>
            </div>

            {/* Content */}
            <div className="relative flex flex-col gap-3 p-5 sm:p-6">
              {/* Soft corner glow on hover */}
              <div
                className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle, rgb(var(--accent-rgb) / 0.14) 0%, transparent 68%)",
                }}
                aria-hidden="true"
              />

              <div className="relative flex items-center justify-between gap-3">
                {project.category ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {project.category}
                  </span>
                ) : (
                  <span />
                )}
                <span className="font-mono text-xs tabular-nums text-faint">{number}</span>
              </div>

              <h3 className="relative text-lg font-bold leading-snug text-content transition-colors duration-200 group-hover:text-accent sm:text-xl">
                {project.title}
              </h3>
              {project.shortDescription && (
                <p className="relative line-clamp-2 text-sm leading-6 text-muted">
                  {project.shortDescription}
                </p>
              )}

              {project.technologies?.length ? (
                <div className="relative mt-1 flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-border bg-elevated px-2 py-0.5 font-mono text-[11px] text-muted transition-colors duration-200 group-hover:border-accent/25"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="rounded-md border border-border bg-elevated px-2 py-0.5 font-mono text-[11px] text-faint">
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>
              ) : null}

              <div className="relative mt-2 border-t border-border-subtle pt-4">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent/80 transition-colors group-hover:text-accent">
                  {t("projects.viewCaseStudy")}
                  <Icon
                    name="ArrowRight"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </div>
          </Card>
        </Spotlight>
      </motion.div>
    </Link>
  );
}