import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { FadeUp, Marquee, Spotlight, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { getI18n } from "@/lib/i18n/server";
import type { Skill } from "@/lib/queries";

/* Same categories and colour tokens as before. Only the visuals are richer:
   each category now also has a soft corner glow and a matching icon bubble. */
const CATEGORY_COLORS: Record<
  string,
  { border: string; icon: string; bubble: string; corner: string; hoverShadow: string }
> = {
  Frontend: {
    border: "border-blue/20",
    icon: "text-blue",
    bubble: "bg-blue/10",
    corner: "from-blue/15",
    hoverShadow: "hover:border-blue/40 hover:shadow-[0_10px_44px_rgb(var(--accent-2-rgb)/0.12)]",
  },
  Backend: {
    border: "border-accent/20",
    icon: "text-accent",
    bubble: "bg-accent/10",
    corner: "from-accent/15",
    hoverShadow: "hover:border-accent/40 hover:shadow-[0_10px_44px_rgb(var(--accent-rgb)/0.12)]",
  },
  Mobile: {
    border: "border-violet/20",
    icon: "text-violet",
    bubble: "bg-violet/10",
    corner: "from-violet/15",
    hoverShadow: "hover:border-violet/40 hover:shadow-[0_10px_44px_rgba(167,139,250,0.14)]",
  },
  Database: {
    border: "border-emerald/20",
    icon: "text-emerald",
    bubble: "bg-emerald/10",
    corner: "from-emerald/15",
    hoverShadow: "hover:border-emerald/40 hover:shadow-[0_10px_44px_rgba(16,185,129,0.14)]",
  },
  DevOps: {
    border: "border-accent/15",
    icon: "text-accent",
    bubble: "bg-accent/10",
    corner: "from-accent/10",
    hoverShadow: "hover:border-accent/35 hover:shadow-[0_10px_44px_rgb(var(--accent-rgb)/0.10)]",
  },
  Tools: {
    border: "border-blue/15",
    icon: "text-blue",
    bubble: "bg-blue/10",
    corner: "from-blue/10",
    hoverShadow: "hover:border-blue/35 hover:shadow-[0_10px_44px_rgb(var(--accent-2-rgb)/0.10)]",
  },
};

function getCategoryStyle(cat: string) {
  return (
    CATEGORY_COLORS[cat] ?? {
      border: "border-border",
      icon: "text-accent",
      bubble: "bg-accent/10",
      corner: "from-accent/10",
      hoverShadow: "hover:border-accent/30 hover:shadow-[0_10px_44px_rgb(var(--accent-rgb)/0.08)]",
    }
  );
}

const PILL =
  "group/pill mx-2 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/60 py-1.5 pl-1.5 pr-4 text-sm font-medium text-muted shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:text-content hover:shadow-[0_6px_24px_rgb(var(--accent-rgb)/0.15)]";

const PILL_ICON =
  "flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors duration-300 group-hover/pill:bg-accent/20";

const CHIP =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-3 py-1.5 text-sm font-medium text-content shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-[0_4px_16px_rgb(var(--accent-rgb)/0.14)]";

export async function Skills({ skills }: { skills: Skill[] }) {
  const { t, dict } = await getI18n();
  const categoryLabels = dict.skills.categories as Record<string, string>;

  const byCategory = new Map<string, Skill[]>();
  for (const s of skills) {
    const list = byCategory.get(s.category) ?? [];
    list.push(s);
    byCategory.set(s.category, list);
  }
  const groups = Array.from(byCategory.entries());

  return (
    <section
      id="skills"
      className="section-divider relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-surface/20 to-transparent"
    >
      {/* Background: soft glow + faint grid */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-[min(1000px,100%)] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgb(var(--accent-rgb) / 0.18) 0%, rgb(var(--accent-2-rgb) / 0.09) 45%, transparent 72%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12]"
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
            {t("skills.eyebrow")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-content sm:text-4xl lg:text-5xl">
            {t("skills.titleLead")}{" "}
            <span className="text-gradient">{t("skills.titleAccent")}</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
            {t("skills.description")}
          </p>
        </FadeUp>

        {groups.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              icon="Wrench"
              title={t("skills.emptyTitle")}
              description={t("skills.emptyDescription")}
            />
          </div>
        ) : (
          <>
            {/* Infinite technology marquee (edges fade out) */}
            <FadeUp delay={0.1}>
              <div
                className="mt-12"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                }}
              >
                <Marquee>
                  {groups.flatMap(([, items]) => items).map((s) =>
                    s.url ? (
                      <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.urlLabel || s.name}
                        className={PILL}
                      >
                        <span className={PILL_ICON}>
                          <Icon name={s.icon} className="h-4 w-4" />
                        </span>
                        {s.name}
                        <Icon name="ExternalLink" className="h-3 w-3 text-accent" />
                      </a>
                    ) : (
                      <span key={s.id} className={PILL}>
                        <span className={PILL_ICON}>
                          <Icon name={s.icon} className="h-4 w-4" />
                        </span>
                        {s.name}
                      </span>
                    )
                  )}
                </Marquee>
              </div>
            </FadeUp>

            <StaggerContainer className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" delay={0.1}>
              {groups.map(([category, items]) => {
                const style = getCategoryStyle(category);
                return (
                  <StaggerItem key={category}>
                    <Spotlight className="h-full">
                      <div
                        className={`card-lift group/card relative h-full overflow-hidden rounded-2xl border ${style.border} ${style.hoverShadow} bg-surface/50 p-6 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 sm:p-7`}
                      >
                        {/* Coloured top edge */}
                        <div
                          className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-60 ${style.icon}`}
                          aria-hidden="true"
                        />
                        {/* Corner glow, stronger on hover */}
                        <div
                          className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${style.corner} to-transparent opacity-60 transition-opacity duration-500 group-hover/card:opacity-100`}
                          aria-hidden="true"
                        />

                        <div className="relative mb-4 flex items-center gap-3">
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${style.border} ${style.bubble} ${style.icon}`}
                          >
                            <Icon name="Code2" className="h-5 w-5" />
                          </span>
                          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                            {categoryLabels[category] ?? category}
                          </h3>
                          <span className="ml-auto rounded-md border border-border-subtle bg-elevated px-2 py-0.5 text-[11px] font-semibold tabular-nums text-faint">
                            {items.length}
                          </span>
                        </div>

                        <div className="relative mb-5 h-px bg-gradient-to-r from-border via-border-subtle to-transparent" />

                        <ul className="relative flex flex-wrap gap-2">
                          {items.map((s) =>
                            s.url ? (
                              <li key={s.id}>
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={s.urlLabel || s.name}
                                  className={CHIP}
                                >
                                  <Icon name={s.icon} className={`h-3.5 w-3.5 ${style.icon}`} />
                                  {s.name}
                                  <Icon name="ExternalLink" className="h-3 w-3 opacity-60" />
                                </a>
                              </li>
                            ) : (
                              <li key={s.id} className={CHIP}>
                                <Icon name={s.icon} className={`h-3.5 w-3.5 ${style.icon}`} />
                                {s.name}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </Spotlight>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </>
        )}
      </Container>
    </section>
  );
}