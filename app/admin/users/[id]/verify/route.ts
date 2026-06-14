import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: profileId } = await params;

  const profile = await prisma.userProfile.update({
    where: { id: profileId },
    data: { verificationStatus: "VERIFIED" },
  });

  return NextResponse.redirect(new URL("/admin/users", req.url));
}
