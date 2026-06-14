import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { signVerificationDocUrl } from "@/lib/storage";
import { Container, PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function AdminProviderRequestsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const requests = await prisma.providerRequest.findMany({
    where: { status: "PENDING" },
    include: { profile: { include: { user: true, church: true } } },
    orderBy: { createdAt: "desc" },
  });

  const withDocs = await Promise.all(
    requests.map(async (r) => ({
      ...r,
      docUrl: r.documentPath ? await signVerificationDocUrl(r.documentPath) : null,
    }))
  );

  return (
    <Container>
      <PageHeader
        title="Provider requests"
        subtitle="Members asking to offer services. Confirm church standing before approving."
      />

      <div className="space-y-4">
        {withDocs.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-ink">{r.profile.fullName}</h3>
                <p className="text-sm text-faint">{r.profile.user.email}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                  <span>Church: {r.profile.church?.name || "Not linked"}</span>
                  {r.profile.church?.contactInfo && (
                    <span>Church contact: {r.profile.church.contactInfo}</span>
                  )}
                  <span>Verification: {r.profile.verificationStatus}</span>
                </div>
              </div>
              <Badge tone="pending">Pending</Badge>
            </div>

            {r.note && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-chip/60 p-3 text-sm text-ink">
                {r.note}
              </p>
            )}

            {r.docUrl && (
              <a
                href={r.docUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-clay no-underline"
              >
                View acknowledgement document →
              </a>
            )}

            <div className="mt-4 flex gap-2 border-t border-[#EFE7D6] pt-4">
              <form action={`/admin/provider-requests/${r.id}/approve`} method="POST">
                <button
                  type="submit"
                  className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper hover:opacity-90"
                >
                  Approve as provider
                </button>
              </form>
              <form action={`/admin/provider-requests/${r.id}/decline`} method="POST">
                <button
                  type="submit"
                  className="rounded-full border-[1.5px] border-[#E2C3B6] px-4 py-2 text-sm font-semibold text-clay-dark hover:bg-[#F3E1D9]"
                >
                  Decline
                </button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      {withDocs.length === 0 && (
        <EmptyState
          icon="🙋"
          title="No pending requests"
          hint="When a member asks to become a provider, it shows up here."
        />
      )}
    </Container>
  );
}
