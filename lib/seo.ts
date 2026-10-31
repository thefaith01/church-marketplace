import type { Metadata } from "next";

export const SITE_URL = "https://www.cmmarketplace.org";
export const SITE_NAME = "Church Member Marketplace";

/** Public marketing pages. Used by the sitemap. Church pages and join links are deliberately absent. */
export const PUBLIC_PATHS = ["/", "/about", "/for-churches", "/help", "/safe-hiring", "/how-verification-works", "/privacy", "/terms", "/signup"] as const;

/** Metadata for a public page: unique title and description, canonical, Open Graph and Twitter tags. */
export function pageMetadata(args: { title: string; description: string; path: string; absoluteTitle?: boolean }): Metadata {
  const fullTitle = args.absoluteTitle ? args.title : `${args.title} | ${SITE_NAME}`;
  return {
    title: args.absoluteTitle ? { absolute: args.title } : args.title,
    description: args.description,
    alternates: { canonical: args.path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_GB",
      url: args.path,
      title: fullTitle,
      description: args.description,
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description: args.description,
    },
  };
}

/** Metadata for anything behind the verification gate. */
export const noIndexMetadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/** Serialise JSON-LD safely for a script tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\u003c");
}
