"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { useI18n } from "@/lib/i18n/provider";
import { translateMessage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import {
  createExperience,
  updateExperience,
  deleteExperience,
} from "@/lib/actions/experience";

interface ExperienceItem {
  id: string;
  kind: string;
  title: string;
  organization: string | null;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  current: boolean;
  displayOrder: number;
  published: boolean;
  url: string | null;
  urlLabel: string | null;
}

function toInputDate(d: Date | null | undefined): string {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
}

export function ExperienceManager({
  items,
  kinds,
  defaultKind,
}: {
  items: ExperienceItem[];
  kinds: string[];
  defaultKind: string;
}) {
  const router = useRouter();
  const { t, dict } = useI18n();
  const kindLabels = dict.experience.kinds as Record<string, string>;
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    kind: defaultKind,
    title: "",
    organization: "",
    description: "",
    startDate: "",
    endDate: "",
    current: false,
    displayOrder: 0,
    published: true,
    url: "",
    urlLabel: "",
  });

  const startEdit = (it: ExperienceItem) => {
    setEditingId(it.id);
    setForm({
      kind: it.kind,
      title: it.title,
      organization: it.organization ?? "",
      description: it.description ?? "",
      startDate: toInputDate(it.startDate),
      endDate: toInputDate(it.endDate),
      current: it.current,
      displayOrder: it.displayOrder,
      published: it.published,
      url: it.url ?? "",
      urlLabel: it.urlLabel ?? "",
    });
    setError(null);
    setFieldErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const reset = () => {
    setEditingId(null);
    setForm({
      kind: defaultKind,
      title: "",
      organization: "",
      description: "",
      startDate: "",
      endDate: "",
      current: false,
      displayOrder: 0,
      published: true,
      url: "",
      urlLabel: "",
    });
    setError(null);
    setFieldErrors({});
  };

  const submit = () => {
    setError(null);
    setFieldErrors({});
    start(async () => {
      const payload = {
        ...form,
        kind: form.kind as "EDUCATION" | "INTERNSHIP" | "EMPLOYMENT" | "CERTIFICATION" | "TRAINING" | "ACADEMIC_PROJECT" | "ACHIEVEMENT",
        // Zod's experienceSchema transforms string dates to Date objects server-side.
        // We cast here so TypeScript is happy passing the raw form strings.
        startDate: form.startDate as unknown as Date,
        endDate: form.endDate as unknown as Date,
        organization: form.organization || undefined,
        description: form.description || undefined,
      };
      const res = editingId ? await updateExperience(editingId, payload) : await createExperience(payload);
      if (res.error) {
        setError(translateMessage(dict, res.error));
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      reset();
      router.refresh();
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="rounded-2xl border border-border-subtle bg-surface/40 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-faint">
            {editingId ? t("admin.experience.editRecord") : t("admin.experience.addRecord")}
          </h2>
          {error ? <p className="mb-3 text-sm text-red-400" role="alert">{error}</p> : null}
          <div className="space-y-4">
            <Field label={t("admin.experience.type")} required>
              <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                {kinds.map((k) => (
                  <option key={k} value={k}>{kindLabels[k] ?? k}</option>
                ))}
              </Select>
            </Field>
            <Field label={t("admin.experience.recordTitle")} required>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label={t("admin.experience.organization")}>
              <Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
            </Field>
            <Field label={t("admin.experience.descriptionLabel")}>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("admin.experience.url")}
                hint={t("admin.experience.urlHint")}
                error={fieldErrors.url ? translateMessage(dict, fieldErrors.url) : undefined}
              >
                <Input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
              </Field>
              <Field
                label={t("admin.experience.urlLabel")}
                hint={t("admin.experience.urlLabelHint")}
                error={fieldErrors.urlLabel ? translateMessage(dict, fieldErrors.urlLabel) : undefined}
              >
                <Input value={form.urlLabel} onChange={(e) => setForm({ ...form, urlLabel: e.target.value })} placeholder={t("admin.experience.urlLabelPlaceholder")} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("admin.experience.startDate")}><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
              <Field label={t("admin.experience.endDate")}><Input type="date" value={form.endDate} disabled={form.current} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("admin.experience.displayOrder")}><Input type="number" value={String(form.displayOrder)} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 0 })} /></Field>
              <label className="flex cursor-pointer items-center gap-2 pt-6 text-sm text-content">
                <input type="checkbox" checked={form.current} onChange={(e) => setForm({ ...form, current: e.target.checked })} className="h-4 w-4 accent-accent" />
                {t("admin.experience.current")}
              </label>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4 accent-accent" />
              {t("admin.experience.published")}
            </label>
            <div className="flex items-center gap-3">
              <Button onClick={submit} disabled={pending}>
                {pending
                  ? t("admin.experience.saving")
                  : editingId
                    ? t("admin.experience.update")
                    : t("admin.experience.add")}
              </Button>
              {editingId ? <Button variant="ghost" onClick={reset}>{t("admin.common.cancel")}</Button> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        {items.length === 0 ? (
          <p className="text-sm text-muted">{t("admin.experience.noRecords")}</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="flex items-start justify-between rounded-xl border border-border-subtle bg-surface/40 p-4">
                <div>
                  <p className="text-sm font-medium text-content">{it.title}</p>
                  <p className="text-xs text-faint">
                    {kindLabels[it.kind] ?? it.kind}
                    {it.organization ? ` · ${it.organization}` : ""}
                    {it.startDate ? ` · ${toInputDate(it.startDate)}` : ""}
                    {it.current
                      ? ` — ${t("admin.experience.present")}`
                      : it.endDate
                        ? ` — ${toInputDate(it.endDate)}`
                        : ""}
                  </p>
                  {it.published ? <Badge tone="success">Published</Badge> : <Badge>Hidden</Badge>}
                  {it.url ? (
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={it.url}
                      className="mt-2 inline-flex max-w-[320px] items-center gap-1 text-xs text-accent hover:underline"
                    >
                      <Icon name="ExternalLink" className="h-3 w-3 shrink-0" />
                      <span className="truncate">{it.urlLabel || it.url}</span>
                    </a>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => startEdit(it)} className="rounded-md p-1.5 text-muted hover:text-content" aria-label={t("admin.experience.edit")}>
                    <Icon name="Pencil" className="h-4 w-4" />
                  </button>
                  <ConfirmButton
                    confirmLabel={t("admin.experience.delete")}
                    onConfirm={async () => {
                      const res = await deleteExperience(it.id);
                      if (!res.error) router.refresh();
                      return res;
                    }}
                    successMessage={t("admin.experience.deleted")}
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
