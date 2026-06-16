import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Container, PageHeader } from "@/components/ui";

export default async function LeaderAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const me = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { church: true },
  });
  if (!me?.isChurchLeader || !me.churchId) redirect("/dashboard");

  const churchId = me.churchId;

  const [members, verified, pending, providers, listings, bookings, invites, roster] =
    await Promise.all([
      prisma.userProfile.count({ where: { churchId } }),
      prisma.userProfile.count({ where: { churchId, verificationStatus: "VERIFIED" } }),
      prisma.userProfile.count({ where: { churchId, verificationStatus: { not: "VERIFIED" } } }),
      prisma.userProfile.count({ where: { churchId, role: "PROVIDER" } }),
      prisma.listing.count({ where: { provider: { profile: { churchId } } } }),
      prisma.bookingRequest.count({ where: { requester: { profile: { churchId } } } }),
      prisma.churchInvite.count({ where: { churchId } }),
      prisma.churchRosterEntry.count({ where: { churchId } }),
    ]);

  const stats: [string, number, string][] = [
    ["Members linked", members, "People who selected or were linked to your church."],
    ["Verified", verified, "Confirmed members with full marketplace access."],
    ["Awaiting confirmation", pending, "People you still need to confirm."],
    ["Providers", providers, "Members offering services."],
    ["Listings", listings, "Active and inactive service listings from your members."],
    ["Bookings made", bookings, "Booking requests your members have sent."],
    ["Invites sent", invites, "Email invites to join your church."],
    ["On roster", roster, "Pre-approved emails awaiting signup."],
  ];

  return (
    <Container>
      <PageHeader
        eyebrow="Church leader"
        title={`${me.church?.name || "Your church"} at a glance`}
        subtitle="A snapshot of your congregation on the marketplace."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([label, value, desc]) => (
          <div key={label} className="rounded-[18px] border border-line bg-paper p-4 shadow-sm">
            <p className="font-display text-3xl font-extrabold text-ink">{value}</p>
            <p className="mt-1 text-sm font-semibold text-ink">{label}</p>
            <p className="mt-0.5 text-xs text-faint">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <a href="/leader" className="text-sm font-semibold text-clay no-underline">← Back to members</a>
      </div>
    </Container>
  );
}
