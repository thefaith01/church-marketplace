import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { boundedString } from "@/lib/validate";

// A member submits a testimonial for a completed booking. Goes to PENDING for moderation.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
  const content = boundedString(body.content, 1500);
  if (!bookingId || !content) {
    return NextResponse.json({ error: "Please write a short testimonial." }, { status: 400 });
  }

  const booking = await prisma.bookingRequest.findUnique({ where: { id: bookingId } });
  if (!booking || booking.requesterId !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "You can only leave a testimonial on a completed booking." },
      { status: 400 }
    );
  }

  const existing = await prisma.testimonial.findUnique({ where: { bookingId } });
  if (existing) {
    return NextResponse.json({ error: "You've already left a testimonial for this booking." }, { status: 400 });
  }

  await prisma.testimonial.create({
    data: {
      bookingId,
      authorId: user.id,
      providerId: booking.providerId,
      content,
    },
  });

  return NextResponse.json({ ok: true });
}
