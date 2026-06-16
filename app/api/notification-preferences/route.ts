import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const FIELDS = [
  "messagesEmail",
  "messagesPush",
  "bookingsEmail",
  "bookingsPush",
  "verificationEmail",
  "verificationPush",
  "requestsEmail",
  "requestsPush",
] as const;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const data: Record<string, boolean> = {};
  for (const f of FIELDS) {
    if (typeof body?.[f] === "boolean") data[f] = body[f];
  }

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });

  return NextResponse.json({ ok: true });
}
