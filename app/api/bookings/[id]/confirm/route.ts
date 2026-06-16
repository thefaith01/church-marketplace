import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";

// Member confirms the work is done -> booking closes as COMPLETED.
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
    return NextResponse.json({ error: "Only the member can confirm" }, { status: 403 });
  }
  if (booking.status !== "AWAITING_CONFIRMATION" && booking.status !== "ACCEPTED") {
    return NextResponse.json({ error: "This booking can't be confirmed" }, { status: 400 });
  }

  await prisma.bookingRequest.update({ where: { id }, data: { status: "COMPLETED" } });

  try {
    const memberName = booking.requester.profile?.fullName || "The member";
    await notify({
      userId: booking.providerId,
      category: "bookings",
      type: "booking_completed",
      title: "Booking confirmed complete",
      body: `${memberName} confirmed "${booking.listing.title}" is done.`,
      url: "/manage",
      email: {
        subject: "Your booking was confirmed complete",
        html: shell(
          "Booking complete",
          `${memberName} has confirmed your booking "${booking.listing.title}" is done. Thank you.`,
          { label: "View bookings", href: appLink("/manage") }
        ),
      },
    });
  } catch (err) {
    console.error("[confirm] notify failed:", err);
  }

  // Offer the member an optional testimonial next.
  return NextResponse.redirect(new URL(`/bookings/${id}/testimonial`, req.url));
}
