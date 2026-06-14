import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { notifyVerified } from "@/lib/email";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { profileId, verificationStatus } = await req.json();

  if (!profileId || !verificationStatus) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const profile = await prisma.userProfile.update({
    where: { id: profileId },
    data: { verificationStatus },
    include: { user: true },
  });

  if (verificationStatus === "VERIFIED") {
    try {
      await notifyVerified({ to: profile.user.email, fullName: profile.fullName });
    } catch (err) {
      console.error("[verify] email failed:", err);
    }
  }

  return NextResponse.json(profile);
}
