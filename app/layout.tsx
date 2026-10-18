import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ConditionalHeader } from "@/components/ConditionalHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "A private marketplace where verified members of local churches hire one another.",
  applicationName: SITE_NAME,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream">
        <ConditionalHeader>
          <Header />
        </ConditionalHeader>
        <main className="min-h-screen bg-cream text-ink">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
