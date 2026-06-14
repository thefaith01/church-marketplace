import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { Container, PageHeader, Badge, EmptyState } from "@/components/ui";
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

  const count = (s: string) => bookings.filter((b) => b.status === s).length;
  const stats = [
    ["Pending", count("PENDING")],
    ["Accepted", count("ACCEPTED")],
    ["Declined", count("DECLINED")],
  ] as const;

  return (
    <Container size="wide">
      <PageHeader title="Manage bookings" subtitle="Track and monitor booking requests." />

      <div className="mb-6 grid grid-cols-3 gap-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-[18px] border border-line bg-paper p-4 shadow-sm">
            <p className="text-sm text-faint">{label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="rounded-[18px] border border-line bg-paper p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-display font-bold text-ink">{booking.listing.title}</h3>
                <p className="mt-1 text-sm text-muted">{booking.jobDescription}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-faint">
                  <span>From {booking.requester.profile?.fullName}</span>
                  <span>To {booking.provider.profile?.fullName}</span>
                  <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Badge tone={booking.status === "PENDING" ? "pending" : booking.status === "ACCEPTED" ? "verified" : "danger"}>
                {booking.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {bookings.length === 0 && <EmptyState icon="📅" title="No bookings found." />}
    </Container>
  );
}
