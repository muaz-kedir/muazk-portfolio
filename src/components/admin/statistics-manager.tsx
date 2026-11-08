"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { createStatistic, updateStatistic, deleteStatistic, toggleStatisticPublished } from "@/lib/actions/statistics";

interface Statistic {
  id: string;
  value: string;
  title: string;
  description: string | null;
  accentColor: string;
  icon: string;
  displayOrder: number;
  published: boolean;
  isVisible: boolean;
}

const EMPTY = {
  value: "",
  title: "",
  description: "",
  accentColor: "blue",
  icon: "TrendingUp",
  displayOrder: 0,
  published: true,
  isVisible: true,
};

export function StatisticsManager({ stats }: { stats: Statistic[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const startEdit = (s: Statistic) => {
    setEditingId(s.id);
    setForm({
      value: s.value,
      title: s.title,
      description: s.description ?? "",
      accentColor: s.accentColor,
      icon: s.icon,
      displayOrder: s.displayOrder,
      published: s.published,
      isVisible: s.isVisible,
    });
    setError(null);
    setFieldErrors({});
  };
  const reset = () => {
    setEditingId(null);
    setForm({ ...EMPTY });
    setError(null);
    setFieldErrors({});
  };

  const submit = async () => {
    setError(null);
    setFieldErrors({});
    start(async () => {
      const res = editingId
        ? await updateStatistic(editingId, form)
        : await createStatistic(form);
      if (res.error) {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      reset();
      router.refresh();
    });
  };

  const translations = {
    addStatistic: "Add statistic",
    editStatistic: "Edit statistic",
    saving: "Saving…",
    update: "Update",
    cancel: "Cancel",
    noStats: "No statistics yet.",
    value: "Value",
    title: "Title",
    description: "Description (optional)",
    accentColor: "Accent color",
    accentColorHint: "e.g. blue, violet",
    iconName: "Icon name",
    iconHint: "e.g. TrendingUp",
    displayOrder: "Display order",
    published: "Published",
    publishedHint: "Show on public site",
    isVisible: "Visible",
    isVisibleHint: "Show in statistics section",
    save: "Save",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this statistic?",
    deleted: "Deleted",
    hide: "Hide",
    publish: "Publish",
    edit: "Edit",
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-border-subtle bg-surface/40 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-faint">
            {editingId ? translations.editStatistic : translations.addStatistic}
          </h2>
          {error ? (
            <p className="mb-3 text-sm text-red-400" role="alert">{error}</p>
          ) : null}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={translations.value} required>
                <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </Field>
              <Field label={translations.title} required>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={translations.description} hint={translations.accentColorHint}>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <Field label={translations.accentColor} hint={translations.accentColorHint}>
                <Input value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} placeholder="blue" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={translations.iconName} hint={translations.iconHint}>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </Field>
              <Field label={translations.displayOrder}>
                <Input type="number" value={String(form.displayOrder)} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 0 })} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={translations.published} hint={translations.publishedHint}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="h-4 w-4 accent-accent"
                  />
                  {translations.published}
                </label>
              </Field>
              <Field label={translations.isVisible} hint={translations.isVisibleHint}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
                  <input
                    type="checkbox"
                    checked={form.isVisible}
                    onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                    className="h-4 w-4 accent-accent"
                  />
                  {translations.isVisible}
                </label>
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={submit} disabled={pending}>
                {pending
                  ? translations.saving
                  : editingId
                    ? translations.update
                    : translations.addStatistic}
              </Button>
              {editingId ? (
                <Button variant="ghost" onClick={reset}>{translations.cancel}</Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        {stats.length === 0 ? (
          <p className="text-sm text-muted">{translations.noStats}</p>
        ) : (
          <ul className="space-y-2">
            {stats.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface/40 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/12 text-accent">
                    <Icon name={s.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-content">{s.title}</p>
                    <p className="text-xs text-faint">{translations.value}: {s.value}</p>
                    {s.description && (
                      <p className="text-xs text-faint">{s.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        await toggleStatisticPublished(s.id, !s.published);
                        router.refresh();
                      })
                    }
                    className="rounded-md px-2 py-1 text-xs text-muted hover:text-content"
                  >
                    {s.published ? translations.hide : translations.publish}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(s)}
                    className="rounded-md p-1.5 text-muted hover:text-content"
                    aria-label={translations.edit}
                  >
                    <Icon name="Pencil" className="h-4 w-4" />
                  </button>
                  <ConfirmButton
                    confirmLabel={translations.delete}
                    onConfirm={async () => {
                      const res = await deleteStatistic(s.id);
                      if (!res.error) router.refresh();
                      return res;
                    }}
                    successMessage={translations.deleted}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                  </ConfirmButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}