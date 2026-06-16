import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!me?.isChurchLeader || !me.churchId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids)
    ? body.ids.filter((x: unknown): x is string => typeof x === "string")
    : [];
  if (ids.length === 0) return NextResponse.json({ ok: true, verified: 0 });

  // Only un-verified members of the leader's own church.
  const targets = await prisma.userProfile.findMany({
    where: { id: { in: ids }, churchId: me.churchId, verificationStatus: { not: "VERIFIED" } },
  });

  for (const t of targets) {
    await prisma.userProfile.update({
      where: { id: t.id },
      data: { verificationStatus: "VERIFIED", verifiedAt: new Date() },
    });
    await logAudit(user.id, "Confirmed member (leader, bulk)", t.fullName);
    try {
      await notify({
        userId: t.userId,
        category: "verification",
        type: "verified",
        title: "You're verified",
        body: "Your church leader confirmed your membership. The marketplace is unlocked.",
        url: "/dashboard",
        email: {
          subject: "You're verified — the marketplace is unlocked",
          html: shell(
            "You're verified",
            `Hi ${t.fullName.split(" ")[0]}, your church leader has confirmed your membership. You can now browse services, message providers, and make bookings.`,
            { label: "Go to dashboard", href: appLink("/dashboard") }
          ),
        },
      });
    } catch (err) {
      console.error("[bulk-verify] notify failed:", err);
    }
  }

  return NextResponse.json({ ok: true, verified: targets.length });
}
