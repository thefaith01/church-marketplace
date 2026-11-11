import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { Container, Card, ui } from "@/components/ui";
import ChurchOnboardingForm from "@/components/ChurchOnboardingForm";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Bring your church to the marketplace",
  description:
    "Church leaders can onboard a congregation with one invite link, confirm members as they join, and let their people hire one another with the accountability of a shared church.",
  path: "/for-churches",
});

const STEPS = [
  { t: "Sign up and name your church", d: "Tell us who you are and the church you lead. It takes a minute." },
  { t: "We confirm you", d: "An admin checks that you really lead the church. This keeps the whole network trustworthy." },
  { t: "Share your link", d: "Once approved, you get one invite link to send to your members by email, text, or your church group." },
  { t: "Confirm members as they join", d: "People sign up through your link already linked to your church. You confirm each one, in bulk if you like." },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How a church leader brings a congregation to Church Member Marketplace",
  description: "Sign up, get confirmed, share one invite link and confirm members as they join.",
  url: `${SITE_URL}/for-churches`,
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.t, text: s.d })),
};

export default function ForChurchesPage() {
  return (
    <Container size="wide">
      <JsonLd data={howToJsonLd} />
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14">
        <div>
          <p className="font-serif text-xl italic text-clay">For church leaders</p>
          <h1 className="mt-3 font-display text-[44px] font-bold leading-[1.02] tracking-[-0.025em] text-ink sm:text-[56px] lg:text-[64px]">
            Bring your whole church
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            You vouch for who is a real member. Invite everyone with a single link, and your people can hire
            one another with the accountability of a shared church.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a href="#onboard" className={ui.btnPrimary + " px-7 py-3.5 text-base"}>
              Onboard your church
            </a>
            <Link href="/how-verification-works" className="text-base font-semibold text-ink underline underline-offset-4">
              How verification works
            </Link>
          </div>

          <ol className="mt-12 max-w-xl space-y-7 border-l-2 border-line pl-7">
            {STEPS.map((s) => (
              <li key={s.t} className="relative">
                <span className="absolute -left-[37px] top-1.5 h-3 w-3 rounded-full bg-clay ring-4 ring-cream" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-ink">{s.t}</h2>
                <p className="mt-1 text-base leading-relaxed text-muted">{s.d}</p>
              </li>
            ))}
          </ol>

          <p className="mt-10 max-w-xl text-base leading-relaxed text-muted">
            Verification is a starting point for your own judgement, never a guarantee. You stay in charge of who
            is confirmed as a member of your church.
          </p>
        </div>

        <div id="onboard" className="scroll-mt-24 lg:sticky lg:top-24">
          <Card>
            <h2 className="font-display text-2xl font-bold text-ink">Onboard your church</h2>
            <p className="mt-2 text-base text-muted">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-clay no-underline">Log in</a> and an admin can
              make you a leader instead.
            </p>
            <div className="mt-5">
              <ChurchOnboardingForm />
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
