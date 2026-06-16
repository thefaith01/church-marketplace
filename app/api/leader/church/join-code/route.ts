import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { joinCode } from "@/lib/token";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!me?.isChurchLeader || !me.churchId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  await prisma.church.update({
    where: { id: me.churchId },
    data: { joinCode: joinCode() },
  });

  return NextResponse.redirect(new URL("/leader", req.url));
}
