import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { EditListingForm } from "@/components/EditListingForm";
import { redirect, notFound } from "next/navigation";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) notFound();
  if (listing.providerId !== user.id) redirect("/my-listings");

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <a href="/my-listings" className="text-sm font-semibold text-clay hover:underline">
        ← Back to my listings
      </a>
      <h1 className="mt-3 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">Edit listing</h1>
      <p className="mt-1 text-sm text-muted">Update your service details or change its status.</p>

      <div className="mt-6">
        <EditListingForm
          listing={{
            id: listing.id,
            title: listing.title,
            category: listing.category,
            description: listing.description,
            pricingType: listing.pricingType,
            indicativePrice: listing.indicativePrice,
            serviceArea: listing.serviceArea,
            availabilityNotes: listing.availabilityNotes,
            status: listing.status,
          }}
        />
      </div>
    </div>
  );
}
