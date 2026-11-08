"use client";

/**
 * Lightweight animation wrappers built on Framer Motion.
 * All components respect prefers-reduced-motion automatically via Framer Motion.
 */

import { motion, useInView, useScroll, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ── Shared Easings ─────────────────────────────────────────────── */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT   = [0.4, 0, 0.2, 1] as const;
export const EASE_SPRING   = { type: "spring", stiffness: 280, damping: 30 } as const;

/* ── Shared Variants ────────────────────────────────────────────── */
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

export const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/* ── FadeUp: scroll-triggered reveal ───────────────────────────── */
export function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden:  { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT_EXPO, delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── FadeIn: simple opacity reveal ─────────────────────────────── */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.55, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── StaggerContainer: parent that staggers children ───────────── */
export function StaggerContainer({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden:  {},
        visible: { transition: { staggerChildren: 0.09, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── StaggerItem: child of StaggerContainer ────────────────────── */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden:  { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT_EXPO } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Reveal: horizontal slide-in ───────────────────────────────── */
export function SlideIn({
  children,
  direction = "left",
  delay = 0,
  className,
}: {
  children: ReactNode;
  direction?: "left" | "right";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const x = direction === "left" ? -40 : 40;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x }}
      transition={{ duration: 0.65, ease: EASE_OUT_EXPO, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── HoverScale: subtle scale on hover ─────────────────────────── */
export function HoverScale({
  children,
  className,
  scale = 1.03,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={EASE_SPRING}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── ScrollProgress: hairline reading-progress bar ─────────────── */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: scrollYProgress }}
      className={cn(
        "scroll-progress fixed inset-x-0 top-0 z-[60] h-[2px] origin-left",
        "bg-gradient-to-r from-accent via-accent-2 to-accent",
        className
      )}
    />
  );
}

/* ── Spotlight: pointer-following glow for cards ──────────────── */
export function Spotlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn("spotlight", className)}
    >
      {children}
    </div>
  );
}

/* ── Marquee: infinite scrolling band ─────────────────────────── */
export function Marquee({
  children,
  className,
  speed = 38,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  return (
    <div className={cn("marquee", className)}>
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── CountUp: number that counts up when scrolled into view ───── */
export function CountUp({
  to,
  duration = 1.6,
  decimals = 0,
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(() => (0).toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      queueMicrotask(() => setDisplay(to.toFixed(decimals)));
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay((to * eased).toFixed(decimals));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}

/* ── AuroraBackdrop: animated ambient blobs ───────────────────── */
export function AuroraBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn("aurora", className)} aria-hidden="true">
      <span className="aurora-blob aurora-blob-a -left-24 -top-24 h-[460px] w-[460px]" />
      <span className="aurora-blob aurora-blob-b -right-32 top-10 h-[560px] w-[560px]" />
      <span className="aurora-blob aurora-blob-c bottom-0 left-1/3 h-[420px] w-[420px]" />
      {/* Soft core light */}
      <span className="pointer-events-none absolute left-1/2 top-1/3 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(var(--accent-rgb)/0.16),transparent_65%)] blur-[60px]" />
    </div>
  );
}

/* Re-export motion for direct use */
export { motion };
