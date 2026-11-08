"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";

const NAV = [
  { key: "overview", href: "/admin", icon: "LayoutDashboard" },
  { key: "projects", href: "/admin/projects", icon: "FolderKanban" },
  { key: "skills", href: "/admin/skills", icon: "Wrench" },
  { key: "profile", href: "/admin/profile", icon: "User" },
  { key: "experience", href: "/admin/experience", icon: "Briefcase" },
  { key: "education", href: "/admin/education", icon: "GraduationCap" },
  { key: "services", href: "/admin/services", icon: "Code" },
  { key: "messages", href: "/admin/messages", icon: "MessageSquare" },
  { key: "media", href: "/admin/media", icon: "Image" },
  { key: "settings", href: "/admin/settings", icon: "Settings" },
  { key: "statistics", href: "/admin/statistics", icon: "TrendingUp" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const navItems = NAV.map((item) => {
    const translated = t(`admin.nav.${item.key}`);
    return { ...item, label: translated || item.key.replace(/^[a-z]/, (c) => c.toUpperCase()) };
});

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const Sidebar = (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border-subtle bg-surface">
      <div className="flex h-16 items-center gap-2 px-5 text-base font-semibold text-content">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <Icon name="Sparkles" className="h-4 w-4" />
        </span>
        {t("admin.shell.brand")}
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2" aria-label={t("admin.shell.navLabel")}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-accent/12 text-accent"
                : "text-muted hover:bg-elevated hover:text-content"
            )}
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="space-y-2 border-t border-border-subtle p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-elevated hover:text-content"
        >
          <Icon name="ExternalLink" className="h-4 w-4" />
          {t("admin.shell.viewLiveSite")}
        </Link>
        <div className="flex items-center justify-between gap-2 px-1">
          <LanguageSwitcher variant="compact" align="start" />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => logoutAction())}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-elevated hover:text-content"
        >
          <Icon name="LogOut" className="h-4 w-4" />
          {pending ? t("admin.shell.signingOut") : t("admin.shell.signOut")}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden md:block">{Sidebar}</div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full">{Sidebar}</div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border-subtle bg-surface/60 px-4 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:text-content"
            aria-label={t("admin.shell.openMenu")}
          >
            <Icon name="Menu" className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-content">
            {t("admin.shell.dashboard")}
          </span>
          <Link href="/" target="_blank" className="text-muted hover:text-content" aria-label={t("admin.shell.viewSite")}>
            <Icon name="ExternalLink" className="h-5 w-5" />
          </Link>
        </header>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
