"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { setProjectStatus, deleteProject } from "@/lib/actions/projects";
import type { ProjectStatusValue } from "@/components/ui/status-badge";
import { useI18n } from "@/lib/i18n/provider";

export function ProjectActions({ id, status }: { id: string; status: ProjectStatusValue }) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, start] = useTransition();

  const change = (next: ProjectStatusValue) =>
    start(async () => {
      await setProjectStatus(id, next);
      router.refresh();
    });

  return (
    <div className="flex items-center justify-end gap-2">
      {status !== "PUBLISHED" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("PUBLISHED")}
          className="rounded-md px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
        >
          {t("admin.projects.publish")}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("UNPUBLISHED")}
          className="rounded-md px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"
        >
          {t("admin.projects.unpublish")}
        </button>
      )}
      <ConfirmButton
        confirmLabel={t("admin.projects.delete")}
        onConfirm={async () => {
          const res = await deleteProject(id);
          if (!res.error) router.refresh();
          return res;
        }}
        successMessage={t("admin.projects.deleted")}
        className="text-xs text-red-400 hover:bg-red-500/10"
      >
        {t("admin.projects.delete")}
      </ConfirmButton>
    </div>
  );
}
