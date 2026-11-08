import Link from "next/link";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FadeUp } from "@/components/ui/motion";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export async function ContactCTA() {
  const { t } = await getI18n();
  return (
    <section className="section-divider relative overflow-hidden">
      {/* Full-bleed atmospheric glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgb(var(--accent-rgb)/0.16) 0%, rgb(var(--accent-2-rgb)/0.06) 45%, transparent 72%)",
        }}
        aria-hidden="true"
      />

      <Container className="relative py-24">
        <FadeUp>
          {/* Main CTA card */}
          <div className="gradient-edge group relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/10 via-surface to-accent-2/10 p-8 shadow-[0_24px_80px_rgb(var(--accent-rgb)/0.10)] sm:p-14">
            {/* Accent line along the top edge */}
            <div
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60"
              aria-hidden="true"
            />

            {/* Inner glow top-right (gradient, no blur filter) */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgb(var(--accent-2-rgb)/0.26) 0%, transparent 68%)",
              }}
              aria-hidden="true"
            />
            {/* Inner glow bottom-left */}
            <div
              className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgb(var(--accent-rgb)/0.26) 0%, transparent 68%)",
              }}
              aria-hidden="true"
            />

            {/* Grid overlay */}
            <div className="pointer-events-none absolute inset-0 bg-grid grid-mask opacity-30" aria-hidden="true" />

            {/* Decorative concentric rings (large screens) */}
            <div
              className="pointer-events-none absolute -right-24 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 lg:block"
              aria-hidden="true"
            >
              <span className="absolute inset-0 rounded-full border border-accent/15" />
              <span className="absolute inset-12 rounded-full border border-dashed border-accent-2/20 animate-spin-slow motion-reduce:animate-none" />
              <span className="absolute inset-24 rounded-full border border-accent/20" />
              <span
                className="absolute inset-36 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgb(var(--accent-rgb)/0.3) 0%, transparent 70%)",
                }}
              />
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_14px_4px_rgb(var(--accent-rgb)/0.7)]" />
            </div>

            {/* Floating particles */}
            {[
              { top: "18%", left: "82%", size: "h-1.5 w-1.5", delay: "0s" },
              { top: "62%", left: "12%", size: "h-1 w-1", delay: "1.2s" },
              { top: "34%", left: "62%", size: "h-1 w-1", delay: "2.4s" },
            ].map((p) => (
              <span
                key={`${p.top}-${p.left}`}
                className={cn(
                  "animate-float-slow pointer-events-none absolute rounded-full bg-accent/70 shadow-[0_0_8px_rgb(var(--accent-rgb))] motion-reduce:animate-none",
                  p.size
                )}
                style={{ top: p.top, left: p.left, animationDelay: p.delay }}
                aria-hidden="true"
              />
            ))}

            <div className="relative max-w-2xl">
              {/* Label */}
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t("cta.eyebrow")}
              </span>

              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-content sm:text-4xl lg:text-5xl">
                {t("cta.titleLead")}{" "}
                <span className="text-shine">{t("cta.titleAccent")}</span>
              </h2>

              <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg sm:leading-9">
                {t("cta.description")}
              </p>

              <div
                className="mt-8 h-px w-24 bg-gradient-to-r from-accent/60 to-transparent"
                aria-hidden="true"
              />

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants("primary", "lg"),
                    "group/btn shadow-[0_0_30px_rgb(var(--accent-rgb)/0.35)] transition-shadow duration-300 hover:shadow-[0_0_50px_rgb(var(--accent-rgb)/0.55)]"
                  )}
                >
                  {t("cta.discuss")}
                  <Icon
                    name="ArrowRight"
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                  />
                </Link>
                <Link
                  href="/projects"
                  className={cn(
                    buttonVariants("outline", "lg"),
                    "transition-all duration-300 hover:shadow-[0_0_24px_rgb(var(--accent-rgb)/0.18)]"
                  )}
                >
                  {t("cta.seeWork")}
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}