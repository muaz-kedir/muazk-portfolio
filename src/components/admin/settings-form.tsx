"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { updateSettings } from "@/lib/actions/settings";
import { useI18n } from "@/lib/i18n/provider";
import type { SettingsInput } from "@/lib/validation/schemas";

interface SettingsInitial {
  siteTitle: string;
  metaDescription: string | null;
  favicon: string | null;
  footerContent: string | null;
  contactEmail: string | null;
  themeAccent: string;
  cvVisible: boolean;
  socialImageId: string | null;
}

interface MediaOption {
  id: string;
  originalName: string | null;
}

export function SettingsForm({
  settings,
  mediaImages,
}: {
  settings: SettingsInitial;
  mediaImages: MediaOption[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<SettingsInput>({
    siteTitle: settings.siteTitle,
    metaDescription: settings.metaDescription ?? "",
    favicon: settings.favicon ?? "",
    footerContent: settings.footerContent ?? "",
    contactEmail: settings.contactEmail ?? "",
    themeAccent: settings.themeAccent,
    cvVisible: settings.cvVisible,
    socialImageId: settings.socialImageId,
    socialLinks: undefined,
  });

  const update = <K extends keyof SettingsInput>(k: K, v: SettingsInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await updateSettings(form);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="max-w-3xl space-y-8">
      {saved ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
          <Icon name="CheckCircle2" className="h-4 w-4" /> {t("admin.settings.saved")}
        </div>
      ) : null}
      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400" role="alert">
          <Icon name="CircleAlert" className="h-4 w-4" /> {error}
        </div>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface/40 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">{t("admin.settings.site")}</h2>
        <Field label={t("admin.settings.siteTitle")}><Input value={form.siteTitle} onChange={(e) => update("siteTitle", e.target.value)} /></Field>
        <Field label={t("admin.settings.metaDescription")} hint={t("admin.settings.metaHint")}><Textarea rows={3} value={form.metaDescription ?? ""} onChange={(e) => update("metaDescription", e.target.value)} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("admin.settings.faviconPath")}><Input value={form.favicon ?? ""} onChange={(e) => update("favicon", e.target.value)} placeholder="/favicon.ico" /></Field>
          <Field label={t("admin.settings.contactEmail")}><Input type="email" value={form.contactEmail ?? ""} onChange={(e) => update("contactEmail", e.target.value)} /></Field>
        </div>
        <Field label={t("admin.settings.footerContent")}><Textarea rows={2} value={form.footerContent ?? ""} onChange={(e) => update("footerContent", e.target.value)} /></Field>
      </section>

      <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface/40 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">{t("admin.settings.appearance")}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("admin.settings.themeAccent")} hint={t("admin.settings.themeAccentHint")}>
            <Select value={form.themeAccent} onChange={(e) => update("themeAccent", e.target.value)}>
              <option value="blue">{t("admin.settings.blue")}</option>
              <option value="violet">{t("admin.settings.violet")}</option>
            </Select>
          </Field>
          <Field label={t("admin.settings.socialImage")} hint={t("admin.settings.socialImageHint")}>
            <Select value={form.socialImageId ?? ""} onChange={(e) => update("socialImageId", e.target.value || null)}>
              <option value="">{t("admin.settings.none")}</option>
              {mediaImages.map((m) => (
                <option key={m.id} value={m.id}>{m.originalName ?? m.id}</option>
              ))}
            </Select>
          </Field>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
          <input type="checkbox" checked={form.cvVisible} onChange={(e) => update("cvVisible", e.target.checked)} className="h-4 w-4 accent-accent" />
          {t("admin.settings.allowCv")}
        </label>
      </section>

      <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-6">
        <Button onClick={submit} disabled={pending}>
          {pending ? t("admin.settings.saving") : t("admin.settings.saveSettings")}
          <Icon name="Save" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
