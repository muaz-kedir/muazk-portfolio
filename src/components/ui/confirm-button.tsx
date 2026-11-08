"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Button, type ButtonProps } from "./button";
import { useI18n } from "@/lib/i18n/provider";

type Mode = "idle" | "confirm" | "done" | "error";

/**
 * A button that asks for confirmation before running an async server action.
 * Useful for destructive operations (delete, unpublish).
 */
export function ConfirmButton({
  children,
  confirmLabel,
  message,
  onConfirm,
  successMessage,
  ...props
}: {
  children: ReactNode;
  confirmLabel: string;
  message?: string;
  onConfirm: () => Promise<{ ok?: boolean; error?: string } | void>;
  successMessage?: string;
} & Omit<ButtonProps, "onClick">) {
  const { t } = useI18n();
  const [pending, start] = useTransition();
  const [mode, setMode] = useState<Mode>("idle");
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  if (mode === "confirm") {
    return (
      <span className="inline-flex items-center gap-2">
        <Button
          size="sm"
          variant="danger"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const res = await onConfirm();
              if (res && res.error) {
                setErrorMsg(res.error);
                setMode("error");
                return;
              }
              setMode("done");
            });
          }}
        >
          {pending ? t("admin.common.working") : confirmLabel}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => setMode("idle")}
        >
          {t("admin.common.cancel")}
        </Button>
        {message ? (
          <span className="text-xs text-muted">{message}</span>
        ) : null}
      </span>
    );
  }

  if (mode === "error") {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-xs text-red-400">{errorMsg}</span>
        <Button size="sm" variant="ghost" onClick={() => setMode("idle")}>
          {t("admin.common.retry")}
        </Button>
      </span>
    );
  }

  if (mode === "done") {
    return <span className="text-xs text-emerald-400">{successMessage ?? t("admin.common.done")}</span>;
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => setMode("confirm")}
      {...props}
    >
      {children}
    </Button>
  );
}
