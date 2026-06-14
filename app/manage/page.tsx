import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ManagePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdminUser = isAdmin(user);

  if (isAdminUser) {
    const [pendingUsers, verifiedUsers, allListings, pendingBookings] =
      await Promise.all([
        prisma.userProfile.count({
          where: { verificationStatus: { not: "VERIFIED" } },
        }),
        prisma.userProfile.count({
          where: { verificationStatus: "VERIFIED" },
        }),
        prisma.listing.count(),
        prisma.bookingRequest.count({ where: { status: "PENDING" } }),
      ]);

    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage users, listings, and bookings</p>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-gray-500 text-sm">Awaiting Verification</p>
            <p className="mt-2 text-3xl font-bold">{pendingUsers}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-gray-500 text-sm">Verified Users</p>
            <p className="mt-2 text-3xl font-bold">{verifiedUsers}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-gray-500 text-sm">Total Listings</p>
            <p className="mt-2 text-3xl font-bold">{allListings}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-gray-500 text-sm">Pending Bookings</p>
            <p className="mt-2 text-3xl font-bold">{pendingBookings}</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <a
            href="/admin/users"
            className="block rounded-lg border p-4 hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold">Manage Users</h3>
            <p className="mt-1 text-sm text-gray-600">
              Verify or reject user registrations
            </p>
          </a>
          <a
            href="/admin/listings"
            className="block rounded-lg border p-4 hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold">Manage Listings</h3>
            <p className="mt-1 text-sm text-gray-600">
              Review and manage service listings
            </p>
          </a>
          <a
            href="/admin/bookings"
            className="block rounded-lg border p-4 hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold">Manage Bookings</h3>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage booking requests
            </p>
          </a>
        </div>
      </div>
    );
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) redirect("/signup");

  const myBookings = await prisma.bookingRequest.findMany({
    where: {
      OR: [{ requesterId: user.id }, { providerId: user.id }],
    },
    include: {
      listing: true,
      requester: { include: { profile: true } },
      provider: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">My Booking Requests</h1>
      <p className="text-gray-500 text-sm mt-1">
        View and manage your booking requests
      </p>

      <div className="mt-6 space-y-4">
        {myBookings.map((booking) => (
          <div key={booking.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{booking.listing.title}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {booking.jobDescription}
                </p>
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  {booking.requesterId === user.id ? (
                    <>
                      <span>Requested to: {booking.provider.profile?.fullName}</span>
                    </>
                  ) : (
                    <>
                      <span>From: {booking.requester.profile?.fullName}</span>
                    </>
                  )}
                  <span>Status: {booking.status}</span>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium
                ${
                  booking.status === "PENDING"
                    ? "bg-amber-100 text-amber-700"
                    : booking.status === "ACCEPTED"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {booking.status}
              </span>
            </div>

            {(booking.providerId === user.id &&
              booking.status === "PENDING") ||
            booking.conversationId ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
                {booking.providerId === user.id &&
                  booking.status === "PENDING" && (
                    <>
                      <form
                        action={`/api/bookings/${booking.id}/accept`}
                        method="POST"
                      >
                        <button
                          type="submit"
                          className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Accept
                        </button>
                      </form>
                      <form
                        action={`/api/bookings/${booking.id}/decline`}
                        method="POST"
                      >
                        <button
                          type="submit"
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Decline
                        </button>
                      </form>
                    </>
                  )}
                {booking.conversationId && (
                  <a
                    href={`/messages/${booking.conversationId}`}
                    className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-gray-50"
                  >
                    Open conversation
                  </a>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {myBookings.length === 0 && (
        <div className="mt-12 text-center text-gray-400">
          <p className="text-4xl">📅</p>
          <p className="mt-2">No booking requests yet.</p>
        </div>
      )}
    </div>
  );
}
