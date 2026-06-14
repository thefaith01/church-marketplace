import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}));

  if (!token || !password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Please choose a password of at least 8 characters." },
      { status: 400 }
    );
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: record.userId }, data: { password: hash } });
  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
