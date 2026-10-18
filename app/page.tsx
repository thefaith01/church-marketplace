import { getCurrentUser } from "@/lib/session";
import { MarketingHome } from "@/components/MarketingHome";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Church Member Marketplace | Hire trusted members of local churches",
  description:
    "A private marketplace where verified members of local churches hire one another across congregations. Free to join, and every member is confirmed by their church before they can browse, message or book.",
  path: "/",
  absoluteTitle: true,
});

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "cmm",
    url: SITE_URL,
    description:
      "A private marketplace where verified members of local churches hire one another across congregations.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "cmm",
    url: SITE_URL,
    inLanguage: "en-GB",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  return (
    <>
      <JsonLd data={jsonLd} />
      <MarketingHome isLoggedIn={Boolean(user)} />
    </>
  );
}
