import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.bookingRequest.findUnique({ where: { id } });
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

  return NextResponse.redirect(new URL("/manage", req.url));
}
