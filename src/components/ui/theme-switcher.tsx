"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { useTheme } from "@/components/ui/theme-provider";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Accent colour switcher. Applies a palette to the whole site instantly by
 * overriding the accent CSS variables — no reload, no re-render.
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, themes, setTheme } = useTheme();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback((focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const openMenu = (index = 0) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const choose = (id: (typeof themes)[number]["id"], index: number) => {
    setTheme(id);
    setActiveIndex(index);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % themes.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + themes.length) % themes.length);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!open) return;
    itemRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu(0);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.theme")}
        title={t("lang.theme")}
        className={cn(
          "group inline-flex h-9 items-center gap-2 rounded-full border border-border-subtle bg-elevated/70 px-2.5 text-sm text-muted transition-all duration-200",
          "hover:border-accent/40 hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        )}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full opacity-70 blur-[5px] transition-opacity group-hover:opacity-100"
            style={{ background: theme.glow }}
          />
          <span
            className="relative h-3.5 w-3.5 rounded-full ring-1 ring-white/25"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`,
            }}
          />
        </span>
        <Icon
          name="ChevronDown"
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180 text-accent"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={onMenuKeyDown}
            role="listbox"
            aria-label={t("lang.theme")}
            tabIndex={-1}
            className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-border-subtle bg-surface/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            {themes.map((item, index) => {
              const selected = item.id === theme.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={index === activeIndex ? 0 : -1}
                  onClick={() => choose(item.id, index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-150",
                    selected ? "bg-elevated text-content" : "text-muted hover:bg-elevated hover:text-content"
                  )}
                >
                  <span className="relative flex h-6 w-6 items-center justify-center">
                    <span
                      className="absolute inset-0 rounded-full opacity-60 blur-[6px]"
                      style={{ background: item.glow }}
                    />
                    <span
                      className={cn(
                        "relative h-5 w-5 rounded-full transition-transform duration-200",
                        selected ? "scale-110 ring-2 ring-white/70" : "ring-1 ring-white/20"
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${item.accent}, ${item.accent2})`,
                      }}
                    />
                  </span>
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  {selected && <Icon name="Check" className="h-4 w-4 text-accent" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
