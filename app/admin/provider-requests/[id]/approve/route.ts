import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { notifyProviderDecision } from "@/lib/email";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const request = await prisma.providerRequest.findUnique({
    where: { id },
    include: { profile: { include: { user: true } } },
  });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.providerRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    }),
    prisma.userProfile.update({
      where: { id: request.profileId },
      data: { role: "PROVIDER" },
    }),
  ]);

  await logAudit(user.id, "Approved provider request", request.profile.fullName);

  try {
    await notifyProviderDecision({
      to: request.profile.user.email,
      fullName: request.profile.fullName,
      approved: true,
    });
  } catch (err) {
    console.error("[provider-request approve] email failed:", err);
  }

  return NextResponse.redirect(new URL("/admin/provider-requests", req.url));
}
