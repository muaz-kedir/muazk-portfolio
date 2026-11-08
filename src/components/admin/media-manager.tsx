"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { useI18n } from "@/lib/i18n/provider";
import { uploadMedia, deleteMedia } from "@/lib/actions/media";

interface MediaItem {
  id: string;
  url: string;
  originalName: string | null;
  mimeType: string;
  size: number;
  category: string;
  isPublic: boolean;
  createdAt: Date;
}

const CATEGORIES = [
  "PROJECT_THUMBNAIL",
  "PROJECT_SCREENSHOT",
  "PROFILE",
  "SOCIAL",
  "CV",
  "MISC",
] as const;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaManager({ media }: { media: MediaItem[] }) {
  const router = useRouter();
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("PROJECT_SCREENSHOT");
  const [isPublic, setIsPublic] = useState(true);

  const isCV = category === "CV";

  const onUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError(t("admin.common.chooseFile"));
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", category);
    fd.append("isPublic", String(!isCV && isPublic));
    start(async () => {
      const res = await uploadMedia(fd);
      if (res.error) {
        setError(
          res.error === "errors.uploadFailed"
            ? t("errors.uploadFailed")
            : res.error
        );
        return;
      }
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border-subtle bg-surface/40 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-faint">
          {t("admin.media.upload")}
        </h2>
        {error ? (
          <p className="mb-3 text-sm text-red-400" role="alert">{error}</p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3 lg:col-span-1">
            <label className="mb-1.5 block text-sm font-medium text-content">
              {t("admin.media.file")}
            </label>
            <input ref={fileRef} type="file" accept={isCV ? "application/pdf" : "image/*"} className="block w-full rounded-xl border border-border-subtle bg-elevated px-3 py-2.5 text-sm text-content file:mr-3 file:rounded-lg file:border-0 file:bg-accent/15 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-accent hover:file:bg-accent/25" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-content">
              {t("admin.media.category")}
            </label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`admin.media.categories.${c}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            {isCV ? (
              <p className="text-xs text-faint">{t("admin.media.cvNote")}</p>
            ) : (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 accent-accent" />
                {t("admin.media.public")}
              </label>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={onUpload} disabled={pending}>
            {pending ? t("admin.media.uploading") : t("admin.media.upload")}
            <Icon name="Plus" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-faint">
          {t("admin.media.library")}
        </h2>
        {media.length === 0 ? (
          <p className="text-sm text-muted">{t("admin.media.noFiles")}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {media.map((m) => (
              <li key={m.id} className="overflow-hidden rounded-2xl border border-border-subtle bg-surface/40">
                <div className="aspect-video bg-elevated">
                  {m.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.originalName ?? ""} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted">
                      <Icon name="FileText" className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-content">
                    {m.originalName ?? t("admin.media.untitled")}
                  </p>
                  <p className="text-xs text-faint">{formatSize(m.size)} · {m.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    {m.isPublic ? (
                      <Badge tone="success">{t("status.public")}</Badge>
                    ) : (
                      <Badge tone="warning">{t("status.private")}</Badge>
                    )}
                    <ConfirmButton
                      confirmLabel={t("admin.media.delete")}
                      onConfirm={async () => {
                        const res = await deleteMedia(m.id);
                        if (!res.error) router.refresh();
                        return res;
                      }}
                      successMessage={t("admin.media.deleted")}
                      className="text-red-400 hover:bg-red-500/10"
                    >
                      <Icon name="Trash2" className="h-4 w-4" />
                    </ConfirmButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
