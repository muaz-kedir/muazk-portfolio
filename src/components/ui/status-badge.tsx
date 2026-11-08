"use client";

import { Badge } from "./badge";
import { useI18n } from "@/lib/i18n/provider";

export type ProjectStatusValue = "DRAFT" | "PUBLISHED" | "UNPUBLISHED";

export function StatusBadge({ status }: { status: ProjectStatusValue }) {
  const { t } = useI18n();
  if (status === "PUBLISHED") return <Badge tone="success">{t("status.published")}</Badge>;
  if (status === "DRAFT") return <Badge tone="warning">{t("status.draft")}</Badge>;
  return <Badge tone="danger">{t("status.unpublished")}</Badge>;
}
