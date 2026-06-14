import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { Container, PageHeader, Badge, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function AdminListingsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const listings = await prisma.listing.findMany({
    include: { provider: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });

  const activeCount = listings.filter((l) => l.status === "ACTIVE").length;
  const inactiveCount = listings.filter((l) => l.status === "INACTIVE").length;

  return (
    <Container size="wide">
      <PageHeader title="Manage listings" subtitle="Review and manage service listings." />

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-[18px] border border-line bg-paper p-4 shadow-sm">
          <p className="text-sm text-faint">Active</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-forest">{activeCount}</p>
        </div>
        <div className="rounded-[18px] border border-line bg-paper p-4 shadow-sm">
          <p className="text-sm text-faint">Inactive</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-muted">{inactiveCount}</p>
        </div>
      </div>

      <div className="space-y-4">
        {listings.map((listing) => (
          <div key={listing.id} className="rounded-[18px] border border-line bg-paper p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-display font-bold text-ink">{listing.title}</h3>
                <p className="mt-1 text-sm text-muted">{listing.description}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-faint">
                  <span>By {listing.provider.profile?.fullName}</span>
                  <span>{listing.category}</span>
                  <span>{listing.pricingType}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={listing.status === "ACTIVE" ? "verified" : "neutral"}>{listing.status}</Badge>
                <form action={`/admin/listings/${listing.id}/toggle`} method="POST">
                  <button
                    type="submit"
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold text-paper ${
                      listing.status === "ACTIVE" ? "border-[1.5px] border-[#E2C3B6] !text-clay-dark hover:bg-[#F3E1D9]" : "bg-forest hover:opacity-90"
                    }`}
                  >
                    {listing.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && <EmptyState icon="📋" title="No listings found." />}
    </Container>
  );
}
