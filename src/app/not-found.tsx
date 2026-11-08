import Link from "next/link";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden="true" />
      <Container className="relative">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          404
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-content sm:text-5xl">
          {t("notFound.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          {t("notFound.description")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonVariants("primary", "lg")}>
            {t("notFound.backHome")}
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
          <Link href="/projects" className={buttonVariants("outline", "lg")}>
            {t("notFound.browseProjects")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
