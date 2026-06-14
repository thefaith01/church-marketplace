import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { isVerified } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { church: true },
  });
  if (!profile) redirect("/signup");

  const verified = isVerified(profile);

  const [activeListings, inactiveListings, conversations, pendingBookings] =
    await Promise.all([
      profile.role === "PROVIDER"
        ? prisma.listing.count({
            where: { providerId: user.id, status: "ACTIVE" },
          })
        : 0,
      profile.role === "PROVIDER"
        ? prisma.listing.count({
            where: { providerId: user.id, status: "INACTIVE" },
          })
        : 0,
      prisma.conversation.count({
        where: {
          OR: [
            { participantOneId: user.id },
            { participantTwoId: user.id },
          ],
        },
      }),
      prisma.bookingRequest.count({
        where: {
          OR: [{ requesterId: user.id }, { providerId: user.id }],
          status: "PENDING",
        },
      }),
    ]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
      <p className="text-gray-500 text-sm mt-1">
        Your central hub for managing your church marketplace experience
      </p>

      {!verified && (
        <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-900">Verification Pending</p>
            <p className="text-sm text-amber-800 mt-0.5">
              Your account is awaiting church verification. Some features are
              restricted until verified.
            </p>
          </div>
          <span className="text-2xl">⏳</span>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800">Your Profile</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Full Name", profile.fullName],
              ["Email", user.email],
              ["Role", profile.role],
              ["Linked Church", profile.church?.name ?? "Not linked yet"],
              ["Verification", profile.verificationStatus],
              ["Subscription", profile.subscriptionStatus],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-400">{label}</dt>
                <dd className="font-medium text-gray-800 capitalize">
                  {String(value).toLowerCase()}
                </dd>
              </div>
            ))}
          </dl>
          <a
            href="/dashboard/edit-church"
            className="mt-4 block rounded-md border px-3 py-1.5 text-center text-sm text-gray-600 hover:bg-gray-50"
          >
            Edit Church Info
          </a>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-4">
          {[
            {
              href: "/listings",
              title: "Browse Services",
              desc: "Find trusted providers in your church community.",
              badge: null,
              locked: !verified,
            },
            {
              href: "/messages",
              title: "Messages",
              desc: "Connect with providers and manage conversations.",
              badge: conversations > 0 ? `${conversations} Active` : null,
              locked: !verified,
            },
            ...(profile.role === "PROVIDER"
              ? [
                  {
                    href: "/my-listings",
                    title: "My Listings",
                    desc: "Manage your service offerings.",
                    badge: `${activeListings} Active · ${inactiveListings} Inactive`,
                    locked: false,
                  },
                ]
              : []),
            {
              href: "/manage",
              title: "Booking Requests",
              desc: "View and respond to booking requests.",
              badge: pendingBookings > 0 ? `${pendingBookings} pending` : null,
              locked: !verified,
            },
          ].map((tile: any) => (
            <a
              key={tile.title}
              href={tile.locked ? "#" : tile.href}
              className={`rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
                tile.locked ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-800">{tile.title}</h3>
                {tile.locked && <span className="text-xs text-gray-400">🔒</span>}
              </div>
              {tile.badge && (
                <p className="mt-1 text-sm font-medium text-blue-700">
                  {tile.badge}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">{tile.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
