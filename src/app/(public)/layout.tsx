import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollProgress } from "@/components/ui/motion";
import { PortfolioAssistant } from "@/components/assistant/portfolio-assistant";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
      <PortfolioAssistant />
    </div>
  );
}
