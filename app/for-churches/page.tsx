import { Container, Card } from "@/components/ui";
import ChurchOnboardingForm from "@/components/ChurchOnboardingForm";

export const metadata = {
  title: "Bring your church | Church Member Marketplace",
  description: "Onboard your whole congregation and invite members with one link.",
};

const STEPS = [
  { n: "1", t: "Sign up and name your church", d: "Tell us who you are and the church you lead. It takes a minute." },
  { n: "2", t: "We confirm you", d: "An admin checks that you really lead the church. This keeps the whole network trustworthy." },
  { n: "3", t: "Share your link", d: "Once approved, you get one invite link to send to your members by email, text, or your church group." },
  { n: "4", t: "Confirm members as they join", d: "People sign up through your link already linked to your church. You confirm each one, in bulk if you like." },
];

export default function ForChurchesPage() {
  return (
    <Container size="wide">
      <div className="py-6 text-center">
        <p className="font-serif text-lg italic text-clay">For church leaders</p>
        <h1 className="mt-2 font-display text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
          Bring your whole church
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[17px] text-muted">
          Onboard your congregation in one go. You vouch for who&rsquo;s a real member, invite everyone
          with a single link, and your people can hire one another with the accountability of a shared church.
        </p>
      </div>

      <div className="mx-auto mt-6 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-[18px] border border-line bg-paper p-5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-clay font-display font-bold text-paper">
              {s.n}
            </span>
            <h3 className="mt-3 font-display font-bold text-ink">{s.t}</h3>
            <p className="mt-1 text-sm text-muted">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-xl">
        <Card>
          <h2 className="font-display text-[22px] font-bold text-ink">Onboard your church</h2>
          <p className="mt-1 text-sm text-muted">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-clay no-underline">Log in</a> and an admin can
            make you a leader instead.
          </p>
          <div className="mt-5">
            <ChurchOnboardingForm />
          </div>
        </Card>
      </div>
    </Container>
  );
}
