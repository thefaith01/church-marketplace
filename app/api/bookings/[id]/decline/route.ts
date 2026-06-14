import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notifyBookingResponse } from "@/lib/email";

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
    data: { status: "DECLINED" },
  });

  try {
    await notifyBookingResponse({
      to: booking.requester.email,
      providerName: booking.provider.profile?.fullName || "The provider",
      listingTitle: booking.listing.title,
      accepted: false,
    });
  } catch (err) {
    console.error("[booking decline] email failed:", err);
  }

  return NextResponse.redirect(new URL("/manage", req.url));
}
