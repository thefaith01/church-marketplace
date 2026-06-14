import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Container, PageHeader, Card } from "@/components/ui";
import BecomeProviderForm from "@/components/BecomeProviderForm";

export default async function BecomeProviderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { church: true },
  });
  if (!profile) redirect("/signup");

  if (profile.role === "PROVIDER" || profile.role === "ADMIN") {
    return (
      <Container size="narrow">
        <PageHeader title="Become a provider" />
        <Card>
          <p className="text-muted">You&rsquo;re already set up to offer services.</p>
          <a href="/my-listings" className="mt-3 inline-block font-semibold text-clay no-underline">
            Go to my listings →
          </a>
        </Card>
      </Container>
    );
  }

  const pending = await prisma.providerRequest.findFirst({
    where: { profileId: profile.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container size="narrow">
      <PageHeader
        title="Become a provider"
        subtitle="Offer your services to others in the marketplace."
      />

      {pending ? (
        <Card>
          <p className="font-display font-bold text-ink">Request received</p>
          <p className="mt-1 text-sm text-muted">
            Your request is being reviewed. We may confirm your standing with your church first.
            You&rsquo;ll be notified once it&rsquo;s approved.
          </p>
        </Card>
      ) : (
        <Card>
          <p className="mb-5 text-sm text-muted">
            Becoming a provider needs acknowledgement from your church. You can attach a note from a
            leader, share a contact we can reach out to, or your church leader can confirm your
            membership directly.
          </p>
          <BecomeProviderForm churchName={profile.church?.name} />
        </Card>
      )}
    </Container>
  );
}
