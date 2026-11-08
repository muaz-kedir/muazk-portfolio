"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TagList } from "@/components/admin/tag-list";
import { cn, slugify } from "@/lib/utils";
import { createProject, updateProject } from "@/lib/actions/projects";
import { useI18n } from "@/lib/i18n/provider";
import type { ProjectInput } from "@/lib/validation/schemas";

export interface ProjectFormInitial {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  category: string | null;
  role: string | null;
  technologies: string[];
  features: string[];
  overview: string | null;
  problem: string | null;
  targetUsers: string | null;
  goals: string | null;
  architecture: string | null;
  challenges: string | null;
  testingNotes: string | null;
  futureImprovements: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  isFeatured: boolean;
  displayOrder: number;
  thumbnailMediaId: string | null;
  screenshotIds: string[];
}

interface MediaOption {
  id: string;
  url: string;
  originalName: string | null;
}

export function ProjectForm({
  project,
  mediaImages,
}: {
  project?: ProjectFormInitial;
  mediaImages: MediaOption[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<ProjectInput>(() => ({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    shortDescription: project?.shortDescription ?? "",
    description: project?.description ?? "",
    category: project?.category ?? "",
    role: project?.role ?? "",
    technologies: project?.technologies ?? [],
    features: project?.features ?? [],
    overview: project?.overview ?? "",
    problem: project?.problem ?? "",
    targetUsers: project?.targetUsers ?? "",
    goals: project?.goals ?? "",
    architecture: project?.architecture ?? "",
    challenges: project?.challenges ?? "",
    testingNotes: project?.testingNotes ?? "",
    futureImprovements: project?.futureImprovements ?? "",
    githubUrl: project?.githubUrl ?? "",
    liveUrl: project?.liveUrl ?? "",
    status: project?.status ?? "DRAFT",
    isFeatured: project?.isFeatured ?? false,
    displayOrder: project?.displayOrder ?? 0,
    thumbnailMediaId: project?.thumbnailMediaId ?? null,
    screenshotIds: project?.screenshotIds ?? [],
  }));

  const update = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleScreenshot = (id: string) =>
    setForm((f) => ({
      ...f,
      screenshotIds: f.screenshotIds.includes(id)
        ? f.screenshotIds.filter((x) => x !== id)
        : [...f.screenshotIds, id],
    }));

  const submit = () => {
    setError(null);
    setSaved(false);
    setFieldErrors({});
    start(async () => {
      const payload: ProjectInput = {
        ...form,
        slug: form.slug?.trim() ? slugify(form.slug) : undefined,
      };
      const res = project
        ? await updateProject(project.id, payload)
        : await createProject(payload);
      if (res.error) {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      if (project) {
        setSaved(true);
        router.refresh();
      } else if (res.id) {
        router.push(`/admin/projects/${res.id}/edit?created=1`);
      }
    });
  };

  return (
    <div className="space-y-8">
      {saved ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
          <Icon name="CheckCircle2" className="h-4 w-4" /> {t("admin.projects.saved")}
        </div>
      ) : null}
      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400" role="alert">
          <Icon name="CircleAlert" className="h-4 w-4" /> {error}
        </div>
      ) : null}

      <Section title={t("admin.projects.basics")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("admin.projects.titleField")} htmlFor="title" required error={fieldErrors.title}>
            <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} />
          </Field>
          <Field label={t("admin.projects.slug")} htmlFor="slug" hint={t("admin.projects.slugHint")} error={fieldErrors.slug}>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="auto"
            />
          </Field>
        </div>
        <Field label={t("admin.projects.category")} htmlFor="category" error={fieldErrors.category}>
          <Input id="category" value={form.category ?? ""} onChange={(e) => update("category", e.target.value)} />
        </Field>
        <Field label={t("admin.projects.shortDescription")} htmlFor="short" error={fieldErrors.shortDescription}>
          <Textarea
            id="short"
            rows={2}
            value={form.shortDescription ?? ""}
            onChange={(e) => update("shortDescription", e.target.value)}
            placeholder={t("admin.projects.shortDescriptionPlaceholder")}
          />
        </Field>
        <Field label={t("admin.projects.overview")} htmlFor="description" error={fieldErrors.description}>
          <Textarea
            id="description"
            rows={5}
            value={form.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("admin.projects.role")} htmlFor="role" error={fieldErrors.role}>
            <Input id="role" value={form.role ?? ""} onChange={(e) => update("role", e.target.value)} />
          </Field>
          <Field label={t("admin.projects.displayOrder")} htmlFor="order" error={fieldErrors.displayOrder}>
            <Input
              id="order"
              type="number"
              value={String(form.displayOrder)}
              onChange={(e) => update("displayOrder", Number(e.target.value) || 0)}
            />
          </Field>
        </div>
      </Section>

      <Section title={t("admin.projects.technologies")}>
        <Field label={t("admin.projects.technologiesLabel")} error={fieldErrors.technologies}>
          <TagList value={form.technologies} onChange={(v) => update("technologies", v)} placeholder={t("admin.projects.technologiesPlaceholder")} />
        </Field>
        <Field label={t("admin.projects.keyFeatures")} error={fieldErrors.features}>
          <TagList value={form.features} onChange={(v) => update("features", v)} placeholder={t("admin.projects.keyFeaturesPlaceholder")} />
        </Field>
      </Section>

      <Section title={t("admin.projects.caseStudy")}>
        <Grid2>
          <Field label={t("admin.projects.problem")} error={fieldErrors.problem}><Textarea value={form.problem ?? ""} onChange={(e) => update("problem", e.target.value)} /></Field>
          <Field label={t("admin.projects.targetUsers")} error={fieldErrors.targetUsers}><Textarea value={form.targetUsers ?? ""} onChange={(e) => update("targetUsers", e.target.value)} /></Field>
          <Field label={t("admin.projects.goals")} error={fieldErrors.goals}><Textarea value={form.goals ?? ""} onChange={(e) => update("goals", e.target.value)} /></Field>
          <Field label={t("admin.projects.architecture")} error={fieldErrors.architecture}><Textarea value={form.architecture ?? ""} onChange={(e) => update("architecture", e.target.value)} /></Field>
          <Field label={t("admin.projects.challenges")} error={fieldErrors.challenges}><Textarea value={form.challenges ?? ""} onChange={(e) => update("challenges", e.target.value)} /></Field>
          <Field label={t("admin.projects.testing")} error={fieldErrors.testingNotes}><Textarea value={form.testingNotes ?? ""} onChange={(e) => update("testingNotes", e.target.value)} /></Field>
        </Grid2>
        <Field label={t("admin.projects.futureImprovements")} error={fieldErrors.futureImprovements}>
          <Textarea value={form.futureImprovements ?? ""} onChange={(e) => update("futureImprovements", e.target.value)} />
        </Field>
      </Section>

      <Section title={t("admin.projects.links")}>
        <Grid2>
          <Field label={t("admin.projects.githubUrl")} error={fieldErrors.githubUrl}>
            <Input value={form.githubUrl ?? ""} onChange={(e) => update("githubUrl", e.target.value)} placeholder="https://github.com/..." />
          </Field>
          <Field label={t("admin.projects.liveUrl")} error={fieldErrors.liveUrl}>
            <Input value={form.liveUrl ?? ""} onChange={(e) => update("liveUrl", e.target.value)} placeholder="https://..." />
          </Field>
        </Grid2>
      </Section>

      <Section title={t("admin.projects.publishing")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("admin.projects.status")} error={fieldErrors.status}>
            <Select value={form.status} onChange={(e) => update("status", e.target.value as ProjectInput["status"])}>
              <option value="DRAFT">{t("status.draft")}</option>
              <option value="PUBLISHED">{t("status.published")}</option>
              <option value="UNPUBLISHED">{t("status.unpublished")}</option>
            </Select>
          </Field>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => update("isFeatured", e.target.checked)}
                className="h-4 w-4 rounded border-border-subtle bg-elevated accent-accent"
              />
              {t("admin.projects.featuredProject")}
            </label>
          </div>
        </div>
      </Section>

      <Section title={t("admin.projects.media")}>
        <Field label={t("admin.projects.thumbnail")} hint={t("admin.projects.thumbnailHint")} error={fieldErrors.thumbnailMediaId}>
          <Select
            value={form.thumbnailMediaId ?? ""}
            onChange={(e) => update("thumbnailMediaId", e.target.value || null)}
          >
            <option value="">{t("admin.projects.noThumbnail")}</option>
            {mediaImages.map((m) => (
              <option key={m.id} value={m.id}>
                {m.originalName ?? m.id}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("admin.projects.screenshots")} error={fieldErrors.screenshotIds}>
          {mediaImages.length === 0 ? (
            <p className="text-sm text-faint">{t("admin.projects.noImages")}</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {mediaImages.map((m) => {
                const checked = form.screenshotIds.includes(m.id);
                return (
                  <li key={m.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-2.5",
                        checked ? "border-accent/50 bg-accent/5" : "border-border-subtle"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt="" className="h-12 w-20 rounded-md object-cover" />
                      <span className="min-w-0 flex-1 truncate text-sm text-content">
                        {m.originalName ?? m.id}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleScreenshot(m.id)}
                        className="h-4 w-4 accent-accent"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </Field>
      </Section>

      <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-6">
        <Button variant="ghost" onClick={() => router.push("/admin/projects")}>
          {t("admin.common.cancel")}
        </Button>
        <Button variant="primary" disabled={pending} onClick={submit}>
          {pending
            ? t("admin.projects.saving")
            : project
              ? t("admin.projects.saveChanges")
              : t("admin.projects.createProject")}
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

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}
