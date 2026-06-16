import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";

// Member reports the job isn't done -> reopen to ACCEPTED and notify the provider.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: { listing: true, requester: { include: { profile: true } } },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.requesterId !== user.id) {
    return NextResponse.json({ error: "Only the member can report a problem" }, { status: 403 });
  }
  if (booking.status !== "AWAITING_CONFIRMATION") {
    return NextResponse.json({ error: "Nothing to report on this booking" }, { status: 400 });
  }

  await prisma.bookingRequest.update({ where: { id }, data: { status: "ACCEPTED" } });

  try {
    const memberName = booking.requester.profile?.fullName || "The member";
    const url = booking.conversationId ? `/messages/${booking.conversationId}` : "/manage";
    await notify({
      userId: booking.providerId,
      category: "bookings",
      type: "booking_disputed",
      title: "Booking not yet confirmed",
      body: `${memberName} reported "${booking.listing.title}" isn't done yet. Follow up in messages.`,
      url,
      email: {
        subject: "A booking wasn't confirmed as done",
        html: shell(
          "Booking reopened",
          `${memberName} reported that "${booking.listing.title}" isn't done yet, so it's back in progress. Reach out in messages to sort it out.`,
          { label: "Open messages", href: appLink(url) }
        ),
      },
    });
  } catch (err) {
    console.error("[dispute] notify failed:", err);
  }

  return NextResponse.redirect(new URL("/manage", req.url));
}
