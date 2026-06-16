import { prisma } from "@/lib/prisma";
import { Container, Card } from "@/components/ui";
import { notFound } from "next/navigation";

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  let church = await prisma.church.findFirst({ where: { joinCode: code, status: "ACTIVE" } });
  if (!church) {
    const invite = await prisma.churchInvite.findUnique({
      where: { token: code },
      include: { church: true },
    });
    if (invite && !invite.usedAt && (!invite.expiresAt || invite.expiresAt > new Date())) {
      church = invite.church;
    }
  }
  if (!church) notFound();

  const signupHref = `/signup?church=${church.id}&code=${encodeURIComponent(code)}`;

  return (
    <Container size="narrow">
      <div className="py-10">
        <Card>
          <p className="font-serif text-lg italic text-clay">You&rsquo;re invited</p>
          <h1 className="mt-1 font-display text-[28px] font-bold tracking-[-0.02em] text-ink">
            Join {church.name}
          </h1>
          {church.city && <p className="mt-1 text-muted">{church.city}</p>}
          {church.description && <p className="mt-3 text-[15px] text-muted">{church.description}</p>}
          <p className="mt-4 text-sm text-muted">
            Create your account to join {church.name} on the Church Member Marketplace. A church
            leader will confirm your membership before the marketplace unlocks.
          </p>
          <a
            href={signupHref}
            className="mt-5 inline-block rounded-full bg-clay px-6 py-3 font-semibold text-paper no-underline hover:bg-clay-dark"
          >
            Create your account →
          </a>
          <p className="mt-3 text-sm text-faint">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-clay no-underline">Log in</a>
          </p>
        </Card>
      </div>
    </Container>
  );
}
