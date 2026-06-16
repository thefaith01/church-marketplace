import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";

// Provider marks a booking done. This does NOT close it; it moves to
// AWAITING_CONFIRMATION and asks the member to confirm.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: { listing: true },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.providerId !== user.id) {
    return NextResponse.json({ error: "Only the provider can mark this done" }, { status: 403 });
  }
  if (booking.status !== "ACCEPTED") {
    return NextResponse.json({ error: "Only accepted bookings can be marked done" }, { status: 400 });
  }

  await prisma.bookingRequest.update({
    where: { id },
    data: { status: "AWAITING_CONFIRMATION" },
  });

  try {
    await notify({
      userId: booking.requesterId,
      category: "bookings",
      type: "booking_done_pending",
      title: "Confirm your booking is done",
      body: `The provider marked "${booking.listing.title}" as done. Please confirm it's complete.`,
      url: "/manage",
      email: {
        subject: "Please confirm your booking is done",
        html: shell(
          "Is this done?",
          `The provider has marked your booking "${booking.listing.title}" as done. Open your bookings to confirm it's complete, or report a problem.`,
          { label: "Review booking", href: appLink("/manage") }
        ),
      },
    });
  } catch (err) {
    console.error("[complete] notify failed:", err);
  }

  return NextResponse.redirect(new URL("/manage", req.url));
}
