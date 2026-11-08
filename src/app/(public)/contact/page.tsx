import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/components/forms/contact-form";
import { ContactInfo } from "@/components/sections/contact-info";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.meta.contact,
    description: dict.meta.contactDescription,
  };
}

export default async function ContactPage() {
  const { t } = await getI18n();

  return (
    <div className="relative overflow-hidden">
      {/* Atmospheric glow */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-96 w-[700px] -translate-x-1/2 opacity-15 blur-[100px]"
        style={{ background: "linear-gradient(90deg, rgba(139,92,246,1), rgba(85,184,255,1))" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" aria-hidden="true" />

      <Container size="wide" className="relative py-20 sm:py-28">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {t("contact.eyebrow")}
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-content sm:text-5xl">
            {t("contact.titleLead")}{" "}
            <span className="text-gradient">{t("contact.titleAccent")}</span>
          </h1>
          <p className="mt-5 text-base leading-8 text-muted">
            {t("contact.description")}
          </p>
        </div>

        {/* Main grid */}
        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-8">
            <div className="glass rounded-2xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
              <ContactForm />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-faint">
                {t("contact.otherWays")}
              </p>
              <Suspense fallback={null}>
                <ContactInfo />
              </Suspense>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
