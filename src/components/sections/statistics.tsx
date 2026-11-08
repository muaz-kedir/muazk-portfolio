"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Spotlight } from "@/components/ui/motion";
import { useInView } from "@/lib/hooks";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function parseStatValue(value: string): { targetValue: number; suffix: string; isInfinite: boolean } {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  
  // Check for infinity symbols or words
  if (lower === "∞" || lower === "infinity" || lower === "infinite" || trimmed.includes("∞")) {
    return { targetValue: 0, suffix: "∞", isInfinite: true };
  }
  
  // Extract numeric part and suffix
  const numericMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)/);
  const targetValue = numericMatch ? parseFloat(numericMatch[1].replace(",", ".")) : 0;
  const suffix = trimmed.slice(numericMatch ? numericMatch[0].length : 0);
  
  return { targetValue, suffix, isInfinite: false };
}

function StatCard({ stat, inView, index }: { stat: any; inView: boolean; index: number }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const { targetValue, suffix, isInfinite } = parseStatValue(stat.value);

  useEffect(() => {
    if (!inView) {
      setAnimatedValue(0);
      return;
    }

    // For infinite values, just show the symbol immediately
    if (isInfinite) {
      setAnimatedValue(0); // We'll show the symbol directly in render
      return;
    }

    let cancelled = false;
    const startTime = performance.now();
    const duration = 1800;

    const updateCount = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(targetValue * eased);

      if (!cancelled) {
        setAnimatedValue(current);
      }

      if (progress < 1 && !cancelled) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);

    return () => {
      cancelled = true;
    };
  }, [inView, targetValue, isInfinite]);

  return (
    <Spotlight className="h-full">
      <div
        className="group relative h-full overflow-hidden rounded-2xl border border-border-subtle bg-surface/70 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40 hover:bg-surface hover:shadow-[0_20px_56px_rgb(var(--accent-rgb)/0.16)] sm:bg-surface/60 sm:p-7 sm:backdrop-blur-sm"
      >
        {/* Accent line along the top edge (always faint, brighter on hover) */}
        <div
          className="absolute inset-x-6 top-0 h-px opacity-40 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(var(--accent-rgb)), transparent)",
          }}
          aria-hidden="true"
        />

        {/* Corner glow */}
        <div
          className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full opacity-50 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle, rgb(var(--accent-rgb) / 0.16) 0%, transparent 68%)",
          }}
          aria-hidden="true"
        />

        {/* Big faint index number in the corner */}
        <span
          className="pointer-events-none absolute right-5 top-4 select-none font-mono text-xs font-semibold tabular-nums text-faint"
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Icon container with glow */}
        <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/15 via-surface/50 to-accent-2/10 transition-all duration-300 group-hover:scale-105 group-hover:border-accent/40 group-hover:shadow-[0_8px_28px_rgb(var(--accent-rgb)/0.3)]">
          <Icon name={stat.icon} className="h-7 w-7 text-accent" />
        </div>

        {/* Large animated number or infinity symbol */}
        <div className="relative mb-3 font-mono">
          {isInfinite ? (
            <span className="text-gradient text-5xl font-extrabold leading-none tracking-tight sm:text-6xl">
              {suffix}
            </span>
          ) : (
            <span className="text-5xl font-extrabold leading-none tracking-tight tabular-nums text-content sm:text-6xl">
              {animatedValue}
              <span className="text-gradient">{suffix}</span>
            </span>
          )}
        </div>

        {/* Short divider */}
        <div
          className="relative mb-4 h-px w-12 bg-gradient-to-r from-accent/60 to-transparent transition-all duration-500 group-hover:w-24"
          aria-hidden="true"
        />

        {/* Title */}
        <h3 className="relative mb-2 text-base font-semibold text-content sm:text-lg">
          {stat.title}
        </h3>

        {/* Description */}
        {stat.description && (
          <p className="relative text-sm leading-relaxed text-muted">{stat.description}</p>
        )}

        {/* Bottom progress bar: fills in when the card enters the screen */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-accent/50 via-accent-2/50 to-transparent transition-all duration-[1400ms] ease-out group-hover:from-accent group-hover:via-accent-2"
          style={{ width: inView ? "100%" : "0%" }}
          aria-hidden="true"
        />
      </div>
    </Spotlight>
  );
}

export function Statistics({ stats }: { stats: any[] }) {
  const [ref, inView] = useInView<HTMLDivElement>({ offset: "100px", triggerOnce: true });

  if (stats.length === 0) {
    return (
      <section className="section-divider">
        <Container className="py-24">
          <EmptyState icon="TrendingUp" title="No statistics yet." description="" />
        </Container>
      </section>
    );
  }

  return (
    <section
      id="statistics"
      className="section-divider relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-surface/15 to-transparent"
    >
      {/* Ambient glow (gradient only: no heavy blur filter) */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[26rem] w-[min(900px,100%)] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgb(var(--accent-rgb) / 0.18) 0%, rgb(var(--accent-2-rgb) / 0.08) 45%, transparent 72%)",
        }}
        aria-hidden="true"
      />
      {/* Faint grid */}
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
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              Key Metrics
            </span>
            <p className="mt-5 max-w-lg mx-auto text-base leading-7 text-muted sm:text-lg sm:leading-8">
              A snapshot of my journey so far — projects shipped, skills mastered, and milestones reached.
            </p>
            <div
              className="mx-auto mt-8 h-px w-40 bg-gradient-to-r from-transparent via-accent/50 to-transparent"
              aria-hidden="true"
            />
          </div>
        </FadeUp>

        <div ref={ref} className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.id} stat={s} inView={inView} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function FadeUp({ children }: { children: React.ReactNode }) {
  const [ref, inView] = useInView<HTMLDivElement>({ offset: "100px", triggerOnce: true });
  return <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>{children}</div>;
}

export function StatisticsEmpty({ message }: { message: string }) {
  return (
    <section className="section-divider">
      <Container className="py-24">
        <EmptyState icon="TrendingUp" title={message} description="" />
      </Container>
    </section>
  );
}