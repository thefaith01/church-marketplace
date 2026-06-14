import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { Container, PageHeader, Badge, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function ManagePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (isAdmin(user)) {
    const [pendingUsers, verifiedUsers, allListings, pendingBookings] = await Promise.all([
      prisma.userProfile.count({ where: { verificationStatus: { not: "VERIFIED" } } }),
      prisma.userProfile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.listing.count(),
      prisma.bookingRequest.count({ where: { status: "PENDING" } }),
    ]);

    const stats = [
      ["Awaiting verification", pendingUsers],
      ["Verified users", verifiedUsers],
      ["Total listings", allListings],
      ["Pending bookings", pendingBookings],
    ] as const;

    const links = [
      { href: "/admin/users", title: "Manage users", desc: "Verify or reject user registrations" },
      { href: "/admin/churches", title: "Manage churches", desc: "Create and manage linkable churches" },
      { href: "/admin/categories", title: "Manage categories", desc: "Service categories members can pick from" },
      { href: "/admin/listings", title: "Manage listings", desc: "Review and manage service listings" },
      { href: "/admin/bookings", title: "Manage bookings", desc: "Track and manage booking requests" },
      { href: "/admin/reports", title: "Reports", desc: "Review flagged listings and members" },
      { href: "/admin/provider-requests", title: "Provider requests", desc: "Members asking to become providers" },
      { href: "/admin/audit", title: "Audit log", desc: "Recent admin and leader actions" },
    ];

    return (
      <Container>
        <PageHeader eyebrow="Stewardship" title="Admin dashboard" subtitle="Manage users, listings, and bookings." />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-[18px] border border-line bg-paper p-4 shadow-sm">
              <p className="text-sm text-faint">{label}</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-ink">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="block rounded-[18px] border border-line bg-paper p-5 no-underline transition hover:shadow-md">
              <h3 className="font-display font-bold text-ink">{l.title}</h3>
              <p className="mt-1 text-sm text-muted">{l.desc}</p>
            </a>
          ))}
        </div>
      </Container>
    );
  }

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/signup");

  const myBookings = await prisma.bookingRequest.findMany({
    where: { OR: [{ requesterId: user.id }, { providerId: user.id }] },
    include: {
      listing: true,
      requester: { include: { profile: true } },
      provider: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container>
      <PageHeader title="My booking requests" subtitle="View and manage your booking requests." />

      <div className="space-y-4">
        {myBookings.map((booking) => (
          <div key={booking.id} className="rounded-[18px] border border-line bg-paper p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-ink">{booking.listing.title}</h3>
                <p className="mt-1 text-sm text-muted">{booking.jobDescription}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-faint">
                  {booking.requesterId === user.id ? (
                    <span>Requested to: {booking.provider.profile?.fullName}</span>
                  ) : (
                    <span>From: {booking.requester.profile?.fullName}</span>
                  )}
                  <span>Status: {booking.status}</span>
                </div>
              </div>
              <Badge
                tone={
                  booking.status === "PENDING"
                    ? "pending"
                    : booking.status === "ACCEPTED"
                      ? "info"
                      : booking.status === "COMPLETED"
                        ? "verified"
                        : booking.status === "CANCELLED"
                          ? "neutral"
                          : "danger"
                }
              >
                {booking.status}
              </Badge>
            </div>

            {booking.status === "PENDING" || booking.status === "ACCEPTED" || booking.conversationId ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#EFE7D6] pt-3">
                {booking.providerId === user.id && booking.status === "PENDING" && (
                  <>
                    <form action={`/api/bookings/${booking.id}/accept`} method="POST">
                      <button type="submit" className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-paper hover:opacity-90">
                        Accept
                      </button>
                    </form>
                    <form action={`/api/bookings/${booking.id}/decline`} method="POST">
                      <button type="submit" className="rounded-full border-[1.5px] border-[#E2C3B6] px-3.5 py-1.5 text-xs font-semibold text-clay-dark hover:bg-[#F3E1D9]">
                        Decline
                      </button>
                    </form>
                  </>
                )}
                {booking.status === "ACCEPTED" && (
                  <form action={`/api/bookings/${booking.id}/complete`} method="POST">
                    <button type="submit" className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-paper hover:opacity-90">
                      Mark as done
                    </button>
                  </form>
                )}
                {(booking.status === "ACCEPTED" ||
                  (booking.status === "PENDING" && booking.requesterId === user.id)) && (
                  <form action={`/api/bookings/${booking.id}/cancel`} method="POST">
                    <button type="submit" className="rounded-full border-[1.5px] border-[#D8C9AE] px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-chip">
                      Cancel
                    </button>
                  </form>
                )}
                {booking.conversationId && (
                  <a href={`/messages/${booking.conversationId}`} className="rounded-full border-[1.5px] border-[#D8C9AE] px-3.5 py-1.5 text-xs font-semibold text-ink no-underline hover:bg-chip">
                    Open conversation
                  </a>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {myBookings.length === 0 && (
        <EmptyState icon="📅" title="No booking requests yet." hint="Browse services and send your first request." />
      )}
    </Container>
  );
}
