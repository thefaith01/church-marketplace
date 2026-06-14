import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { DeleteListingButton } from "@/components/DeleteListingButton";
import { Container, PageHeader, Badge, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile || profile.role === "MEMBER") redirect("/dashboard");

  const listings = await prisma.listing.findMany({
    where: { providerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container>
      <PageHeader
        title="My service listings"
        subtitle="Active listings are visible only to verified church members."
        action={
          <a
            href="/my-listings/create"
            className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-paper no-underline hover:bg-clay-dark"
          >
            + Create listing
          </a>
        }
      />

      <div className="space-y-4">
        {listings.map((l) => (
          <div key={l.id} className="flex items-start justify-between rounded-[18px] border border-line bg-paper p-5 shadow-sm">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base font-bold text-ink">{l.title}</h3>
                <Badge tone={l.status === "ACTIVE" ? "verified" : "neutral"}>{l.status}</Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{l.description}</p>
              <div className="mt-2 flex gap-4 text-xs text-faint">
                <span>{l.category}</span>
                <span>{l.pricingType}</span>
              </div>
            </div>
            <div className="ml-4 flex gap-2">
              <a
                href={`/my-listings/${l.id}/edit`}
                className="rounded-full border-[1.5px] border-[#D8C9AE] px-3.5 py-1.5 text-xs font-semibold text-ink no-underline hover:bg-chip"
              >
                Edit
              </a>
              <DeleteListingButton listingId={l.id} />
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && (
        <EmptyState icon="📋" title="No listings yet." hint="Create your first one to start receiving bookings." />
      )}
    </Container>
  );
}
