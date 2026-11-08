"use client";

import { useActionState } from "react";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import { translateMessage } from "@/lib/i18n";
import { submitContact, type ContactState } from "@/lib/actions/messages";

const INQUIRY_TYPES = [
  { value: "JOB_OR_INTERNSHIP", key: "inquiry.job" },
  { value: "FREELANCE_PROJECT", key: "inquiry.freelance" },
  { value: "COLLABORATION", key: "inquiry.collaboration" },
  { value: "OTHER", key: "inquiry.other" },
] as const;

export function ContactForm() {
  const { t, dict } = useI18n();
  const [state, action, pending] = useActionState<ContactState | undefined, FormData>(
    submitContact,
    undefined
  );

  const errorMessage = state?.error
    ? translateMessage(dict, state.error, { seconds: state.retryAfterSeconds ?? 0 })
    : undefined;

  const fieldError = (key: string) => {
    const message = state?.fieldErrors?.[key];
    return message ? translateMessage(dict, message) : undefined;
  };

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <Icon name="CheckCircle2" className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-content">
          {t("contact.form.receivedTitle")}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          {t("contact.form.receivedBody")}
        </p>
        <Button
          variant="ghost"
          className="mt-6"
          onClick={() => window.location.reload()}
        >
          {t("contact.form.sendAnother")}
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      {/* Honeypot: hidden from humans, bots tend to fill it */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {errorMessage ? (
        <div
          className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          <Icon name="CircleAlert" className="h-4 w-4" />
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("contact.form.name")} htmlFor="name" required error={fieldError("name")}>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder={t("contact.form.namePlaceholder")}
          />
        </Field>
        <Field label={t("contact.form.email")} htmlFor="email" required error={fieldError("email")}>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="jane@example.com"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("contact.form.inquiryType")} htmlFor="inquiryType" required>
          <Select id="inquiryType" name="inquiryType" required defaultValue="">
            <option value="" disabled>
              {t("contact.form.selectType")}
            </option>
            {INQUIRY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {t(type.key)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("contact.form.subject")} htmlFor="subject" required error={fieldError("subject")}>
          <Input
            id="subject"
            name="subject"
            required
            placeholder={t("contact.form.subjectPlaceholder")}
          />
        </Field>
      </div>

      <Field label={t("contact.form.message")} htmlFor="message" required error={fieldError("message")}>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder={t("contact.form.messagePlaceholder")}
        />
      </Field>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-faint">{t("contact.form.privacyNote")}</p>
        <Button type="submit" variant="primary" size="lg" disabled={pending}>
          {pending ? t("contact.form.sending") : t("contact.form.send")}
          <Icon name="Send" className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
