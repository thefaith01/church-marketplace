import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canLeaderModerate } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";
import { logAudit } from "@/lib/audit";

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
    data: { verificationStatus: "VERIFIED", verifiedAt: new Date() },
  });

  await logAudit(user.id, "Confirmed member (leader)", target.fullName);

  try {
    await notify({
      userId: target.userId,
      category: "verification",
      type: "verified",
      title: "You're verified",
      body: "Your church leader confirmed your membership. The marketplace is unlocked.",
      url: "/dashboard",
      email: {
        subject: "You're verified — the marketplace is unlocked",
        html: shell(
          "You're verified",
          `Hi ${target.fullName.split(" ")[0]}, your church leader has confirmed your membership. You can now browse services, message providers, and make bookings.`,
          { label: "Go to dashboard", href: appLink("/dashboard") }
        ),
      },
    });
  } catch (err) {
    console.error("[leader verify] notify failed:", err);
  }

  return NextResponse.redirect(new URL("/leader", req.url));
}
