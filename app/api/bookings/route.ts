import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { findOrCreateConversation } from "@/lib/conversation";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const listingId = body.listingId as string;
  const jobDescription = (body.jobDescription as string)?.trim();
  const requestedDateText = (body.requestedDateText as string)?.trim() || null;

  if (!listingId || !jobDescription) {
    return NextResponse.json(
      { error: "Listing and job description are required" },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.providerId === user.id) {
    return NextResponse.json(
      { error: "You cannot book your own listing" },
      { status: 400 }
    );
  }

  const conversation = await findOrCreateConversation(
    user.id,
    listing.providerId
  );

  const booking = await prisma.bookingRequest.create({
    data: {
      jobDescription,
      requestedDateText,
      listingId: listing.id,
      requesterId: user.id,
      providerId: listing.providerId,
      conversationId: conversation.id,
    },
  });

  // Seed the conversation with the request so the provider sees context.
  await prisma.message.create({
    data: {
      content: `Booking request for "${listing.title}": ${jobDescription}${
        requestedDateText ? ` (Preferred: ${requestedDateText})` : ""
      }`,
      conversationId: conversation.id,
      senderId: user.id,
    },
  });
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  });

  try {
    const [provider, requesterProfile] = await Promise.all([
      prisma.user.findUnique({ where: { id: listing.providerId } }),
      prisma.userProfile.findUnique({ where: { userId: user.id } }),
    ]);
    if (provider) {
      const requesterName = requesterProfile?.fullName || user.email;
      await notify({
        userId: provider.id,
        category: "bookings",
        type: "booking_request",
        title: "New booking request",
        body: `${requesterName} requested "${listing.title}".`,
        url: "/manage",
        email: {
          subject: `New booking request: ${listing.title}`,
          html: shell(
            "New booking request",
            `${requesterName} has requested your service "${listing.title}". Respond from your bookings.`,
            { label: "View request", href: appLink("/manage") }
          ),
        },
      });
    }
  } catch (err) {
    console.error("[booking create] email failed:", err);
  }

  return NextResponse.json({
    ok: true,
    id: booking.id,
    conversationId: conversation.id,
  });
}
