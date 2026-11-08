import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { getI18n } from "@/lib/i18n/server";
import { LANGUAGES } from "@/lib/i18n/config";
import { formatDate } from "@/lib/utils";
import type { Experience } from "@/lib/queries";

const KIND_ICON: Record<string, string> = {
  EDUCATION:        "GraduationCap",
  INTERNSHIP:       "Briefcase",
  EMPLOYMENT:       "Briefcase",
  CERTIFICATION:    "Award",
  TRAINING:         "GraduationCap",
  ACADEMIC_PROJECT: "FolderKanban",
  ACHIEVEMENT:      "Star",
};

/* Same kinds and colours as before. Each kind also carries a border, hover
   glow and corner tint (all class names written out in full for Tailwind). */
type KindStyle = {
  dot: string;
  glow: string;
  badge: string;
  iconBg: string;
  iconColor: string;
  border: string;
  corner: string;
  hover: string;
};

const BLUE: KindStyle = {
  dot: "bg-blue",
  glow: "text-blue",
  badge: "bg-blue/10 text-blue/90",
  iconBg: "bg-blue/10",
  iconColor: "text-blue",
  border: "border-blue/20",
  corner: "from-blue/12",
  hover: "hover:border-blue/40 hover:shadow-[0_12px_44px_rgb(var(--accent-2-rgb)/0.12)]",
};
const ACCENT: KindStyle = {
  dot: "bg-accent",
  glow: "text-accent",
  badge: "bg-accent/10 text-accent",
  iconBg: "bg-accent/10",
  iconColor: "text-accent",
  border: "border-accent/20",
  corner: "from-accent/12",
  hover: "hover:border-accent/40 hover:shadow-[0_12px_44px_rgb(var(--accent-rgb)/0.12)]",
};
const EMERALD: KindStyle = {
  dot: "bg-emerald",
  glow: "text-emerald",
  badge: "bg-emerald/10 text-emerald",
  iconBg: "bg-emerald/10",
  iconColor: "text-emerald",
  border: "border-emerald/20",
  corner: "from-emerald/12",
  hover: "hover:border-emerald/40 hover:shadow-[0_12px_44px_rgba(16,185,129,0.14)]",
};
const VIOLET: KindStyle = {
  dot: "bg-violet",
  glow: "text-violet",
  badge: "bg-violet/10 text-violet",
  iconBg: "bg-violet/10",
  iconColor: "text-violet",
  border: "border-violet/20",
  corner: "from-violet/12",
  hover: "hover:border-violet/40 hover:shadow-[0_12px_44px_rgba(167,139,250,0.14)]",
};

const KIND_COLOR: Record<string, KindStyle> = {
  EDUCATION: BLUE,
  INTERNSHIP: ACCENT,
  EMPLOYMENT: EMERALD,
  CERTIFICATION: VIOLET,
  TRAINING: BLUE,
  ACADEMIC_PROJECT: ACCENT,
  ACHIEVEMENT: VIOLET,
};

function getKindStyle(kind: string): KindStyle {
  return KIND_COLOR[kind] ?? ACCENT;
}

export async function ExperienceSection({ items }: { items: Experience[] }) {
  const { t, dict, locale } = await getI18n();
  const kindLabels = dict.experience.kinds as Record<string, string>;
  const dateLocale = LANGUAGES[locale].tag;
  if (items.length === 0) return null;

  /** Fallback label for the public link button, based on the record kind. */
  const defaultLinkLabel = (kind: string) =>
    kind === "CERTIFICATION"
      ? t("experience.links.certificate")
      : kind === "TRAINING" || kind === "ACADEMIC_PROJECT"
        ? t("experience.links.learnMore")
        : t("experience.links.details");

  return (
    <section
      id="experience"
      className="section-divider relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-transparent to-surface/15"
    >
      {/* Background glows (gradients only: no heavy blur filter) */}
      <div
        className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--accent-2-rgb) / 0.14) 0%, transparent 68%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--accent-rgb) / 0.10) 0%, transparent 68%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.10]"
        style={{
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 10%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 10%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <Container className="relative py-24">
        <FadeUp>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("experience.eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-content sm:text-4xl lg:text-5xl">
            {t("experience.titleLead")}{" "}
            <span className="text-gradient">{t("experience.titleAccent")}</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
            {t("experience.description")}
          </p>
        </FadeUp>

        {/* Timeline */}
        <StaggerContainer className="relative mt-14" delay={0.1}>
          {/* Vertical line */}
          <div
            className="pointer-events-none absolute left-5 top-0 w-px"
            style={{
              height: "100%",
              background:
                "linear-gradient(180deg, rgb(var(--accent-rgb)) 0%, rgb(var(--accent-2-rgb)) 50%, transparent 100%)",
              opacity: 0.35,
            }}
            aria-hidden="true"
          />
          {/* Travelling highlight */}
          <div
            className="pointer-events-none absolute left-5 top-0 h-24 w-px motion-reduce:hidden"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgb(var(--accent-rgb)/0.9), transparent)",
              animation: "aurora-drift 6s ease-in-out infinite",
            }}
            aria-hidden="true"
          />

          <div className="space-y-7 pl-14">
            {items.map((item) => {
              const style = getKindStyle(item.kind);
              return (
                <StaggerItem key={item.id}>
                  <div className="relative group">
                    {/* Timeline dot (glow now matches the dot colour) */}
                    <span
                      className={`absolute -left-[42px] top-5 h-3 w-3 rounded-full border-2 border-canvas ${style.dot} ${style.glow} shadow-[0_0_10px_3px_currentColor]`}
                      aria-hidden="true"
                    >
                      <span
                        className={`absolute inset-0 rounded-full ${style.dot} opacity-60 motion-reduce:hidden`}
                        style={{ animation: "pulse-ring 2.6s cubic-bezier(0.4,0,0.6,1) infinite" }}
                      />
                    </span>

                    {/* Connector from the dot to the card */}
                    <span
                      className={`pointer-events-none absolute -left-[30px] top-[26px] h-px w-[30px] bg-gradient-to-r from-current to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-90 ${style.glow}`}
                      aria-hidden="true"
                    />

                    <div
                      className={`glass card-lift relative overflow-hidden rounded-2xl border ${style.border} ${style.hover} p-6 transition-[border-color,box-shadow] duration-300 sm:p-7`}
                    >
                      {/* Coloured top edge */}
                      <div
                        className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-90 ${style.glow}`}
                        aria-hidden="true"
                      />
                      {/* Corner glow */}
                      <div
                        className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${style.corner} to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
                        aria-hidden="true"
                      />

                      <div className="relative flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${style.border} ${style.iconBg} ${style.iconColor} transition-transform duration-300 group-hover:scale-105`}
                          >
                            <Icon
                              name={KIND_ICON[item.kind] ?? "Briefcase"}
                              className="h-5 w-5"
                            />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold leading-snug text-content sm:text-lg">
                              {item.title}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                                {kindLabels[item.kind] ?? item.kind}
                              </span>
                              {item.organization && (
                                <span className="text-sm text-muted">
                                  {item.organization}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-lg border px-3 py-1 font-mono text-xs tabular-nums ${
                            item.current
                              ? "border-accent/30 bg-accent/10 text-accent"
                              : "border-border bg-elevated text-faint"
                          }`}
                        >
                          {formatDate(item.startDate, undefined, dateLocale)}
                          {item.current
                            ? ` — ${t("experience.present")}`
                            : item.endDate
                              ? ` — ${formatDate(item.endDate, undefined, dateLocale)}`
                              : ""}
                        </span>
                      </div>
                      {item.description && (
                        <p className="relative mt-4 text-sm leading-6 text-muted border-t border-border-subtle pt-3">
                          {item.description}
                        </p>
                      )}
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link relative mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-3.5 py-2 text-sm font-medium text-content shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-[0_4px_16px_rgb(var(--accent-rgb)/0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          {item.urlLabel || defaultLinkLabel(item.kind)}
                          <Icon
                            name="ArrowUpRight"
                            className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                          />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerContainer>
      </Container>
    </section>
  );
}