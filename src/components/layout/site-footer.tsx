import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { getI18n } from "@/lib/i18n/server";
import { getProfile, getSettings } from "@/lib/queries";

const NAV = [
  { key: "home", href: "/" },
  { key: "projects", href: "/projects" },
  { key: "contact", href: "/contact" },
  { key: "privacy", href: "/privacy" },
] as const;

const SOCIAL_BASE =
  "flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-elevated text-muted shadow-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export async function SiteFooter() {
  const { t } = await getI18n();
  const [profile, settings] = await Promise.all([
    getProfile().catch(() => null),
    getSettings().catch(() => null),
  ]);

  const navItems = NAV.map((item) => ({
    ...item,
    label:
      item.key === "privacy" ? t("privacy.title") : t(`nav.${item.key}`),
  }));

  const github = profile?.githubUrl || undefined;
  const linkedin = profile?.linkedinUrl || undefined;
  const email = profile?.publicEmail || settings?.contactEmail || undefined;
  const footerText =
    settings?.footerContent ||
    `© ${new Date().getFullYear()} Mukti. ${t("footer.rights")}`;

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border-subtle/60">
      {/* Atmospheric glow (gradient only: no heavy blur filter) */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[min(900px,100%)] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgb(var(--accent-rgb)/0.18) 0%, rgb(var(--accent-2-rgb)/0.08) 45%, transparent 72%)",
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-grid grid-mask opacity-10" aria-hidden="true" />
      {/* Accent hairline */}
      <span className="flow-line pointer-events-none absolute inset-x-0 top-0 opacity-70" aria-hidden />

      <Container size="wide" className="relative py-14 sm:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 text-lg font-bold text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/25 bg-accent/15 text-accent shadow-[0_0_18px_rgb(var(--accent-rgb)/0.25)] transition-all duration-300 group-hover:scale-105 group-hover:bg-accent/25 group-hover:shadow-[0_0_26px_rgb(var(--accent-rgb)/0.45)]">
                <Icon name="Sparkles" className="h-4 w-4" />
              </span>
              <span className="text-gradient">Mukti</span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-muted">
              {profile?.title || "Software Engineer & Full-Stack Developer"}
            </p>
            <div
              className="mt-3 h-px w-12 bg-gradient-to-r from-accent/60 to-transparent"
              aria-hidden="true"
            />
            <p className="mt-3 text-xs leading-5 text-faint">{t("footer.tagline")}</p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-faint">
              <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
              {t("footer.navigate")}
            </span>
            <nav className="flex flex-col gap-2.5" aria-label={t("footer.navigate")}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group/link inline-flex w-fit items-center gap-1.5 text-sm text-muted transition-all duration-200 hover:translate-x-0.5 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Icon
                    name="ArrowRight"
                    className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100"
                  />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect */}
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-faint">
              <span className="h-1 w-1 rounded-full bg-accent-2" aria-hidden="true" />
              {t("footer.connect")}
            </span>
            <div className="flex items-center gap-2.5">
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${SOCIAL_BASE} hover:border-accent/40 hover:text-accent hover:shadow-[0_6px_20px_rgb(var(--accent-rgb)/0.25)]`}
                  aria-label="GitHub"
                >
                  <Icon name="Github" className="h-4 w-4" />
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${SOCIAL_BASE} hover:border-blue/40 hover:text-blue hover:shadow-[0_6px_20px_rgb(var(--accent-2-rgb)/0.25)]`}
                  aria-label="LinkedIn"
                >
                  <Icon name="Linkedin" className="h-4 w-4" />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className={`${SOCIAL_BASE} hover:border-accent/40 hover:text-accent hover:shadow-[0_6px_20px_rgb(var(--accent-rgb)/0.25)]`}
                  aria-label={t("contact.channels.email")}
                >
                  <Icon name="Mail" className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle/50 pt-6">
          <p className="text-xs text-faint">{footerText}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface/40 px-3 py-1 text-xs text-faint">
              <span>{t("footer.builtWith")}</span>
              <span className="text-accent drop-shadow-[0_0_6px_rgb(var(--accent-rgb)/0.8)]">♥</span>
              <span>{t("footer.using")}</span>
            </div>
            <LanguageSwitcher variant="compact" />
          </div>
        </div>
      </Container>
    </footer>
  );
}