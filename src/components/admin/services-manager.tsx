"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { useI18n } from "@/lib/i18n/provider";
import { translateMessage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import {
  createService,
  updateService,
  deleteService,
} from "@/lib/actions/services";

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  displayOrder: number;
  published: boolean;
  url: string | null;
  urlLabel: string | null;
}

const EMPTY = { title: "", description: "", icon: "Code", displayOrder: 0, published: true, url: "", urlLabel: "" };

export function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const { t, dict } = useI18n();
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({ title: s.title, description: s.description ?? "", icon: s.icon, displayOrder: s.displayOrder, published: s.published, url: s.url ?? "", urlLabel: s.urlLabel ?? "" });
    setError(null);
    setFieldErrors({});
  };
  const reset = () => {
    setEditingId(null);
    setForm({ ...EMPTY });
    setError(null);
    setFieldErrors({});
  };

  const submit = () => {
    setError(null);
    setFieldErrors({});
    start(async () => {
      const res = editingId ? await updateService(editingId, form) : await createService(form);
      if (res.error) {
        setError(translateMessage(dict, res.error));
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      reset();
      router.refresh();
    });
  };

  const toggle = (s: Service) =>
    start(async () => {
      await updateService(s.id, {
        title: s.title,
        description: s.description ?? "",
        icon: s.icon,
        displayOrder: s.displayOrder,
        published: !s.published,
        url: s.url ?? "",
        urlLabel: s.urlLabel ?? "",
      });
      router.refresh();
    });

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-border-subtle bg-surface/40 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-faint">
            {editingId ? t("admin.services.editService") : t("admin.services.addService")}
          </h2>
          {error ? <p className="mb-3 text-sm text-red-400" role="alert">{error}</p> : null}
          <div className="space-y-4">
            <Field label={t("admin.services.serviceTitle")} required>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label={t("admin.services.descriptionLabel")}>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("admin.services.iconName")} hint={t("admin.services.iconHint")}>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </Field>
              <Field label={t("admin.services.displayOrder")}>
                <Input type="number" value={String(form.displayOrder)} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 0 })} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("admin.services.url")}
                hint={t("admin.services.urlHint")}
                error={fieldErrors.url ? translateMessage(dict, fieldErrors.url) : undefined}
              >
                <Input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
              </Field>
              <Field
                label={t("admin.services.urlLabel")}
                hint={t("admin.services.urlLabelHint")}
                error={fieldErrors.urlLabel ? translateMessage(dict, fieldErrors.urlLabel) : undefined}
              >
                <Input value={form.urlLabel} onChange={(e) => setForm({ ...form, urlLabel: e.target.value })} placeholder={t("admin.services.urlLabelPlaceholder")} />
              </Field>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 accent-accent" />
              {t("admin.services.published")}
            </label>
            <div className="flex items-center gap-3">
              <Button onClick={submit} disabled={pending}>
                {pending
                  ? t("admin.services.saving")
                  : editingId
                    ? t("admin.services.update")
                    : t("admin.services.add")}
              </Button>
              {editingId ? (
                <Button variant="ghost" onClick={reset}>
                  {t("admin.common.cancel")}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        {services.length === 0 ? (
          <p className="text-sm text-muted">{t("admin.services.noServices")}</p>
        ) : (
          <ul className="space-y-2">
            {services.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface/40 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/12 text-accent">
                    <Icon name={s.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-content">{s.title}</p>
                    <p className="text-xs text-faint">
                      {t("admin.services.order", { order: s.displayOrder })}
                    </p>
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.url}
                        className="mt-1 inline-flex max-w-[220px] items-center gap-1 text-xs text-accent hover:underline"
                      >
                        <Icon name="ExternalLink" className="h-3 w-3 shrink-0" />
                        <span className="truncate">{s.urlLabel || s.url}</span>
                      </a>
                    ) : null}
                  </div>
                  {s.published ? (
                      <Badge tone="success">{t("status.published")}</Badge>
                    ) : (
                      <Badge>{t("status.hidden")}</Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggle(s)}
                    className="rounded-md px-2 py-1 text-xs text-muted hover:text-content"
                  >
                    {s.published ? t("admin.services.hide") : t("admin.services.publish")}
                  </button>
                  <button type="button" onClick={() => startEdit(s)} className="rounded-md p-1.5 text-muted hover:text-content" aria-label={t("admin.services.edit")}>
                    <Icon name="Pencil" className="h-4 w-4" />
                  </button>
                  <ConfirmButton
                    confirmLabel={t("admin.services.delete")}
                    onConfirm={async () => {
                      const res = await deleteService(s.id);
                      if (!res.error) router.refresh();
                      return res;
                    }}
                    successMessage={t("admin.services.deleted")}
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
