import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import {
  FadeUp,
  Spotlight,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/motion";
import { getI18n } from "@/lib/i18n/server";
import type { Service } from "@/lib/queries";

/* Cycle through accent colours for variety — every colour follows the theme */
const CARD_ACCENTS = [
  {
    border: "border-accent/25",
    hoverBorder: "hover:border-accent/50",
    iconBg: "bg-accent/10",
    iconBorder: "border-accent/25",
    iconColor: "text-accent",
    glow: "rgb(var(--accent-rgb)/0.22)",
    line: "linear-gradient(90deg, rgb(var(--accent-rgb)/0.85), transparent)",
    hoverShadow: "hover:shadow-[0_16px_56px_rgb(var(--accent-rgb)/0.20)]",
  },
  {
    border: "border-accent-2/25",
    hoverBorder: "hover:border-accent-2/50",
    iconBg: "bg-accent-2/10",
    iconBorder: "border-accent-2/25",
    iconColor: "text-accent-2",
    glow: "rgb(var(--accent-2-rgb)/0.2)",
    line: "linear-gradient(90deg, rgb(var(--accent-2-rgb)/0.8), transparent)",
    hoverShadow: "hover:shadow-[0_16px_56px_rgb(var(--accent-2-rgb)/0.16)]",
  },
  {
    border: "border-violet/25",
    hoverBorder: "hover:border-violet/50",
    iconBg: "bg-violet/10",
    iconBorder: "border-violet/25",
    iconColor: "text-violet",
    glow: "rgba(167,139,250,0.2)",
    line: "linear-gradient(90deg, rgba(167,139,250,0.75), transparent)",
    hoverShadow: "hover:shadow-[0_16px_56px_rgba(167,139,250,0.16)]",
  },
  {
    border: "border-emerald/25",
    hoverBorder: "hover:border-emerald/50",
    iconBg: "bg-emerald/10",
    iconBorder: "border-emerald/25",
    iconColor: "text-emerald",
    glow: "rgb(16 185 129 / 0.18)",
    line: "linear-gradient(90deg, rgb(16 185 129 / 0.7), transparent)",
    hoverShadow: "hover:shadow-[0_16px_56px_rgb(16_185_129/0.14)]",
  },
  {
    border: "border-accent/20",
    hoverBorder: "hover:border-accent/45",
    iconBg: "bg-accent/10",
    iconBorder: "border-accent/20",
    iconColor: "text-accent",
    glow: "rgb(var(--accent-rgb)/0.16)",
    line: "linear-gradient(90deg, rgb(var(--accent-rgb)/0.65), transparent)",
    hoverShadow: "hover:shadow-[0_16px_56px_rgb(var(--accent-rgb)/0.14)]",
  },
  {
    border: "border-accent-2/20",
    hoverBorder: "hover:border-accent-2/45",
    iconBg: "bg-accent-2/10",
    iconBorder: "border-accent-2/20",
    iconColor: "text-accent-2",
    glow: "rgb(var(--accent-2-rgb)/0.16)",
    line: "linear-gradient(90deg, rgb(var(--accent-2-rgb)/0.65), transparent)",
    hoverShadow: "hover:shadow-[0_16px_56px_rgb(var(--accent-2-rgb)/0.14)]",
  },
];

export async function Services({ services }: { services: Service[] }) {
  const { t } = await getI18n();
  if (services.length === 0) return null;

  return (
    <section id="services" className="section-divider relative scroll-mt-20 overflow-hidden">
      {/* Atmospheric background (gradients only: no heavy blur filter) */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[640px] w-[min(720px,100%)]"
        style={{
          background:
            "radial-gradient(ellipse at 100% 0%, rgb(var(--accent-rgb) / 0.18) 0%, rgb(var(--accent-2-rgb) / 0.08) 45%, transparent 72%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--accent-2-rgb) / 0.10) 0%, transparent 68%)",
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-grid grid-mask opacity-20" aria-hidden="true" />

      <Container className="relative py-24">
        <FadeUp>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("services.eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-content sm:text-4xl lg:text-5xl">
            {t("services.titleLead")}{" "}
            <span className="text-gradient">{t("services.titleAccent")}</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
            {t("services.description")}
          </p>
          <div
            className="mt-10 h-px bg-gradient-to-r from-accent/30 via-border to-transparent"
            aria-hidden="true"
          />
        </FadeUp>

        <StaggerContainer className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" delay={0.1}>
          {services.map((s, i) => {
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
            return (
              <StaggerItem key={s.id}>
                <Spotlight className="h-full">
                  <div
                    className={`group relative h-full overflow-hidden rounded-2xl border ${accent.border} ${accent.hoverBorder} ${accent.hoverShadow} bg-surface/60 p-7 transition-all duration-300 hover:-translate-y-1.5 sm:p-8 sm:backdrop-blur-sm`}
                  >
                    {/* Coloured top edge */}
                    <div
                      className={`absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-90 ${accent.iconColor}`}
                      aria-hidden="true"
                    />

                    {/* Corner accent */}
                    <div
                      className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full opacity-50 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: `radial-gradient(circle at top right, ${accent.glow}, transparent 70%)` }}
                      aria-hidden="true"
                    />

                    {/* Index number */}
                    <span
                      className="pointer-events-none absolute right-6 top-5 select-none font-mono text-xs font-semibold tabular-nums text-faint"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div
                      className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border ${accent.iconBorder} ${accent.iconBg} ${accent.iconColor} transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_24px_currentColor]`}
                    >
                      <Icon name={s.icon} className="h-7 w-7" />
                    </div>

                    <h3 className="relative text-lg font-semibold leading-snug text-content">
                      {s.title}
                    </h3>
                    <div
                      className={`relative mt-3 h-px w-10 bg-current opacity-50 transition-all duration-500 group-hover:w-20 ${accent.iconColor}`}
                      aria-hidden="true"
                    />
                    {s.description && (
                      <p className="relative mt-4 text-sm leading-6 text-muted">{s.description}</p>
                    )}

                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link relative mt-6 inline-flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-3.5 py-2 text-sm font-medium text-content shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-[0_4px_16px_rgb(var(--accent-rgb)/0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        {s.urlLabel || t("services.learnMore")}
                        <Icon
                          name="ArrowUpRight"
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                        />
                      </a>
                    ) : null}

                    {/* Bottom accent line */}
                    <div
                      className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
                      style={{ background: accent.line }}
                      aria-hidden="true"
                    />
                  </div>
                </Spotlight>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </Container>
    </section>
  );
}

export async function ServicesEmpty({ message }: { message: string }) {
  const { t } = await getI18n();
  return (
    <section className="section-divider">
      <Container className="py-24">
        <EmptyState icon="Wrench" title={t("services.emptyTitle")} description={message} />
      </Container>
    </section>
  );
}