import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";

// Member escalates a booking issue to their church leader(s); falls back to admins.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: {
      listing: true,
      requester: { include: { profile: true } },
      provider: { include: { profile: true } },
    },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.requesterId !== user.id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const me = booking.requester.profile;
  const memberName = me?.fullName || "A member";
  const providerName = booking.provider.profile?.fullName || "a provider";

  let recipients: string[] = [];
  if (me?.churchId) {
    const leaders = await prisma.userProfile.findMany({
      where: { churchId: me.churchId, isChurchLeader: true },
    });
    recipients = leaders.map((l) => l.userId);
  }
  if (recipients.length === 0) {
    const admins = await prisma.user.findMany({ where: { isAdmin: true }, select: { id: true } });
    recipients = admins.map((a) => a.id);
  }

  const title = "A member flagged a booking";
  const body = `${memberName} raised an issue with "${booking.listing.title}" from ${providerName}.`;
  for (const rid of recipients) {
    try {
      await notify({
        userId: rid,
        category: "bookings",
        type: "booking_escalated",
        title,
        body,
        url: "/manage",
        email: {
          subject: `${memberName} flagged a booking for your attention`,
          html: shell(
            "A booking needs a look",
            `${memberName} flagged an issue with the booking "${booking.listing.title}" from ${providerName}. You may want to follow up with them offline.`,
            { label: "Open the app", href: appLink("/manage") }
          ),
        },
      });
    } catch (err) {
      console.error("[escalate] notify failed:", err);
    }
  }

  return NextResponse.redirect(new URL("/manage", req.url));
}
