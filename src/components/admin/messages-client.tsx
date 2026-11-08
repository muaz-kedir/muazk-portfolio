"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { useI18n } from "@/lib/i18n/provider";
import { LANGUAGES } from "@/lib/i18n/config";
import { formatDate } from "@/lib/utils";
import {
  markMessageRead,
  archiveMessage,
  deleteMessage,
  replyToMessage,
} from "@/lib/actions/messages";

interface Message {
  id: string;
  name: string;
  email: string;
  inquiryType: string;
  subject: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  adminReply: string | null;
  createdAt: Date;
}

export function MessagesClient({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const { t, dict, locale } = useI18n();
  const inquiryLabels = dict.inquiry as Record<string, string>;
  const [pending, start] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"inbox" | "unread" | "archived">("inbox");
  const [reply, setReply] = useState("");

  const filtered = messages.filter((m) => {
    if (filter === "inbox" && m.isArchived) return false;
    if (filter === "archived" && !m.isArchived) return false;
    if (filter === "unread" && m.isRead) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  const open = (m: Message) => {
    setSelectedId(m.id);
    setReply(m.adminReply ?? "");
    if (!m.isRead) {
      start(async () => {
        await markMessageRead(m.id, true);
        router.refresh();
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="mb-3 flex gap-2">
          <div className="relative flex-1">
            <Icon name="Search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.messages.search")}
              className="pl-9"
            />
          </div>
        </div>
        <div className="mb-3 flex gap-1">
          {(["inbox", "unread", "archived"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                filter === f ? "bg-accent/12 text-accent" : "text-muted hover:text-content"
              }`}
            >
              {t(
                f === "inbox"
                  ? "admin.messages.inbox"
                  : f === "unread"
                    ? "admin.messages.unreadFilter"
                    : "admin.messages.archivedFilter"
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-border-subtle bg-surface/40 p-6 text-sm text-muted">
            {t("admin.messages.noMessages")}
          </p>
        ) : (
          <ul className="space-y-1.5">
            {filtered.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => open(m)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    selectedId === m.id
                      ? "border-accent/50 bg-accent/5"
                      : "border-border-subtle bg-surface/40 hover:border-border-subtle"
                  } ${!m.isRead ? "border-l-2 border-l-accent" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-content">{m.name}</span>
                    <span className="text-xs text-faint">
                      {formatDate(m.createdAt, undefined, LANGUAGES[locale].tag)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-content">{m.subject}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge>{inquiryLabels[m.inquiryType] ?? m.inquiryType}</Badge>
                    {m.isArchived ? <Badge tone="warning">{t("status.archived")}</Badge> : null}
                    {!m.isRead ? <Badge tone="accent">{t("status.new")}</Badge> : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="lg:col-span-7">
        {selected ? (
          <div className="rounded-2xl border border-border-subtle bg-surface/40 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-content">{selected.subject}</h2>
                <p className="text-sm text-muted">
                  {selected.name} ·{" "}
                  <a href={`mailto:${selected.email}`} className="text-accent hover:underline">
                    {selected.email}
                  </a>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await markMessageRead(selected.id, !selected.isRead);
                      router.refresh();
                    })
                  }
                  className="rounded-md px-2 py-1 text-xs text-muted hover:text-content"
                >
                  {selected.isRead
                    ? t("admin.messages.markUnread")
                    : t("admin.messages.markRead")}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await archiveMessage(selected.id, !selected.isArchived);
                      router.refresh();
                    })
                  }
                  className="rounded-md px-2 py-1 text-xs text-muted hover:text-content"
                >
                  {selected.isArchived
                    ? t("admin.messages.unarchive")
                    : t("admin.messages.archive")}
                </button>
                <ConfirmButton
                  confirmLabel={t("admin.messages.delete")}
                  onConfirm={async () => {
                    const res = await deleteMessage(selected.id);
                    if (!res.error) {
                      setSelectedId(null);
                      router.refresh();
                    }
                    return res;
                  }}
                  successMessage={t("admin.messages.deleted")}
                  className="text-red-400 hover:bg-red-500/10"
                >
                  {t("admin.messages.delete")}
                </ConfirmButton>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border-subtle bg-canvas/40 p-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-content">
                {selected.message}
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-content">
                {t("admin.messages.replyLabel")}
              </label>
              <Textarea
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={t("admin.messages.replyPlaceholder")}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-faint">
                  {t("admin.messages.replyHint")}
                </span>
                <Button
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await replyToMessage({ id: selected.id, adminReply: reply });
                      router.refresh();
                    })
                  }
                >
                  {t("admin.messages.saveReply")}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border-subtle p-10 text-sm text-muted">
            {t("admin.messages.selectMessage")}
          </div>
        )}
      </div>
    </div>
  );
}
