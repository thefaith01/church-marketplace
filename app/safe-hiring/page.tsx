import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata = pageMetadata({
  title: "How to hire someone from your church safely",
  description:
    "A practical guide to hiring a fellow church member for work at home or for your family: what to ask, what to agree in writing, and what church verification does and does not tell you.",
  path: "/safe-hiring",
});

const steps = [
  {
    q: "Ask for the basics before you agree anything",
    a: "Ask what the job involves, what it will cost, when it can start and whether they have done similar work before. For trades, ask about insurance and any qualifications the work needs, such as Gas Safe registration for gas work or NICEIC or similar for electrical work.",
  },
  {
    q: "Ask for references and look at past work",
    a: "A good provider will happily give you the names of people they have worked for, or show photos of finished jobs. Speak to someone who has used them before you commit, ideally someone you already know.",
  },
  {
    q: "Take extra care when children or vulnerable adults are involved",
    a: "For childminding, tutoring, eldercare and similar work, ask whether they hold a current DBS certificate, ask for references from other families, and never leave a child or a vulnerable person alone with someone you have not met. Being a church member is not a substitute for these checks.",
  },
  {
    q: "Agree the price and scope in writing",
    a: "Put the work, the price, the dates and what happens if something changes in a message or a short note. It keeps everyone clear and protects the friendship if there is a disagreement later.",
  },
  {
    q: "Keep the conversation where there is a record",
    a: "Messages on Church Member Marketplace are kept, so you can look back at what was agreed. Be wary of anyone who pushes you to move off the platform before you have met, or who asks for money upfront that you cannot explain.",
  },
  {
    q: "Know how to raise a concern",
    a: "If something does not feel right, say so and use the Report link on the listing or profile. Concerns about the safety of a child or vulnerable adult should also go to the police or your local authority safeguarding team straight away.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: steps.map((s) => ({
    "@type": "Question",
    name: s.q,
    acceptedAnswer: { "@type": "Answer", text: s.a },
  })),
};

export default function SafeHiringPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd data={faqJsonLd} />
      <h1 className="font-display text-[34px] font-bold tracking-[-0.02em] text-ink">
        How to hire someone from your church safely
      </h1>
      <p className="mt-3 text-[17px] leading-[1.6] text-muted">
        Hiring a fellow church member can feel easier than hiring a stranger, because you share a community. That is a real advantage, but it is not a reason to skip the usual care. Here is what we suggest.
      </p>

      <div className="mt-8 space-y-6">
        {steps.map((s, i) => (
          <section key={s.q} className="rounded-[20px] border border-line bg-paper p-6">
            <h2 className="font-display text-lg font-bold text-ink">
              {i + 1}. {s.q}
            </h2>
            <p className="mt-2 text-sm leading-[1.6] text-muted">{s.a}</p>
          </section>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-[24px] font-bold text-ink">What church verification tells you</h2>
        <p className="mt-3 text-[17px] leading-[1.6] text-muted">
          On Church Member Marketplace, an admin or a leader from the person&apos;s church confirms they are a member before they can browse, message or book. That means they are accountable to a real congregation. It does not mean their work or character has been checked. Verification is a starting point for your own judgement, never a guarantee.
        </p>
        <p className="mt-3 text-[17px] leading-[1.6] text-muted">
          Listings, profiles and messages stay private to verified members. Read more on the <Link href="/about" className="text-clay underline">about page</Link> or in the <Link href="/help" className="text-clay underline">help and FAQ</Link>, or <Link href="/signup" className="text-clay underline">join free</Link> and get verified through your church.
        </p>
      </section>
    </div>
  );
}
