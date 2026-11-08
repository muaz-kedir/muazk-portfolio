"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useI18n } from "@/lib/i18n/provider";
import { translateMessage } from "@/lib/i18n";
import { loginAction, type LoginState } from "@/lib/actions/auth";

export function LoginForm() {
  const { t, dict } = useI18n();
  const [state, action, pending] = useActionState<LoginState | undefined, FormData>(
    loginAction,
    undefined
  );

  const errorMessage = state?.error
    ? translateMessage(dict, state.error, { seconds: state.retryAfterSeconds ?? 0 })
    : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-lg font-semibold text-content"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Icon name="Sparkles" className="h-4 w-4" />
            </span>
            Mukti
          </Link>
          <LanguageSwitcher variant="compact" />
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface/70 p-7">
          <h1 className="text-xl font-semibold text-content">{t("admin.login.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("admin.login.subtitle")}</p>

          {errorMessage ? (
            <div
              className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-sm text-red-400"
              role="alert"
            >
              <Icon name="CircleAlert" className="h-4 w-4" />
              {errorMessage}
            </div>
          ) : null}

          <form action={action} className="mt-5 space-y-4">
            <Field label={t("admin.login.email")} htmlFor="email" required>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@example.com"
              />
            </Field>
            <Field label={t("admin.login.password")} htmlFor="password" required>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
            </Field>
            <Button type="submit" className="w-full" variant="primary" size="lg" disabled={pending}>
              {pending ? t("admin.login.signingIn") : t("admin.login.signIn")}
              <Icon name="ArrowRight" className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted hover:text-content"
        >
          <Icon name="ArrowRight" className="h-4 w-4 rotate-180" />
          {t("admin.login.backToSite")}
        </Link>
      </div>
    </div>
  );
}
