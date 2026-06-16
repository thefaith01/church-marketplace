import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { isEmail } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`login:${clientIp(req)}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  const { email, password } = await req.json().catch(() => ({}));
  if (!isEmail(email) || typeof password !== "string" || password.length < 1 || password.length > 200) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signJwt({ userId: user.id });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}