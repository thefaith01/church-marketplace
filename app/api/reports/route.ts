import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canBrowseMarketplace, isAdmin } from "@/lib/auth";

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
      { error: "Only verified members can report" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const reason = (body.reason as string)?.trim();
  const details = (body.details as string)?.trim() || null;
  const listingId = (body.listingId as string) || null;
  const reportedUserId = (body.reportedUserId as string) || null;

  if (!reason) {
    return NextResponse.json({ error: "A reason is required" }, { status: 400 });
  }
  if (!listingId && !reportedUserId) {
    return NextResponse.json(
      { error: "Nothing to report" },
      { status: 400 }
    );
  }
  if (reportedUserId && reportedUserId === user.id) {
    return NextResponse.json(
      { error: "You cannot report yourself" },
      { status: 400 }
    );
  }

  await prisma.report.create({
    data: {
      reason,
      details,
      reporterId: user.id,
      listingId,
      reportedUserId,
    },
  });

  return NextResponse.json({ ok: true });
}
