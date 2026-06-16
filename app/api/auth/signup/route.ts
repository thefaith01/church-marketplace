import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";
import { notifyAdminsOfSignup } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { isEmail, boundedString, oneOf } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`signup:${clientIp(req)}`, 5, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many sign-up attempts. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const body = await req.formData();
  const email = ((body.get("email") as string) || "").trim();
  const password = body.get("password") as string;
  const fullName = boundedString(body.get("fullName"), 120);
  const role = oneOf(body.get("role"), ["MEMBER", "PROVIDER"] as const, "MEMBER");

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 200) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ error: "Your full name is required." }, { status: 400 });
  }
  const churchReferenceName = (body.get("churchReferenceName") as string) || null;
  const churchReferenceCity = (body.get("churchReferenceCity") as string) || null;
  const churchReferencePerson = (body.get("churchReferencePerson") as string) || null;
  const churchId = (body.get("churchId") as string) || null;

  const letterFile = body.get("churchReferenceLetter") as File | null;
  let churchReferenceLetterUrl: string | null = null;
  if (letterFile && letterFile.size > 0) {
    // TODO: implement file upload (Supabase, S3, etc.)
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 400 }
    );
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      profile: {
        create: {
          fullName,
          role,
          verificationStatus: "UNVERIFIED",
          churchReferenceName,
          churchReferenceCity,
          churchReferencePerson,
          churchReferenceLetter: churchReferenceLetterUrl,
          ...(churchId ? { churchId } : {}),
        },
      },
    },
  });

  // Notify admins of the new signup. Never block account creation on email.
  try {
    await notifyAdminsOfSignup({
      fullName,
      email,
      role,
      churchReferenceName,
      churchReferenceCity,
    });
  } catch (err) {
    console.error("[signup] admin notification failed:", err);
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
