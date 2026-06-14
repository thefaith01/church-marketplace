import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ConditionalHeader } from "@/components/ConditionalHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Church Member Marketplace",
  description: "Private marketplace for verified Christian services",
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
      </body>
    </html>
  );
}
