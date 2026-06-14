import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canBrowseMarketplace, isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { ListingActions } from "@/components/ListingActions";
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
    <div className="mx-auto max-w-4xl p-6">
      <a href="/listings" className="text-sm text-blue-700 hover:underline">
        ← Back to services
      </a>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border bg-white p-6 shadow-sm">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700">
            {listing.category}
          </span>
          {listing.status !== "ACTIVE" && (
            <span className="ml-2 inline-block rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-500">
              {listing.status}
            </span>
          )}
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            {listing.title}
          </h1>
          <p className="mt-3 whitespace-pre-line text-sm text-gray-700">
            {listing.description}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t pt-5 text-sm">
            <div>
              <dt className="text-gray-400">Pricing</dt>
              <dd className="font-medium text-gray-800">
                {listing.pricingType}
                {listing.indicativePrice
                  ? ` · ${listing.indicativePrice}`
                  : ""}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Service area</dt>
              <dd className="font-medium text-gray-800">
                {listing.serviceArea || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Availability</dt>
              <dd className="font-medium text-gray-800">
                {listing.availabilityNotes || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Provider</dt>
              <dd className="font-medium text-gray-800">
                {listing.provider.profile?.fullName ||
                  listing.provider.email}
              </dd>
            </div>
          </dl>
        </div>

        <div className="md:col-span-1">
          {isOwner ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
              This is your listing.{" "}
              <a
                href="/my-listings"
                className="font-medium underline"
              >
                Manage it here
              </a>
              .
            </div>
          ) : admin ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
              Admins can view listings but do not place bookings.
            </div>
          ) : (
            <ListingActions
              listingId={listing.id}
              providerId={listing.providerId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
