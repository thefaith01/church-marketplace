import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const PRICING = ["HOURLY", "FIXED", "QUOTE"] as const;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile || profile.role === "MEMBER") {
    return NextResponse.json(
      { error: "Only providers can create listings" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const title = (body.title as string)?.trim();
  const category = (body.category as string)?.trim();
  const description = (body.description as string)?.trim();
  const pricingType = body.pricingType as string;
  const indicativePrice = (body.indicativePrice as string)?.trim() || null;
  const serviceArea = (body.serviceArea as string)?.trim() || null;
  const availabilityNotes = (body.availabilityNotes as string)?.trim() || null;

  if (!title || !category || !description) {
    return NextResponse.json(
      { error: "Title, category, and description are required" },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      category,
      description,
      pricingType: PRICING.includes(pricingType as any)
        ? (pricingType as any)
        : "QUOTE",
      indicativePrice,
      serviceArea,
      availabilityNotes,
      providerId: user.id,
    },
  });

  return NextResponse.json({ ok: true, id: listing.id });
}
