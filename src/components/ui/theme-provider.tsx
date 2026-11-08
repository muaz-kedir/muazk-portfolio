"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
  applyTheme,
  getTheme,
  isThemeId,
  type Theme,
  type ThemeId,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  themes: Theme[];
  setTheme: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getTheme(DEFAULT_THEME));

  /* Pick up the stored theme (the boot script already painted it). */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemeId(stored)) {
        const next = getTheme(stored);
        queueMicrotask(() => setThemeState(next));
        applyTheme(next);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    const next = getTheme(id);
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* storage unavailable */
    }
    /* Animate the palette change instead of snapping. */
    const root = document.documentElement;
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 600);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, themes: THEMES, setTheme }),
    [theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
