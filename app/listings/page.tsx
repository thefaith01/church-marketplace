import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canBrowseMarketplace } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { ListingCard } from "@/components/ListingCard";
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
  if (!profile || !canBrowseMarketplace(profile)) {
    return <VerificationGate title="Verification Required" />;
  }

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(searchParams.keyword
        ? {
            OR: [
              {
                title: {
                  contains: searchParams.keyword,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: searchParams.keyword,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
      ...(searchParams.category
        ? {
            category: {
              contains: searchParams.category,
              mode: "insensitive",
            },
          }
        : {}),
      ...(searchParams.pricingType
        ? { pricingType: searchParams.pricingType as any }
        : {}),
      ...(searchParams.serviceArea
        ? {
            serviceArea: {
              contains: searchParams.serviceArea,
              mode: "insensitive",
            },
          }
        : {}),
    },
    include: { provider: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-bold">Find Trusted Services</h1>
      <p className="text-gray-500 text-sm mt-1">
        Browse services offered by verified Christian providers
      </p>

      <form method="GET" className="mt-6 flex flex-wrap gap-3">
        <input
          name="keyword"
          defaultValue={searchParams.keyword}
          placeholder="Keyword"
          className="rounded-md border px-3 py-2 text-sm w-44"
        />
        <input
          name="category"
          defaultValue={searchParams.category}
          placeholder="Category"
          className="rounded-md border px-3 py-2 text-sm w-44"
        />
        <input
          name="serviceArea"
          defaultValue={searchParams.serviceArea}
          placeholder="Service area"
          className="rounded-md border px-3 py-2 text-sm w-44"
        />
        <select
          name="pricingType"
          defaultValue={searchParams.pricingType}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">Any pricing</option>
          <option value="HOURLY">Hourly</option>
          <option value="FIXED">Fixed</option>
          <option value="QUOTE">Quote</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Search
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-400">
        {listings.length} listing{listings.length !== 1 ? "s" : ""} found
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>

      {listings.length === 0 && (
        <div className="mt-20 text-center text-gray-400">
          <p className="text-4xl">🔍</p>
          <p className="mt-2">No listings match your search.</p>
        </div>
      )}
    </div>
  );
}
