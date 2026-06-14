import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const PRICING = ["HOURLY", "FIXED", "QUOTE"] as const;

async function loadOwnedListing(id: string, userId: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return { error: "Listing not found", status: 404 as const };
  if (listing.providerId !== userId) {
    return { error: "Access denied", status: 403 as const };
  }
  return { listing };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const owned = await loadOwnedListing(id, user.id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  const body = await req.json();
  const title = (body.title as string)?.trim();
  const category = (body.category as string)?.trim();
  const description = (body.description as string)?.trim();
  if (!title || !category || !description) {
    return NextResponse.json(
      { error: "Title, category, and description are required" },
      { status: 400 }
    );
  }

  const status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

  await prisma.listing.update({
    where: { id },
    data: {
      title,
      category,
      description,
      pricingType: PRICING.includes(body.pricingType)
        ? body.pricingType
        : "QUOTE",
      indicativePrice: (body.indicativePrice as string)?.trim() || null,
      serviceArea: (body.serviceArea as string)?.trim() || null,
      availabilityNotes: (body.availabilityNotes as string)?.trim() || null,
      isFreeHelp: body.isFreeHelp === true,
      imageUrl: (body.imageUrl as string)?.trim() || null,
      status,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const owned = await loadOwnedListing(id, user.id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  // Remove dependent booking requests first to satisfy FK constraints.
  await prisma.bookingRequest.deleteMany({ where: { listingId: id } });
  await prisma.listing.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
