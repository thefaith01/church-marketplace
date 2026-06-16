import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { notifyChurchLeaderDecision } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const request = await prisma.churchLeaderRequest.findUnique({
    where: { id },
    include: { user: { include: { profile: true } }, church: true },
  });
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  await prisma.churchLeaderRequest.update({ where: { id }, data: { status: "DECLINED" } });
  await logAudit(user.id, "Declined church onboarding", request.church.name);

  try {
    await notify({
      userId: request.userId,
      category: "requests",
      type: "church_declined",
      title: "Church onboarding update",
      body: `Your request to onboard ${request.church.name} was not approved.`,
      url: "/dashboard",
    });
    await notifyChurchLeaderDecision({
      to: request.user.email,
      fullName: request.user.profile?.fullName || "there",
      churchName: request.church.name,
      approved: false,
    });
  } catch (err) {
    console.error("[church-request decline] notify failed:", err);
  }

  return NextResponse.redirect(new URL("/admin/church-requests", req.url));
}
