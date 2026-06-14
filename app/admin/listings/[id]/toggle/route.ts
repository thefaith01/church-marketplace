import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: listingId } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const newStatus = listing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: newStatus },
  });

  return NextResponse.redirect(new URL("/admin/listings", req.url));
}
