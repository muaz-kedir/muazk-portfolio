import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: {
      default: dict.meta.admin,
      template: "%s — " + dict.meta.admin,
    },
    robots: { index: false, follow: false },
  };
}

/**
 * Root admin layout. Contains only `children` so that `/admin/login` does NOT
 * get the authenticated sidebar shell (which lives in the nested
 * `(dashboard)` layout group).
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
