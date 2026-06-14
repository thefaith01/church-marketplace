import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canBrowseMarketplace, isAdmin } from "@/lib/auth";
import { notifyServiceRequestMatch } from "@/lib/email";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile || (!canBrowseMarketplace(profile) && !isAdmin(user))) {
    return NextResponse.json(
      { error: "Only verified members can post requests" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const title = (body.title as string)?.trim();
  const description = (body.description as string)?.trim();
  const category = (body.category as string)?.trim() || null;
  const serviceArea = (body.serviceArea as string)?.trim() || null;
  const budget = (body.budget as string)?.trim() || null;

  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  const request = await prisma.serviceRequest.create({
    data: { title, description, category, serviceArea, budget, requesterId: user.id },
  });

  // Smart matching: notify providers who offer this category.
  if (category) {
    try {
      const matches = await prisma.listing.findMany({
        where: {
          status: "ACTIVE",
          category: { equals: category, mode: "insensitive" },
          NOT: { providerId: user.id },
        },
        select: { providerId: true, provider: { select: { email: true } } },
        distinct: ["providerId"],
      });
      await Promise.all(
        matches.map((m) =>
          notifyServiceRequestMatch({
            to: m.provider.email,
            requestTitle: title,
            requestId: request.id,
          })
        )
      );
    } catch (err) {
      console.error("[service-request match] email failed:", err);
    }
  }

  return NextResponse.json({ ok: true, id: request.id });
}
