import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { parseMemberCsv } from "@/lib/csv";
import { inviteToken } from "@/lib/token";
import { notifyChurchInvite, appLink } from "@/lib/email";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { church: true },
  });
  if (!me?.isChurchLeader || !me.churchId || !me.church) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const csv = typeof body.csv === "string" ? body.csv : "";
  const mode: "invites" | "roster" | "both" =
    body.mode === "roster" || body.mode === "both" ? body.mode : "invites";

  const rows = parseMemberCsv(csv).slice(0, 500);
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No valid rows found. Use one name,email per line." },
      { status: 400 }
    );
  }

  let invited = 0;
  let rostered = 0;

  for (const row of rows) {
    if (mode === "roster" || mode === "both") {
      await prisma.churchRosterEntry.upsert({
        where: { churchId_email: { churchId: me.churchId, email: row.email } },
        update: { fullName: row.fullName ?? undefined, addedById: user.id },
        create: { churchId: me.churchId, email: row.email, fullName: row.fullName, addedById: user.id },
      });
      rostered++;
    }
    if (mode === "invites" || mode === "both") {
      const token = inviteToken();
      await prisma.churchInvite.create({
        data: {
          churchId: me.churchId,
          email: row.email,
          token,
          invitedById: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      try {
        await notifyChurchInvite({
          to: row.email,
          churchName: me.church.name,
          link: appLink(`/join/${token}`),
        });
      } catch (err) {
        console.error("[import] invite email failed:", err);
      }
      invited++;
    }
  }

  return NextResponse.json({ ok: true, invited, rostered, total: rows.length });
}
