import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";
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
    await notify({
      userId: updated.userId,
      category: "verification",
      type: "verified",
      title: "You're verified",
      body: "Your church connection is confirmed. The marketplace is unlocked.",
      url: "/dashboard",
      email: {
        subject: "You're verified — the marketplace is unlocked",
        html: shell(
          "You're verified",
          `Hi ${updated.fullName.split(" ")[0]}, an admin has confirmed your church connection. You can now browse services, message providers, and make bookings.`,
          { label: "Go to dashboard", href: appLink("/dashboard") }
        ),
      },
    });
  } catch (err) {
    console.error("[verify] notify failed:", err);
  }

  return NextResponse.redirect(new URL("/admin/users", req.url));
}
