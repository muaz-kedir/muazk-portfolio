"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "home", href: "/" },
  { key: "about", href: "/#about" },
  { key: "skills", href: "/#skills" },
  { key: "projects", href: "/projects" },
  { key: "experience", href: "/#experience" },
  { key: "contact", href: "/contact" },
] as const;

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const navItems = NAV.map((item) => ({ ...item, label: t(`nav.${item.key}`) }));

  /* Close mobile menu on route change (adjust state during render) */
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  /* Detect scroll to add backdrop blur intensity */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* Highlight the section currently in view (scroll spy) */
  useEffect(() => {
    const ids = ["about", "skills", "experience"];
    const fn = () => {
      const line = window.scrollY + 140;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= line) current = id;
      }
      setActiveSection(current);
    };
    queueMicrotask(fn);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href.includes("#")) {
      const id = href.split("#")[1] ?? "";
      return pathname === "/" && activeSection === id;
    }
    if (href === "/") return pathname === "/" && !activeSection;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-border-subtle/70 bg-canvas/85 backdrop-blur-xl shadow-[0_8px_32px_rgb(var(--accent-rgb)/0.08),0_1px_20px_rgba(0,0,0,0.25)]"
          : "border-b border-transparent bg-canvas/60 backdrop-blur-md"
      )}
    >
      {/* Accent hairline */}
      <span
        aria-hidden
        className={cn(
          "flow-line pointer-events-none absolute inset-x-0 bottom-0 opacity-60 transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0"
        )}
      />
      <Container size="wide">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "group flex items-center gap-2.5 rounded-lg text-base font-bold tracking-tight text-content",
              FOCUS
            )}
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-accent/25 bg-accent/15 text-accent shadow-[0_0_14px_rgb(var(--accent-rgb)/0.2)] transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105 group-hover:bg-accent/25 group-hover:shadow-[0_0_22px_rgb(var(--accent-rgb)/0.5)]">
              <Icon name="Sparkles" className="h-4 w-4" />
            </span>
            <span className="text-gradient">Mukti</span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-1 rounded-full border border-border-subtle/60 bg-surface/30 p-1 md:flex"
            aria-label={t("nav.primary")}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                  FOCUS,
                  isActive(item.href)
                    ? "text-content"
                    : "text-muted hover:text-content"
                )}
              >
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full border border-accent/25 bg-elevated shadow-[0_0_18px_rgb(var(--accent-rgb)/0.18)]"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                {!isActive(item.href) && (
                  <span className="pointer-events-none absolute inset-x-4 bottom-1 h-px scale-x-0 bg-gradient-to-r from-transparent via-accent to-transparent transition-transform duration-300 group-hover:scale-x-100" />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop CTA + theme + language */}
          <div className="hidden items-center gap-2.5 md:flex">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Link href="/contact" className={cn("group/cta ml-1 rounded-lg", FOCUS)}>
              <Button
                size="sm"
                variant="primary"
                className="shadow-[0_0_16px_rgb(var(--accent-rgb)/0.3)] transition-shadow duration-300 hover:shadow-[0_0_30px_rgb(var(--accent-rgb)/0.6)]"
              >
                {t("nav.cta")}
                <Icon
                  name="ArrowRight"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5"
                />
              </Button>
            </Link>
          </div>

          {/* Mobile: theme + language + menu */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeSwitcher />
            <LanguageSwitcher variant="compact" />
            <button
              type="button"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-surface/40 text-muted transition-all duration-200 hover:border-accent/40 hover:text-content hover:shadow-[0_0_14px_rgb(var(--accent-rgb)/0.2)]",
                open ? "border-accent/40 text-content" : "border-border",
                FOCUS
              )}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={t("nav.toggleMenu")}
              onClick={() => setOpen((v) => !v)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "x" : "menu"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                >
                  <Icon name={open ? "X" : "Menu"} className="h-5 w-5" />
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden border-t border-border-subtle/60 bg-canvas/95 backdrop-blur-xl md:hidden"
          >
            {/* Soft accent glow at the top of the panel */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24"
              style={{
                background:
                  "linear-gradient(to bottom, rgb(var(--accent-rgb)/0.08), transparent)",
              }}
              aria-hidden="true"
            />
            <Container size="wide" className="relative py-4">
              <nav className="flex flex-col gap-1" aria-label={t("nav.mobile")}>
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "group/item flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200",
                        FOCUS,
                        isActive(item.href)
                          ? "border-accent/25 bg-accent/10 text-accent shadow-[0_0_16px_rgb(var(--accent-rgb)/0.12)]"
                          : "border-transparent text-muted hover:bg-elevated hover:text-content"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        {isActive(item.href) && (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent-rgb))]" />
                        )}
                        {item.label}
                      </span>
                      <Icon
                        name="ArrowRight"
                        className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-60"
                      />
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-3 border-t border-border-subtle/50 pt-3">
                  <Link href="/contact" className={cn("block rounded-lg", FOCUS)}>
                    <Button
                      size="md"
                      variant="primary"
                      className="w-full shadow-[0_0_20px_rgb(var(--accent-rgb)/0.3)]"
                    >
                      {t("nav.cta")}
                      <Icon name="ArrowRight" className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </nav>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}