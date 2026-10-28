import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata = pageMetadata({
  title: "How church verification works",
  description:
    "How Church Member Marketplace confirms that people are members of a local church before they can browse, message or book, and what verification does and does not tell you.",
  path: "/how-verification-works",
});

const faqs = [
  {
    q: "Who can use Church Member Marketplace?",
    a: "Anyone can sign up, but only people confirmed as members of a local church can browse listings, message or book. Until you are verified, the marketplace stays locked.",
  },
  {
    q: "How do I get verified?",
    a: "Sign up, then add your church on your dashboard. Select your church if it is listed, or share reference details so an admin can follow it up. An admin or a leader from your church confirms your membership, and the marketplace unlocks.",
  },
  {
    q: "Who confirms my membership?",
    a: "An admin or a leader from your own church. They know who belongs to their congregation, which is why a confirmation from them carries weight.",
  },
  {
    q: "Does verification mean a provider has been background checked?",
    a: "No. Verification confirms church membership only. It does not check someone's work, qualifications, insurance or character, and it is not a DBS check. Treat it as a starting point for your own judgement, never a guarantee.",
  },
  {
    q: "What should I do for childcare, tutoring or eldercare?",
    a: "Take extra care. Ask whether the person holds a current DBS certificate, ask for references from other families and never leave a child or vulnerable adult alone with someone you have not met.",
  },
  {
    q: "Can I see who else is a member?",
    a: "No. Listings, provider profiles, messages and church pages are private to verified members and are not published to the open web.",
  },
  {
    q: "What if something does not feel right?",
    a: "Use the Report link on the listing or profile. Admins review reports and can deactivate accounts, listings or churches. Concerns about the safety of a child or vulnerable adult should also go to the police or your local authority safeguarding team straight away.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function HowVerificationWorksPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd data={faqJsonLd} />
      <h1 className="font-display text-[34px] font-bold tracking-[-0.02em] text-ink">
        How church verification works
      </h1>
      <p className="mt-3 text-[17px] leading-[1.6] text-muted">
        Church Member Marketplace is private. Before anyone can browse, message or book, someone from their church confirms they belong there. This page explains the steps and is honest about the limits.
      </p>

      <div className="mt-8 space-y-6">
        {faqs.map((f) => (
          <section key={f.q} className="rounded-[20px] border border-line bg-paper p-6">
            <h2 className="font-display text-lg font-bold text-ink">{f.q}</h2>
            <p className="mt-2 text-sm leading-[1.6] text-muted">{f.a}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-[17px] leading-[1.6] text-muted">
        For practical advice on hiring, read the <Link href="/safe-hiring" className="text-clay underline">safe hiring guide</Link>. Church leaders can see <Link href="/for-churches" className="text-clay underline">how to bring a congregation on board</Link>, or you can <Link href="/signup" className="text-clay underline">join free</Link> and get verified through your church.
      </p>
    </div>
  );
}
