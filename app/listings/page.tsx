import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canBrowseMarketplace, isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { ListingCard } from "@/components/ListingCard";
import { Container, PageHeader, ui, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: {
    keyword?: string;
    category?: string;
    pricingType?: string;
    serviceArea?: string;
  };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile || (!canBrowseMarketplace(profile) && !isAdmin(user))) {
    return <VerificationGate title="Verification Required" />;
  }

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(searchParams.keyword
        ? {
            OR: [
              { title: { contains: searchParams.keyword, mode: "insensitive" } },
              { description: { contains: searchParams.keyword, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(searchParams.category
        ? { category: { contains: searchParams.category, mode: "insensitive" } }
        : {}),
      ...(searchParams.pricingType ? { pricingType: searchParams.pricingType as any } : {}),
      ...(searchParams.serviceArea
        ? { serviceArea: { contains: searchParams.serviceArea, mode: "insensitive" } }
        : {}),
    },
    include: { provider: { include: { profile: true } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { listingId: true },
  });
  const favSet = new Set(favs.map((f) => f.listingId));

  // Recommendations: providers booked by members of the viewer's church.
  let recommended: any[] = [];
  if (profile.churchId) {
    const churchBookings = await prisma.bookingRequest.findMany({
      where: {
        status: { in: ["ACCEPTED", "COMPLETED"] },
        requester: { profile: { churchId: profile.churchId } },
      },
      select: { providerId: true },
      distinct: ["providerId"],
      take: 30,
    });
    const providerIds = churchBookings
      .map((b) => b.providerId)
      .filter((id) => id !== user.id);
    if (providerIds.length) {
      recommended = await prisma.listing.findMany({
        where: { status: "ACTIVE", providerId: { in: providerIds } },
        include: { provider: { include: { profile: true } } },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 3,
      });
    }
  }

  return (
    <Container size="wide">
      <PageHeader
        eyebrow="Whatever you need doing"
        title="Find services"
        subtitle="Offered by verified members of your church network."
      />

      {recommended.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-bold text-ink">Hired by your church</h2>
          <p className="mt-0.5 text-sm text-muted">Providers members of your church have booked.</p>
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
            {recommended.map((l) => (
              <ListingCard key={`rec-${l.id}`} listing={l} saved={favSet.has(l.id)} />
            ))}
          </div>
        </div>
      )}

      <form method="GET" className="flex flex-wrap gap-3">
        <input name="keyword" defaultValue={searchParams.keyword} placeholder="Keyword" className={`${ui.input} mt-0 w-44`} />
        {categories.length > 0 ? (
          <select name="category" defaultValue={searchParams.category} className={`${ui.input} mt-0 w-44`}>
            <option value="">Any category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <input name="category" defaultValue={searchParams.category} placeholder="Category" className={`${ui.input} mt-0 w-44`} />
        )}
        <input name="serviceArea" defaultValue={searchParams.serviceArea} placeholder="Service area" className={`${ui.input} mt-0 w-44`} />
        <select name="pricingType" defaultValue={searchParams.pricingType} className={`${ui.input} mt-0 w-auto`}>
          <option value="">Any pricing</option>
          <option value="HOURLY">Hourly</option>
          <option value="FIXED">Fixed</option>
          <option value="QUOTE">Quote</option>
        </select>
        <button type="submit" className={ui.btnPrimary}>Search</button>
      </form>

      <p className="mt-6 text-sm text-faint">
        <strong className="text-ink">{listings.length}</strong> listing{listings.length !== 1 ? "s" : ""} found
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} saved={favSet.has(l.id)} />
        ))}
      </div>

      {listings.length === 0 && (
        <EmptyState icon="🔍" title="No listings match your search." hint="Try clearing a filter or widening your area." />
      )}
    </Container>
  );
}
