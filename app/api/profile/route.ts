import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const body = await req.json();
  const fullName = (body.fullName as string)?.trim();
  const bio = (body.bio as string)?.trim() || null;
  const avatarUrl = (body.avatarUrl as string)?.trim() || null;

  if (!fullName) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  await prisma.userProfile.update({
    where: { id: profile.id },
    data: { fullName, bio, avatarUrl },
  });

  return NextResponse.json({ ok: true });
}
