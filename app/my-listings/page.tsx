import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
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
    <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Service Listings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Active listings are visible only to verified church members.
          </p>
        </div>
        <a
          href="/my-listings/create"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          + Create Listing
        </a>
      </div>

      <div className="mt-6 space-y-4">
        {listings.map((l) => (
          <div
            key={l.id}
            className="rounded-xl border p-5 shadow-sm flex items-start justify-between"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{l.title}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium
                  ${
                    l.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {l.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {l.description}
              </p>
              <div className="mt-2 flex gap-4 text-xs text-gray-500">
                <span>{l.category}</span>
                <span>{l.pricingType}</span>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <a
                href={`/my-listings/${l.id}/edit`}
                className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-gray-50"
              >
                Edit
              </a>
              <button className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="mt-12 text-center text-gray-400">
          <p className="text-4xl">📋</p>
          <p className="mt-2">No listings yet. Create your first one.</p>
        </div>
      )}
    </div>
  );
}
