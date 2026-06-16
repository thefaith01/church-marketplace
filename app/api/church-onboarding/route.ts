import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { isEmail, boundedString } from "@/lib/validate";
import { notifyAdminsOfChurchOnboarding } from "@/lib/email";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`onboard:${clientIp(req)}`, 5, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = (typeof body.email === "string" ? body.email : "").trim();
  const password = body.password;
  const fullName = boundedString(body.fullName, 120);
  const churchName = boundedString(body.churchName, 160);
  const churchCity = boundedString(body.churchCity, 120);
  const title = boundedString(body.title, 80);
  const note = boundedString(body.note, 1000);

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 200) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ error: "Your full name is required." }, { status: 400 });
  }
  if (!churchName) {
    return NextResponse.json({ error: "Your church name is required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered." }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);

  // New church starts inactive until an admin confirms the leader.
  const church = await prisma.church.create({
    data: { name: churchName, city: churchCity, status: "INACTIVE" },
  });

  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      profile: {
        create: {
          fullName,
          role: "MEMBER",
          verificationStatus: "UNVERIFIED",
          isChurchLeader: false,
          churchId: church.id,
          churchReferenceName: churchName,
          churchReferenceCity: churchCity ?? undefined,
          churchReferencePerson: title ?? undefined,
        },
      },
    },
  });

  await prisma.churchLeaderRequest.create({
    data: { userId: user.id, churchId: church.id, title: title ?? undefined, note: note ?? undefined },
  });

  try {
    await notifyAdminsOfChurchOnboarding({ fullName, email, churchName, churchCity, title, note });
  } catch (err) {
    console.error("[church-onboarding] admin notify failed:", err);
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
