import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.bookingRequest.findUnique({
    where: { id },
    include: {
      listing: true,
      requester: true,
      provider: { include: { profile: true } },
    },
  });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.providerId !== user.id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  await prisma.bookingRequest.update({
    where: { id },
    data: { status: "ACCEPTED" },
  });

  try {
    const providerName = booking.provider.profile?.fullName || "The provider";
    await notify({
      userId: booking.requesterId,
      category: "bookings",
      type: "booking_accepted",
      title: "Booking accepted",
      body: `${providerName} accepted your request for "${booking.listing.title}".`,
      url: "/manage",
      email: {
        subject: "Your booking request was accepted",
        html: shell(
          "Booking accepted",
          `${providerName} has accepted your booking request for "${booking.listing.title}".`,
          { label: "View booking", href: appLink("/manage") }
        ),
      },
    });
  } catch (err) {
    console.error("[booking accept] notify failed:", err);
  }

  return NextResponse.redirect(new URL("/manage", req.url));
}
