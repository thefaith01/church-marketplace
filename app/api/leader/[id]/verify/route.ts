import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canLeaderModerate } from "@/lib/auth";
import { notifyVerified } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const me = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!me) {
    return NextResponse.json({ error: "Profile not found" }, { status: 403 });
  }

  const { id } = await params;
  const target = await prisma.userProfile.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  if (!canLeaderModerate(me, target)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  await prisma.userProfile.update({
    where: { id },
    data: { verificationStatus: "VERIFIED" },
  });

  try {
    await notifyVerified({ to: target.user.email, fullName: target.fullName });
  } catch (err) {
    console.error("[leader verify] email failed:", err);
  }

  return NextResponse.redirect(new URL("/leader", req.url));
}
