import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { Container, PageHeader, Card, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function AdminChurchRequestsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const requests = await prisma.churchLeaderRequest.findMany({
    where: { status: "PENDING" },
    include: { user: { include: { profile: true } }, church: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container>
      <PageHeader
        title="Church onboarding requests"
        subtitle="Confirm a leader really leads their church before their tools unlock."
      />

      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r.id}>
            <h3 className="font-display font-bold text-ink">
              {r.church.name}
              {r.church.city ? ` · ${r.church.city}` : ""}
            </h3>
            <p className="mt-0.5 text-sm text-faint">
              {r.user.profile?.fullName || r.user.email} · {r.user.email}
              {r.title ? ` · ${r.title}` : ""}
            </p>
            {r.note && (
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-chip/60 p-3 text-sm text-ink">{r.note}</p>
            )}
            <div className="mt-3 flex gap-2 border-t border-[#EFE7D6] pt-3">
              <form action={`/admin/church-requests/${r.id}/approve`} method="POST">
                <button type="submit" className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper hover:opacity-90">
                  Approve &amp; activate
                </button>
              </form>
              <form action={`/admin/church-requests/${r.id}/decline`} method="POST">
                <button type="submit" className="rounded-full border-[1.5px] border-[#E2C3B6] px-4 py-2 text-sm font-semibold text-clay-dark hover:bg-[#F3E1D9]">
                  Decline
                </button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <EmptyState icon="⛪" title="No onboarding requests" hint="Church leaders who sign up via 'For churches' appear here." />
      )}
    </Container>
  );
}
