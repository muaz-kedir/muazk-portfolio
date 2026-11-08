"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AuroraBackdrop } from "@/components/ui/motion";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { Profile, Media } from "@/lib/queries";

const EASE = [0.16, 1, 0.3, 1] as const;

function item(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE, delay },
  };
}

/* ── Animated hero graphic tech core ──────────────────────────── */
function HeroGraphicCore({
  openToWork,
  fullStack,
}: {
  openToWork: string;
  fullStack: string;
}) {
  return (
    <div className="relative mx-auto flex h-[310px] w-[310px] items-center justify-center sm:h-[400px] sm:w-[400px] lg:h-[460px] lg:w-[460px]">
      {/* Outer atmosphere glow */}
      <div
        className="animate-pulse-glow pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgb(var(--accent-rgb) / 0.1) 0%, rgb(var(--accent-2-rgb) / 0.07) 50%, transparent 72%)",
        }}
        aria-hidden="true"
      />

      {/* Spinning ring 1 (Outer HUD Ring with dashed border) */}
      <motion.div
        className="absolute inset-[4%] rounded-full border border-dashed border-accent/25"
        animate={{ rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        {/* Orbiting energy beacon */}
        <span className="absolute -top-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_8px_2px_rgb(var(--accent-rgb)/0.35)]" />
      </motion.div>

      {/* Spinning ring 2 (Reverse 3D tilted ring) */}
      <motion.div
        className="absolute inset-[14%] rounded-full border border-accent-2/20"
        style={{ transform: "rotateX(62deg)" }}
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-accent-2 shadow-[0_0_7px_2px_rgb(var(--accent-2-rgb)/0.3)]" />
      </motion.div>

      {/* Spinning ring 3 (Inner precision ring) */}
      <motion.div
        className="absolute inset-[24%] rounded-full border border-violet/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-violet/70 shadow-[0_0_6px_2px_rgb(var(--accent-2-rgb)/0.25)]" />
      </motion.div>

      {/* ── Central High-Tech Developer Reactor Core (Pure Graphic Design) ── */}
      <motion.div
        className="relative z-10 flex h-[165px] w-[165px] flex-col items-center justify-center rounded-3xl border border-accent/25 bg-surface/90 shadow-[0_0_50px_rgb(var(--accent-rgb)/0.18)] backdrop-blur-2xl sm:h-[195px] sm:w-[195px]"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Animated aura frame */}
        <div className="absolute -inset-0.5 -z-10 rounded-3xl bg-gradient-to-br from-accent/12 via-accent-2/8 to-violet/12 blur-sm" />

        {/* Central reactor badge */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-surface to-accent-2/8 shadow-[0_0_20px_rgb(var(--accent-rgb)/0.2)] sm:h-20 sm:w-20">
          <Icon name="Code2" className="h-8 w-8 text-muted sm:h-9 sm:w-9" />
          <span className="absolute -inset-1 rounded-2xl border border-dashed border-accent-2/35 animate-spin-slow" />
        </div>

        <div className="mt-3 flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-content">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-2/70 animate-ping" />
          <span>&lt;FULL-STACK /&gt;</span>
        </div>
        <div className="mt-0.5 text-[10px] font-medium text-accent-2/80">
          Software Engineer
        </div>
      </motion.div>

      {/* Floating badge: "Available for Projects" */}
      <motion.div
        className="glass absolute -right-3 top-8 rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-muted shadow-lg backdrop-blur-md"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        aria-hidden="true"
      >
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent-2 shadow-[0_0_5px_2px_rgb(var(--accent-2-rgb)/0.25)]" />
        {openToWork}
      </motion.div>

      {/* Floating badge: "Full-Stack & Systems" */}
      <motion.div
        className="glass absolute -left-5 bottom-12 rounded-xl border border-accent-2/20 px-3.5 py-2 text-xs font-medium text-muted shadow-lg backdrop-blur-md"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        aria-hidden="true"
      >
        <span className="mr-1.5">⚡</span>
        {fullStack}
      </motion.div>

      {/* Floating micro-stack tag 1: Next.js + React */}
      <motion.div
        className="glass absolute right-2 bottom-8 hidden rounded-lg border border-border-subtle px-2.5 py-1 font-mono text-[10px] text-muted shadow-md sm:block"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <span className="text-accent font-semibold">Next.js 16</span> • TypeScript
      </motion.div>

      {/* Floating micro-stack tag 2: Cloud & DB */}
      <motion.div
        className="glass absolute left-3 top-10 hidden rounded-lg border border-border-subtle px-2.5 py-1 font-mono text-[10px] text-muted shadow-md sm:block"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        PostgreSQL • Prisma
      </motion.div>

      {/* Corner glow dots */}
      {[
        "top-6 right-10 bg-accent",
        "bottom-8 left-12 bg-accent-2",
        "top-1/2 -left-2 bg-violet",
      ].map((cls) => (
        <span
          key={cls}
          className={cn("pointer-events-none absolute h-1.5 w-1.5 rounded-full opacity-60", cls)}
          aria-hidden="true"
        />
      ))}

      {/* Orbital particles */}
      {[
        { size: "h-2 w-2", top: "18%", left: "82%", delay: "0s" },
        { size: "h-1.5 w-1.5", top: "68%", left: "10%", delay: "1.4s" },
        { size: "h-1.5 w-1.5", top: "82%", left: "74%", delay: "2.6s" },
      ].map((p) => (
        <span
          key={`${p.top}-${p.left}`}
          className={cn(
            "animate-float-slow pointer-events-none absolute rounded-full bg-accent/70 shadow-[0_0_8px_rgb(var(--accent-rgb))]",
            p.size
          )}
          style={{ top: p.top, left: p.left, animationDelay: p.delay }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/* ── Hero Section ─────────────────────────────────────────────── */
export function Hero({
  profile,
}: {
  profile: Profile & { profileImage: Media | null; cvFile: Media | null };
}) {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const orbRotate = useTransform(scrollYProgress, [0, 1], [0, 7]);

  const cvAvailable = Boolean(profile.cvVisible && profile.cvFile);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100vh-64px)] overflow-hidden"
    >
      {/* Background layers */}
      <AuroraBackdrop className="opacity-80" />
      <div
        className="pointer-events-none absolute inset-0 bg-grid grid-mask opacity-40"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 grain" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-7xl items-center px-5 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 py-16 lg:grid-cols-12 lg:py-24">
          {/* ── Left: Text ─────────────────────────── */}
          <motion.div style={{ y: copyY, opacity: copyOpacity }} className="lg:col-span-7">
            {/* Available badge */}
            {profile.isAvailable && (
              <motion.span
                {...item(0)}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400"
              >
                <span className="pulse-ring relative flex h-2 w-2 text-emerald-400">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {t("hero.available")}
              </motion.span>
            )}

            {/* Eyebrow */}
            {profile.eyebrow && (
              <motion.p
                {...item(0.05)}
                className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-accent/80"
              >
                {profile.eyebrow}
              </motion.p>
            )}

            {/* Headline */}
            <motion.h1
              {...item(0.1)}
              className="max-w-xl text-[2.1rem] font-extrabold leading-[1.2] tracking-tight sm:text-[2.7rem] lg:text-[3rem] xl:text-[3.3rem]"
            >
              {(() => {
                const headline = profile.heroHeadline?.trim();
                if (headline) {
                  const words = headline.split(/\s+/);
                  const mid = Math.ceil(words.length / 2);
                  return (
                    <>
                      <span className="block text-content/90">{words.slice(0, mid).join(" ")}</span>
                      <span className="mt-0.5 block text-shine">{words.slice(mid).join(" ")}</span>
                    </>
                  );
                }
                return (
                  <>
                    <span className="block text-content/90">{t("hero.headlineLead")}</span>
                    <span className="mt-0.5 block text-shine">{t("hero.headlineAccent")}</span>
                  </>
                );
              })()}
            </motion.h1>

            {/* Description */}
            <motion.p
              {...item(0.18)}
              className="mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg sm:leading-8"
            >
              {profile.heroDescription || t("hero.description")}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              {...item(0.25)}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/projects"
                className={cn(
                  buttonVariants("primary", "lg"),
                  "shadow-[0_0_30px_rgb(var(--accent-rgb)/0.35)] transition-shadow duration-300 hover:shadow-[0_0_46px_rgb(var(--accent-rgb)/0.55)]"
                )}
              >
                {t("hero.exploreWork")}
                <Icon name="ArrowRight" className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants("outline", "lg"),
                  "transition-all duration-300 hover:shadow-[0_0_24px_rgb(var(--accent-rgb)/0.18)]"
                )}
              >
                {t("hero.letsTalk")}
              </Link>
              {cvAvailable && (
                <a
                  href={`/api/media/private/${profile.cvFile!.id}`}
                  className={buttonVariants("ghost", "lg")}
                  download
                >
                  <Icon name="Download" className="h-4 w-4" />
                  {t("hero.downloadCv")}
                </a>
              )}
            </motion.div>

            {/* Social + scroll hint */}
            <motion.div
              {...item(0.32)}
              className="mt-10 flex items-center gap-5"
            >
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("hero.github")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-elevated text-muted transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-content hover:shadow-[0_0_16px_rgb(var(--accent-rgb)/0.35)]"
                >
                  <Icon name="Github" className="h-4 w-4" />
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("hero.linkedin")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-elevated text-muted transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-content hover:shadow-[0_0_16px_rgb(var(--accent-rgb)/0.35)]"
                >
                  <Icon name="Linkedin" className="h-4 w-4" />
                </a>
              )}

              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />

              {/* Scroll indicator */}
              <a
                href="#about"
                className="group flex items-center gap-2 text-xs text-faint transition-colors hover:text-muted"
              >
                <motion.span
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Icon name="ChevronsDown" className="h-4 w-4" />
                </motion.span>
                {t("hero.scroll")}
              </a>
            </motion.div>
          </motion.div>

          {/* ── Right: Graphic Tech Core ─────────────────────────── */}
          <motion.div
            style={{ y: orbY, rotate: orbRotate }}
            className="flex items-center justify-center lg:col-span-5"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          >
            <HeroGraphicCore
              openToWork={t("hero.openToWork")}
              fullStack={t("hero.fullStack")}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
