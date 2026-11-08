"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  source?: "portfolio";
};

const MAX_HISTORY = 12;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeHref(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return value;
  }
  if (value.startsWith("mailto:")) return value;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function renderMessage(content: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s<]+)/g;
  let cursor = 0;
  let index = 0;

  for (const match of content.matchAll(pattern)) {
    const start = match.index ?? 0;
    const label = match[1];
    let href = match[2] ?? match[3];
    if (!href) continue;

    const trailing = match[2] ? "" : href.match(/[.,!?;:]+$/)?.[0] ?? "";
    if (trailing) href = href.slice(0, -trailing.length);
    const destination = safeHref(href);

    if (start > cursor) parts.push(content.slice(cursor, start));
    if (destination) {
      const external = /^https?:\/\//.test(destination);
      parts.push(
        <a
          key={`link-${index}`}
          href={destination}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {label ?? href}
        </a>
      );
      if (trailing) parts.push(trailing);
    } else {
      parts.push(match[0]);
    }

    cursor = start + match[0].length;
    index += 1;
  }

  if (cursor < content.length) parts.push(content.slice(cursor));
  return parts;
}

export function PortfolioAssistant() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const panelId = "portfolio-assistant-panel";

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, isSending, reduceMotion]);

  function closePanel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsSending(false);
    setOpen(false);
    triggerRef.current?.focus();
  }

  async function sendMessage(question = draft) {
    const content = question.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setIsSending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const recentMessages = nextMessages.slice(-MAX_HISTORY);
      if (recentMessages[0]?.role === "assistant") recentMessages.shift();
      const response = await fetch("/api/portfolio-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: recentMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        if (response.status === 429) {
          const retryAfter =
            isRecord(body) && typeof body.retryAfterSeconds === "number"
              ? body.retryAfterSeconds
              : 60;
          setError(t("assistant.rateLimited", { seconds: retryAfter }));
        } else if (isRecord(body) && body.error === "PORTFOLIO_UNAVAILABLE") {
          setError(t("assistant.portfolioUnavailable"));
        } else {
          setError(t("assistant.responseError"));
        }
        return;
      }

      const body: unknown = await response.json().catch(() => null);
      if (
        isRecord(body) &&
        body.source === "portfolio" &&
        typeof body.answer === "string" &&
        body.answer.trim()
      ) {
        setMessages([
          ...nextMessages,
          { role: "assistant", content: body.answer, source: "portfolio" },
        ]);
      } else {
        setError(t("assistant.responseError"));
      }
    } catch (requestError) {
      if (requestError instanceof Error && requestError.name === "AbortError") {
        setMessages(nextMessages);
        return;
      }
      setMessages(nextMessages);
      setError(t("assistant.responseError"));
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsSending(false);
      }
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-labelledby="portfolio-assistant-title"
            aria-describedby="portfolio-assistant-welcome"
            onKeyDown={(event) => {
              if (event.key === "Escape") closePanel();
            }}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-50 flex h-[min(36rem,calc(100dvh-7rem))] max-h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.65)] sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[min(26rem,calc(100vw-3rem))] motion-reduce:transition-none"
          >
            <header className="flex items-center justify-between gap-3 border-b border-border-subtle bg-elevated/70 px-4 py-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-accent/5 text-accent">
                  <Icon name="Sparkles" className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2
                    id="portfolio-assistant-title"
                    className="truncate text-sm font-bold text-content"
                  >
                    {t("assistant.title")}
                  </h2>
                  <p className="truncate text-xs text-muted">{t("assistant.subtitle")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePanel}
                aria-label={t("assistant.close")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-overlay hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <Icon name="X" className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="off">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/5 text-accent/80">
                  <Icon name="Sparkles" className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <p
                  id="portfolio-assistant-welcome"
                  className="max-w-[90%] rounded-2xl rounded-tl-md border border-border-subtle bg-elevated/70 px-3.5 py-3 text-sm leading-6 text-content"
                >
                  {t("assistant.welcome")}
                </p>
              </div>

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "flex items-start gap-2.5",
                    message.role === "user" && "justify-end"
                  )}
                >
                  {message.role === "assistant" && (
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/5 text-accent/80">
                      <Icon name="Sparkles" className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  )}
                  <div className="max-w-[88%]">
                    {message.source === "portfolio" && (
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-faint">
                        {t("assistant.quickAnswerLabel")}
                      </p>
                    )}
                    <p
                      className={cn(
                        "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-6",
                        message.role === "user"
                          ? "rounded-tr-md bg-accent/10 text-content"
                          : "rounded-tl-md border border-border-subtle bg-elevated/70 text-content"
                      )}
                    >
                      {renderMessage(message.content)}
                    </p>
                  </div>
                </div>
              ))}

              {messages.length === 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
                    {t("assistant.suggestionsLabel")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "who",
                        "technologies",
                        "projects",
                        "strongest",
                        "contact",
                      ] as const
                    ).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        disabled={isSending}
                        onClick={() => void sendMessage(t(`assistant.suggestions.${suggestion}`))}
                        className="rounded-full border border-border-subtle bg-elevated/50 px-3 py-1.5 text-left text-xs text-muted transition-colors hover:border-accent/25 hover:bg-accent/5 hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-50"
                      >
                        {t(`assistant.suggestions.${suggestion}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isSending && (
                <div className="flex items-center gap-2.5" role="status" aria-live="polite">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/5 text-accent/80">
                    <Icon name="Sparkles" className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-2xl rounded-tl-md border border-border-subtle bg-elevated/70 px-3.5 py-2.5 text-xs text-muted">
                    {t("assistant.thinking")}
                    <span className="flex gap-1" aria-hidden="true">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-accent/60 motion-reduce:animate-none" />
                      <span className="h-1 w-1 animate-pulse rounded-full bg-accent/60 [animation-delay:150ms] motion-reduce:animate-none" />
                      <span className="h-1 w-1 animate-pulse rounded-full bg-accent/60 [animation-delay:300ms] motion-reduce:animate-none" />
                    </span>
                  </span>
                </div>
              )}

              {error && (
                <p className="rounded-xl border border-border bg-elevated/50 px-3.5 py-2.5 text-xs leading-5 text-muted" role="alert">
                  {error}
                </p>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={submit}
              className="flex items-center gap-2 border-t border-border-subtle bg-elevated/40 p-3"
            >
              <label className="sr-only" htmlFor="portfolio-assistant-input">
                {t("assistant.inputLabel")}
              </label>
              <input
                ref={inputRef}
                id="portfolio-assistant-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={t("assistant.placeholder")}
                maxLength={1200}
                disabled={isSending}
                className="h-11 min-w-0 flex-1 rounded-xl border border-border-subtle bg-canvas/70 px-3.5 text-sm text-content outline-none placeholder:text-faint focus:border-accent/30 focus:ring-2 focus:ring-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                aria-label={t("assistant.send")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-canvas transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon
                  name={isSending ? "Loader" : "Send"}
                  className={cn("h-4 w-4", isSending && "animate-spin motion-reduce:animate-none")}
                  aria-hidden="true"
                />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closePanel() : setOpen(true))}
        aria-label={open ? t("assistant.close") : t("assistant.open")}
        aria-expanded={open}
        aria-controls={panelId}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-[51] inline-flex h-14 items-center gap-2 rounded-full border border-accent/15 bg-surface px-4 text-sm font-semibold text-content shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-accent/30 hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:bottom-6 sm:right-6 motion-reduce:transform-none"
      >
        <Icon name={open ? "X" : "Sparkles"} className="h-4 w-4 text-accent" aria-hidden="true" />
        <span>{t("assistant.title")}</span>
      </button>
    </>
  );
}
