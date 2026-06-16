import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Mark notifications read. Body { id } marks one; empty body marks all.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = body?.id as string | undefined;

  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null, ...(id ? { id } : {}) },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
