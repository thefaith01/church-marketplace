import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { isVerified, isAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { church: true },
  });
  if (!profile) redirect("/signup");

  const verified = isVerified(profile) || isAdmin(user);

  const [activeListings, inactiveListings, conversations, pendingBookings] =
    await Promise.all([
      profile.role === "PROVIDER"
        ? prisma.listing.count({ where: { providerId: user.id, status: "ACTIVE" } })
        : 0,
      profile.role === "PROVIDER"
        ? prisma.listing.count({ where: { providerId: user.id, status: "INACTIVE" } })
        : 0,
      prisma.conversation.count({
        where: { OR: [{ participantOneId: user.id }, { participantTwoId: user.id }] },
      }),
      prisma.bookingRequest.count({
        where: { OR: [{ requesterId: user.id }, { providerId: user.id }], status: "PENDING" },
      }),
    ]);

  const tiles: any[] = [
    { href: "/listings", title: "Browse services", desc: "Find trusted providers in your church community.", badge: null, locked: !verified },
    { href: "/messages", title: "Messages", desc: "Connect with providers and manage conversations.", badge: conversations > 0 ? `${conversations} active` : null, locked: !verified },
    ...(profile.role === "PROVIDER"
      ? [{ href: "/my-listings", title: "My listings", desc: "Manage your service offerings.", badge: `${activeListings} active · ${inactiveListings} inactive`, locked: false }]
      : []),
    { href: "/manage", title: "Booking requests", desc: "View and respond to booking requests.", badge: pendingBookings > 0 ? `${pendingBookings} pending` : null, locked: !verified },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="mb-1.5 font-serif text-lg italic text-clay">Welcome back</p>
      <h1 className="font-display text-[34px] font-bold tracking-[-0.02em] text-ink">
        {profile.fullName.split(" ")[0]}
      </h1>
      <p className="mt-1 text-[15px] text-muted">Your hub for the church marketplace.</p>

      {!verified && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[#E8D3A6] bg-[#F4E7CE] px-5 py-4">
          <div>
            <p className="font-display font-bold text-[#5A4214]">Verification pending</p>
            <p className="mt-0.5 text-sm text-[#7A6230]">
              Add your church details and a reference document to help an admin confirm you.
            </p>
          </div>
          <a href="/dashboard/edit-church" className="shrink-0 rounded-full bg-clay px-4 py-2.5 text-sm font-semibold text-paper no-underline hover:bg-clay-dark">
            Update details
          </a>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[20px] border border-line bg-paper p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-ink">Your profile</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            {[
              ["Full name", profile.fullName],
              ["Email", user.email],
              ["Role", profile.role],
              ["Linked church", profile.church?.name ?? "Not linked yet"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt className="text-faint">{label}</dt>
                <dd className="text-right font-semibold text-ink">{value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <dt className="text-faint">Verification</dt>
              <dd>
                <Badge tone={profile.verificationStatus === "VERIFIED" ? "verified" : profile.verificationStatus === "PENDING" ? "pending" : "neutral"}>
                  {profile.verificationStatus}
                </Badge>
              </dd>
            </div>
          </dl>
          <a href="/dashboard/edit-church" className="mt-5 block rounded-xl border-[1.5px] border-[#E5D8C0] p-2.5 text-center text-sm font-semibold text-[#5A4F40] no-underline hover:bg-chip">
            Edit church info
          </a>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-4">
          {tiles.map((tile) => (
            <a
              key={tile.title}
              href={tile.locked ? "#" : tile.href}
              className={`rounded-[20px] border border-line bg-paper p-5 shadow-sm transition hover:shadow-md ${
                tile.locked ? "pointer-events-none opacity-55" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-display font-bold text-ink">{tile.title}</h3>
                {tile.locked && <span className="text-xs text-faint">🔒</span>}
              </div>
              {tile.badge && <p className="mt-1 text-sm font-semibold text-clay">{tile.badge}</p>}
              <p className="mt-2 text-sm text-muted">{tile.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
