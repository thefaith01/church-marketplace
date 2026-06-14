import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canBrowseMarketplace, isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { ListingActions } from "@/components/ListingActions";
import { Badge } from "@/components/ui";
import { redirect, notFound } from "next/navigation";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile || (!canBrowseMarketplace(profile) && !isAdmin(user))) {
    return <VerificationGate title="Verification Required" />;
  }

  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { provider: { include: { profile: true } } },
  });
  if (!listing) notFound();

  const isOwner = listing.providerId === user.id;
  const admin = isAdmin(user);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <a href="/listings" className="text-sm font-semibold text-clay hover:underline">
        ← Back to services
      </a>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[22px] border border-line bg-paper p-7 shadow-sm md:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{listing.category}</Badge>
            {listing.status !== "ACTIVE" && <Badge tone="neutral">{listing.status}</Badge>}
          </div>
          <h1 className="mt-3 font-display text-[30px] font-bold tracking-[-0.02em] text-ink">{listing.title}</h1>
          <p className="mt-3 whitespace-pre-line text-sm leading-[1.6] text-[#3C3528]">{listing.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[#EFE7D6] pt-5 text-sm">
            <div>
              <dt className="text-faint">Pricing</dt>
              <dd className="font-semibold text-ink">
                {listing.pricingType}
                {listing.indicativePrice ? ` · ${listing.indicativePrice}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-faint">Service area</dt>
              <dd className="font-semibold text-ink">{listing.serviceArea || "Not specified"}</dd>
            </div>
            <div>
              <dt className="text-faint">Availability</dt>
              <dd className="font-semibold text-ink">{listing.availabilityNotes || "Not specified"}</dd>
            </div>
            <div>
              <dt className="text-faint">Provider</dt>
              <dd className="font-semibold text-ink">
                <a href={`/providers/${listing.providerId}`} className="text-clay hover:underline">
                  {listing.provider.profile?.fullName || listing.provider.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="md:col-span-1">
          {isOwner ? (
            <div className="rounded-[20px] border border-[#CBD7C2] bg-sage p-5 text-sm text-forest">
              This is your listing.{" "}
              <a href="/my-listings" className="font-semibold underline">Manage it here</a>.
            </div>
          ) : admin ? (
            <div className="rounded-[20px] border border-line bg-paper p-5 text-sm text-muted">
              Admins can view listings but do not place bookings.
            </div>
          ) : (
            <ListingActions listingId={listing.id} providerId={listing.providerId} />
          )}
        </div>
      </div>
    </div>
  );
}
