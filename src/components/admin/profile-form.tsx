"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { updateProfile } from "@/lib/actions/profile";
import { useI18n } from "@/lib/i18n/provider";
import type { ProfileInput } from "@/lib/validation/schemas";

interface ProfileInitial {
  name: string;
  title: string | null;
  eyebrow: string | null;
  heroHeadline: string | null;
  heroDescription: string | null;
  bio: string | null;
  interests: string | null;
  approach: string | null;
  learningGoals: string | null;
  ambitions: string | null;
  education: string | null;
  publicEmail: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  isAvailable: boolean;
  aboutVisible: boolean;
  cvVisible: boolean;
  profileImageId: string | null;
  cvFileId: string | null;
}

interface MediaOption {
  id: string;
  originalName: string | null;
}

export function ProfileForm({
  profile,
  mediaImages,
  mediaDocs,
}: {
  profile: ProfileInitial;
  mediaImages: MediaOption[];
  mediaDocs: MediaOption[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ProfileInput>({
    name: profile.name,
    title: profile.title ?? "",
    eyebrow: profile.eyebrow ?? "",
    heroHeadline: profile.heroHeadline ?? "",
    heroDescription: profile.heroDescription ?? "",
    bio: profile.bio ?? "",
    interests: profile.interests ?? "",
    approach: profile.approach ?? "",
    learningGoals: profile.learningGoals ?? "",
    ambitions: profile.ambitions ?? "",
    education: profile.education ?? "",
    publicEmail: profile.publicEmail ?? "",
    githubUrl: profile.githubUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    otherLinks: undefined,
    isAvailable: profile.isAvailable,
    aboutVisible: profile.aboutVisible,
    cvVisible: profile.cvVisible,
    profileImageId: profile.profileImageId,
    cvFileId: profile.cvFileId,
  });

  const update = <K extends keyof ProfileInput>(k: K, v: ProfileInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await updateProfile(form);
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
          <Icon name="CheckCircle2" className="h-4 w-4" /> {t("admin.profile.saved")}
        </div>
      ) : null}
      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400" role="alert">
          <Icon name="CircleAlert" className="h-4 w-4" /> {error}
        </div>
      ) : null}

      <Section title={t("admin.profile.identity")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("admin.profile.name")}><Input value={form.name} onChange={(e) => update("name", e.target.value)} /></Field>
          <Field label={t("admin.profile.professionalTitle")}><Input value={form.title ?? ""} onChange={(e) => update("title", e.target.value)} /></Field>
        </div>
        <Field label={t("admin.profile.eyebrowText")}><Input value={form.eyebrow ?? ""} onChange={(e) => update("eyebrow", e.target.value)} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("admin.profile.publicEmail")}><Input type="email" value={form.publicEmail ?? ""} onChange={(e) => update("publicEmail", e.target.value)} /></Field>
          <Field label={t("admin.profile.linkedinUrl")}><Input value={form.linkedinUrl ?? ""} onChange={(e) => update("linkedinUrl", e.target.value)} /></Field>
        </div>
        <Field label={t("admin.profile.githubUrl")}><Input value={form.githubUrl ?? ""} onChange={(e) => update("githubUrl", e.target.value)} /></Field>
      </Section>

      <Section title={t("admin.profile.hero")}>
        <Field label={t("admin.profile.heroHeadline")}><Input value={form.heroHeadline ?? ""} onChange={(e) => update("heroHeadline", e.target.value)} /></Field>
        <Field label={t("admin.profile.heroDescription")}><Textarea rows={3} value={form.heroDescription ?? ""} onChange={(e) => update("heroDescription", e.target.value)} /></Field>
        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => update("isAvailable", e.target.checked)} className="h-4 w-4 accent-accent" />
            {t("admin.profile.showAvailable")}
          </label>
        </div>
      </Section>

      <Section title={t("admin.profile.about")}>
        <Field label={t("admin.profile.biography")}><Textarea rows={5} value={form.bio ?? ""} onChange={(e) => update("bio", e.target.value)} /></Field>
        <Field label={t("admin.profile.interests")}><Textarea rows={2} value={form.interests ?? ""} onChange={(e) => update("interests", e.target.value)} /></Field>
        <Field label={t("admin.profile.approach")}><Textarea rows={3} value={form.approach ?? ""} onChange={(e) => update("approach", e.target.value)} /></Field>
        <Field label={t("admin.profile.learningGoals")}><Textarea rows={2} value={form.learningGoals ?? ""} onChange={(e) => update("learningGoals", e.target.value)} /></Field>
        <Field label={t("admin.profile.ambitions")}><Textarea rows={2} value={form.ambitions ?? ""} onChange={(e) => update("ambitions", e.target.value)} /></Field>
        <Field label={t("admin.profile.educationSummary")}><Textarea rows={2} value={form.education ?? ""} onChange={(e) => update("education", e.target.value)} /></Field>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
          <input type="checkbox" checked={form.aboutVisible} onChange={(e) => update("aboutVisible", e.target.checked)} className="h-4 w-4 accent-accent" />
          {t("admin.profile.showAbout")}
        </label>
      </Section>

      <Section title={t("admin.profile.media")}>
        <Field label={t("admin.profile.profileImage")} hint={t("admin.profile.profileImageHint")}>
          <Select value={form.profileImageId ?? ""} onChange={(e) => update("profileImageId", e.target.value || null)}>
            <option value="">{t("admin.profile.noImage")}</option>
            {mediaImages.map((m) => (
              <option key={m.id} value={m.id}>{m.originalName ?? m.id}</option>
            ))}
          </Select>
        </Field>
        <Field label={t("admin.profile.cvFile")} hint={t("admin.profile.cvFileHint")}>
          <Select value={form.cvFileId ?? ""} onChange={(e) => update("cvFileId", e.target.value || null)}>
            <option value="">{t("admin.profile.noCv")}</option>
            {mediaDocs.map((m) => (
              <option key={m.id} value={m.id}>{m.originalName ?? m.id}</option>
            ))}
          </Select>
        </Field>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
          <input type="checkbox" checked={form.cvVisible} onChange={(e) => update("cvVisible", e.target.checked)} className="h-4 w-4 accent-accent" />
          {t("admin.profile.showCv")}
        </label>
      </Section>

      <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-6">
        <Button onClick={submit} disabled={pending}>
          {pending ? t("admin.profile.saving") : t("admin.profile.saveProfile")}
          <Icon name="Save" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface/40 p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-faint">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
