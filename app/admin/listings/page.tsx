import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
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
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Listings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and manage service listings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-gray-500 text-sm">Inactive</p>
          <p className="mt-2 text-3xl font-bold text-gray-600">{inactiveCount}</p>
        </div>
      </div>

      <div className="space-y-4">
        {listings.map((listing) => (
          <div key={listing.id} className="rounded-lg border p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{listing.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{listing.description}</p>
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>By {listing.provider.profile?.fullName}</span>
                  <span className="text-gray-300">·</span>
                  <span>{listing.category}</span>
                  <span className="text-gray-300">·</span>
                  <span>{listing.pricingType}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium
                  ${
                    listing.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {listing.status}
                </span>
                <form
                  action={`/admin/listings/${listing.id}/toggle`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className={`rounded-md px-3 py-1 text-xs font-medium text-white
                    ${
                      listing.status === "ACTIVE"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
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

      {listings.length === 0 && (
        <div className="mt-12 text-center text-gray-400">
          <p className="text-4xl">📋</p>
          <p className="mt-2">No listings found.</p>
        </div>
      )}
    </div>
  );
}
