"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import { LANGUAGE_LIST, LANGUAGES, type Locale } from "@/lib/i18n/config";

/**
 * Premium language switcher.
 *
 * Renders a compact trigger (short code + native name) that opens an
 * accessible listbox. Fully keyboard operable: arrows move, Enter/Space
 * select, Escape closes and returns focus to the trigger.
 */
export function LanguageSwitcher({
  variant = "full",
  className,
  align = "end",
}: {
  variant?: "full" | "compact";
  className?: string;
  align?: "start" | "end";
}) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const layoutId = useId();

  const current = LANGUAGES[locale];

  const close = useCallback((focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  /* Close when clicking outside. */
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

  const choose = (next: Locale) => {
    setLocale(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(event.key === "ArrowDown" ? 0 : LANGUAGE_LIST.length - 1);
    }
  };

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % LANGUAGE_LIST.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + LANGUAGE_LIST.length) % LANGUAGE_LIST.length);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(LANGUAGE_LIST.length - 1);
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

  /* Move DOM focus with the highlighted option. */
  useEffect(() => {
    if (!open) return;
    itemRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  const isCompact = variant === "compact";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.switch")}
        title={t("lang.switch")}
        className={cn(
          "group inline-flex items-center gap-2 rounded-full border border-border-subtle bg-elevated/70 text-sm text-muted transition-all duration-200",
          "hover:border-accent/40 hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          isCompact ? "h-9 px-2.5" : "h-9 px-3"
        )}
      >
        <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
          {current.short}
        </span>
        {!isCompact && (
          <span className="hidden max-w-[7rem] truncate font-medium sm:inline">
            {current.native}
          </span>
        )}
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
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={onMenuKeyDown}
            role="listbox"
            aria-label={t("lang.switch")}
            tabIndex={-1}
            className={cn(
              "absolute top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border-subtle bg-surface/95 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl",
              align === "end" ? "right-0" : "left-0"
            )}
          >
            {LANGUAGE_LIST.map((code, index) => {
              const meta = LANGUAGES[code];
              const selected = code === locale;
              return (
                <button
                  key={code}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={index === activeIndex ? 0 : -1}
                  onClick={() => choose(code)}
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors duration-150",
                    selected
                      ? "text-content"
                      : "text-muted hover:bg-elevated hover:text-content"
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId={layoutId}
                      className="absolute inset-0 rounded-xl border border-accent/5 bg-accent/5"
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative flex h-7 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition-colors",
                      selected
                        ? "bg-accent/10 text-content"
                        : "bg-elevated text-faint"
                    )}
                  >
                    {meta.short}
                  </span>
                  <span className="relative flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold">{meta.native}</span>
                    <span className="truncate text-xs text-faint">{meta.english}</span>
                  </span>
                  {selected && (
                    <Icon
                      name="Check"
                      className="relative h-4 w-4 shrink-0 text-muted"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
