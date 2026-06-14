import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminBookingsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const bookings = await prisma.bookingRequest.findMany({
    include: {
      listing: true,
      requester: { include: { profile: true } },
      provider: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const acceptedCount = bookings.filter((b) => b.status === "ACCEPTED").length;
  const declinedCount = bookings.filter((b) => b.status === "DECLINED").length;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track and monitor booking requests
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-gray-500 text-sm">Accepted</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{acceptedCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-gray-500 text-sm">Declined</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{declinedCount}</p>
        </div>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="rounded-lg border p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold">{booking.listing.title}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {booking.jobDescription}
                </p>
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>From {booking.requester.profile?.fullName}</span>
                  <span className="text-gray-300">·</span>
                  <span>To {booking.provider.profile?.fullName}</span>
                  <span className="text-gray-300">·</span>
                  <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap
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
          </div>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="mt-12 text-center text-gray-400">
          <p className="text-4xl">📅</p>
          <p className="mt-2">No bookings found.</p>
        </div>
      )}
    </div>
  );
}
