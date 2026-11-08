import { Icon } from "@/components/ui/icon";
import { getI18n } from "@/lib/i18n/server";
import { getProfile, getSettings } from "@/lib/queries";

/* Same channels, icons and colours as before. Each one also carries its own
   hover border, glow and icon-ring classes (written out in full for Tailwind). */
const CONTACTS = [
  {
    key: "email",
    icon: "Mail",
    value: "Email",
    color: "text-accent",
    bg: "bg-accent/10",
    ring: "border-accent/25",
    hover: "hover:border-accent/40 hover:shadow-[0_10px_36px_rgb(var(--accent-rgb)/0.14)]",
  },
  {
    key: "github",
    icon: "Github",
    value: "GitHub",
    color: "text-blue",
    bg: "bg-blue/10",
    ring: "border-blue/25",
    hover: "hover:border-blue/40 hover:shadow-[0_10px_36px_rgb(var(--accent-2-rgb)/0.14)]",
  },
  {
    key: "linkedin",
    icon: "Linkedin",
    value: "LinkedIn",
    color: "text-violet",
    bg: "bg-violet/10",
    ring: "border-violet/25",
    hover: "hover:border-violet/40 hover:shadow-[0_10px_36px_rgba(167,139,250,0.16)]",
  },
] as const;

export async function ContactInfo() {
  const { t } = await getI18n();
  const [profile, settings] = await Promise.all([
    getProfile().catch(() => null),
    getSettings().catch(() => null),
  ]);
  const email = profile?.publicEmail || settings?.contactEmail || undefined;
  const github = profile?.githubUrl || undefined;
  const linkedin = profile?.linkedinUrl || undefined;

  const items = [
    email    && { ...CONTACTS[0], href: `mailto:${email}`,  display: email },
    github   && { ...CONTACTS[1], href: github,              display: "GitHub" },
    linkedin && { ...CONTACTS[2], href: linkedin,            display: "LinkedIn" },
  ].filter(Boolean) as Array<{
    key: "email" | "github" | "linkedin";
    icon: string; value: string; color: string; bg: string; ring: string; hover: string; href: string; display: string;
  }>;

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          target={item.href.startsWith("mailto") ? undefined : "_blank"}
          rel={item.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
          className={`group relative flex items-center gap-4 overflow-hidden rounded-xl border border-border bg-surface/50 p-4 transition-all duration-300 hover:-translate-y-0.5 sm:p-5 ${item.hover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
        >
          {/* Coloured top edge */}
          <span
            className={`pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-70 ${item.color}`}
            aria-hidden="true"
          />

          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${item.ring} ${item.bg} ${item.color} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon name={item.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-faint">
              {t(`contact.channels.${item.key}`)}
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-content sm:text-base">{item.display}</p>
            <p className="text-xs text-muted">
              {t(`contact.channels.${item.key}Description`)}
            </p>
          </div>

          {/* Arrow that slides in on hover */}
          <Icon
            name="ArrowUpRight"
            className={`h-4 w-4 shrink-0 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 ${item.color}`}
          />
        </a>
      ))}

      {/* Availability note */}
      <div className="relative mt-6 overflow-hidden rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4 sm:p-5">
        <div
          className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50"
          aria-hidden="true"
        />
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-35 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_5px_1px_rgba(16,185,129,0.3)]" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            {t("contact.availabilityTitle")}
          </p>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
          {t("contact.availabilityBody")}
        </p>
      </div>
    </div>
  );
}