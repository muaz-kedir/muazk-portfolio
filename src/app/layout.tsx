import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { themeBootScript } from "@/lib/theme";
import { getI18n, getLocale } from "@/lib/i18n/server";
import { LANGUAGES } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

/**
 * The root layout reads the visitor's language cookie, which is request-time
 * data. With Cache Components enabled this route must be allowed to block
 * instead of being prerendered at build time.
 */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: dict.meta.siteTitle,
      template: "%s — Mukti",
    },
    description: dict.meta.siteDescription,
    keywords: [
      "Mukti",
      "software engineer",
      "full-stack developer",
      "web development",
      "mobile development",
      "Next.js",
      "Flutter",
    ],
    authors: [{ name: "Mukti" }],
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: dict.meta.siteTitle,
      title: dict.meta.siteTitle,
      description: dict.meta.ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.siteTitle,
      description: dict.meta.ogDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#08090D",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={LANGUAGES[locale].tag.split("-")[0]}
      dir={LANGUAGES[locale].dir}
      data-scroll-behavior="smooth"
      /* The theme boot script writes accent variables onto <html> before
         hydration — the mismatch is intentional and harmless. */
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-content">
        {/* Applies the stored accent theme before first paint (no flash). */}
        <script
          dangerouslySetInnerHTML={{ __html: themeBootScript() }}
          suppressHydrationWarning
        />
        <ThemeProvider>
          <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
