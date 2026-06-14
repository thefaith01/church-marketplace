import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { notifyVerified } from "@/lib/email";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: profileId } = await params;

  const updated = await prisma.userProfile.update({
    where: { id: profileId },
    data: { verificationStatus: "VERIFIED", verifiedAt: new Date() },
    include: { user: true },
  });

  await logAudit(user.id, "Verified member", updated.fullName);

  try {
    await notifyVerified({ to: updated.user.email, fullName: updated.fullName });
  } catch (err) {
    console.error("[verify] email failed:", err);
  }

  return NextResponse.redirect(new URL("/admin/users", req.url));
}
