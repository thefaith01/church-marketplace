import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canBrowseMarketplace, isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { ListingCard } from "@/components/ListingCard";
import { Badge, EmptyState } from "@/components/ui";
import { redirect, notFound } from "next/navigation";

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const viewer = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!viewer || (!canBrowseMarketplace(viewer) && !isAdmin(user))) {
    return <VerificationGate title="Verification Required" />;
  }

  const { id } = await params;
  const provider = await prisma.user.findUnique({
    where: { id },
    include: { profile: { include: { church: true } } },
  });
  if (!provider || !provider.profile) notFound();

  const listings = await prisma.listing.findMany({
    where: { providerId: id, status: "ACTIVE" },
    include: { provider: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });

  const p = provider.profile;
  const initials = p.fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <a href="/listings" className="text-sm font-semibold text-clay hover:underline">
        ← Back to services
      </a>

      <div className="mt-4 rounded-[22px] border border-line bg-paper p-7 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-clay font-display text-xl font-bold text-white">
            {initials}
          </span>
          <div>
            <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] text-ink">{p.fullName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Badge tone={p.verificationStatus === "VERIFIED" ? "verified" : "neutral"}>
                {p.verificationStatus === "VERIFIED" ? "Verified" : p.verificationStatus}
              </Badge>
              {p.church?.name && <span>{p.church.name}</span>}
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-8 font-display text-xl font-bold text-ink">Active listings</h2>
      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
      {listings.length === 0 && (
        <EmptyState icon="📋" title="No active listings" hint="This provider has nothing live right now." />
      )}
    </div>
  );
}
