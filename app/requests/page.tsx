import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canBrowseMarketplace, isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { Container, PageHeader, Badge, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function RequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile || (!canBrowseMarketplace(profile) && !isAdmin(user))) {
    return <VerificationGate title="Verification Required" />;
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { status: "OPEN" },
    include: { requester: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container size="wide">
      <PageHeader
        eyebrow="Reverse marketplace"
        title="Service requests"
        subtitle="Members post what they need. Providers respond with a message."
        action={
          <a href="/requests/new" className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-paper no-underline hover:bg-clay-dark">
            + Post a request
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {requests.map((r) => (
          <a key={r.id} href={`/requests/${r.id}`} className="block rounded-[18px] border border-line bg-paper p-5 no-underline shadow-sm transition hover:shadow-md">
            {r.category && <Badge>{r.category}</Badge>}
            <h3 className="mt-2 font-display text-[17px] font-bold text-ink">{r.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted">{r.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-faint">
              <span>{r.serviceArea || "Any area"}</span>
              <span>{r.budget || ""}</span>
            </div>
            <p className="mt-2 text-sm text-[#5A4F40]">
              {r.requester.profile?.fullName || r.requester.email}
            </p>
          </a>
        ))}
      </div>

      {requests.length === 0 && (
        <EmptyState icon="📣" title="No open requests" hint="Be the first to post what you need." />
      )}
    </Container>
  );
}
