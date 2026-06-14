import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canBrowseMarketplace, isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { RequestRespond } from "@/components/RequestRespond";
import { Badge } from "@/components/ui";
import { redirect, notFound } from "next/navigation";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile || (!canBrowseMarketplace(profile) && !isAdmin(user))) {
    return <VerificationGate title="Verification Required" />;
  }

  const { id } = await params;
  const r = await prisma.serviceRequest.findUnique({
    where: { id },
    include: { requester: { include: { profile: true } } },
  });
  if (!r) notFound();

  const isOwner = r.requesterId === user.id;
  const admin = isAdmin(user);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <a href="/requests" className="text-sm font-semibold text-clay hover:underline">
        ← Back to requests
      </a>

      <div className="mt-4 rounded-[22px] border border-line bg-paper p-7 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {r.category && <Badge>{r.category}</Badge>}
          <Badge tone={r.status === "OPEN" ? "info" : "neutral"}>{r.status}</Badge>
        </div>
        <h1 className="mt-3 font-display text-[28px] font-bold tracking-[-0.02em] text-ink">{r.title}</h1>
        <p className="mt-3 whitespace-pre-line text-sm leading-[1.6] text-[#3C3528]">{r.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[#EFE7D6] pt-5 text-sm">
          <div>
            <dt className="text-faint">Area</dt>
            <dd className="font-semibold text-ink">{r.serviceArea || "Any"}</dd>
          </div>
          <div>
            <dt className="text-faint">Budget</dt>
            <dd className="font-semibold text-ink">{r.budget || "Not specified"}</dd>
          </div>
          <div>
            <dt className="text-faint">Posted by</dt>
            <dd className="font-semibold text-ink">
              <a href={`/providers/${r.requesterId}`} className="text-clay hover:underline">
                {r.requester.profile?.fullName || r.requester.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-faint">Posted</dt>
            <dd className="font-semibold text-ink">{new Date(r.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>

        <div className="mt-6">
          {isOwner || admin ? (
            r.status === "OPEN" ? (
              <form action={`/api/service-requests/${r.id}/close`} method="POST">
                <button type="submit" className="rounded-full border-[1.5px] border-[#D8C9AE] px-5 py-2 text-sm font-semibold text-ink hover:bg-chip">
                  Close request
                </button>
              </form>
            ) : (
              <p className="text-sm text-muted">This request is closed.</p>
            )
          ) : r.status === "OPEN" ? (
            <RequestRespond requesterId={r.requesterId} />
          ) : (
            <p className="text-sm text-muted">This request is closed.</p>
          )}
        </div>
      </div>
    </div>
  );
}
