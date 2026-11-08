import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.meta.privacy,
    description: dict.meta.privacyDescription,
  };
}

export default async function PrivacyPage() {
  const { t } = await getI18n();

  return (
    <Container className="py-16">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-content">
          {t("privacy.title")}
        </h1>
        <div className="prose-invert mt-6 space-y-5 text-sm leading-7 text-muted">
          <p>{t("privacy.intro")}</p>
          <h2 className="text-lg font-semibold text-content">
            {t("privacy.contactTitle")}
          </h2>
          <p>{t("privacy.contactBody")}</p>
          <h2 className="text-lg font-semibold text-content">
            {t("privacy.assistantTitle")}
          </h2>
          <p>{t("privacy.assistantBody")}</p>
          <h2 className="text-lg font-semibold text-content">
            {t("privacy.emailTitle")}
          </h2>
          <p>{t("privacy.emailBody")}</p>
          <h2 className="text-lg font-semibold text-content">
            {t("privacy.analyticsTitle")}
          </h2>
          <p>{t("privacy.analyticsBody")}</p>
          <h2 className="text-lg font-semibold text-content">
            {t("privacy.cookiesTitle")}
          </h2>
          <p>{t("privacy.cookiesBody")}</p>
          <h2 className="text-lg font-semibold text-content">
            {t("privacy.choicesTitle")}
          </h2>
          <p>{t("privacy.choicesBody")}</p>
        </div>
      </div>
    </Container>
  );
}
