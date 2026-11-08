/**
 * Accent theme presets.
 *
 * The active theme is applied by overriding the Tailwind theme variables
 * (`--color-accent`, `--color-accent-hover`, `--color-accent-2` and the
 * `--accent-rgb` channels) on the `<html>` element, so every utility that
 * references `var(--color-accent)` re-themes instantly — no re-render, no
 * page reload.
 */

export const THEME_STORAGE_KEY = "site-theme";
export const DEFAULT_THEME = "aurora";

export type ThemeId = "aurora" | "lagoon" | "forest" | "sunset";

export type Theme = {
  id: ThemeId;
  /** Short display name shown in the switcher tooltip. */
  name: string;
  /** Primary accent — buttons, links, highlights. */
  accent: string;
  /** Hover/active shade of the accent. */
  accentHover: string;
  /** Secondary accent used by gradients and glows. */
  accent2: string;
  /** Space separated RGB channels of the accent, for `rgb(var(--accent-rgb) / x)`. */
  rgb: string;
  /** Space separated RGB channels of the secondary accent. */
  rgb2: string;
  /** Ambient glow colour behind hero/section backdrops. */
  glow: string;
};

export const THEMES: Theme[] = [
  {
    id: "aurora",
    name: "Aurora",
    accent: "#8B5CF6",
    accentHover: "#7C3AED",
    accent2: "#55B8FF",
    rgb: "139 92 246",
    rgb2: "85 184 255",
    glow: "#8B5CF6",
  },
  {
    id: "lagoon",
    name: "Lagoon",
    accent: "#22D3EE",
    accentHover: "#0891B2",
    accent2: "#818CF8",
    rgb: "34 211 238",
    rgb2: "129 140 248",
    glow: "#22D3EE",
  },
  {
    id: "forest",
    name: "Forest",
    accent: "#10B981",
    accentHover: "#059669",
    accent2: "#38BDF8",
    rgb: "16 185 129",
    rgb2: "56 189 248",
    glow: "#10B981",
  },
  {
    id: "sunset",
    name: "Sunset",
    accent: "#FB7185",
    accentHover: "#E11D48",
    accent2: "#FBBF24",
    rgb: "251 113 133",
    rgb2: "251 191 36",
    glow: "#FB7185",
  },
];

export function getTheme(id: string | null | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEMES.some((t) => t.id === value);
}

/** Apply a theme to the document (called by the provider and the boot script). */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty("--color-accent", theme.accent);
  root.style.setProperty("--color-accent-hover", theme.accentHover);
  root.style.setProperty("--color-accent-2", theme.accent2);
  root.style.setProperty("--accent-rgb", theme.rgb);
  root.style.setProperty("--accent-2-rgb", theme.rgb2);
  root.style.setProperty("--accent-glow", theme.glow);
  root.dataset.theme = theme.id;
}

/**
 * Inline script injected before paint so the stored theme is applied without a
 * flash of the default palette.
 */
export function themeBootScript(): string {
  return `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k)||"${DEFAULT_THEME}";var m=${JSON.stringify(
    THEMES.map((t) => [t.id, t.accent, t.accentHover, t.accent2, t.rgb, t.rgb2, t.glow])
  )};var e=m.find(function(x){return x[0]===t})||m[0];var r=document.documentElement;r.style.setProperty("--color-accent",e[1]);r.style.setProperty("--color-accent-hover",e[2]);r.style.setProperty("--color-accent-2",e[3]);r.style.setProperty("--accent-rgb",e[4]);r.style.setProperty("--accent-2-rgb",e[5]);r.style.setProperty("--accent-glow",e[6]);r.dataset.theme=e[0];}catch(e){}})();`;
}
