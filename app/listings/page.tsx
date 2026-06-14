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
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container size="wide">
      <PageHeader
        eyebrow="Whatever you need doing"
        title="Find trusted services"
        subtitle="Offered by verified members of your church network."
      />

      <form method="GET" className="flex flex-wrap gap-3">
        <input name="keyword" defaultValue={searchParams.keyword} placeholder="Keyword" className={`${ui.input} mt-0 w-44`} />
        <input name="category" defaultValue={searchParams.category} placeholder="Category" className={`${ui.input} mt-0 w-44`} />
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
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>

      {listings.length === 0 && (
        <EmptyState icon="🔍" title="No listings match your search." hint="Try clearing a filter or widening your area." />
      )}
    </Container>
  );
}
