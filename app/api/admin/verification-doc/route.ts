import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { signVerificationDocUrl } from "@/lib/storage";

// Admin-only: redirect to a short-lived signed URL for a member's reference doc.
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = new URL(req.url).searchParams.get("profileId");
  if (!profileId) {
    return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
  }

  const profile = await prisma.userProfile.findUnique({ where: { id: profileId } });
  if (!profile?.churchReferenceLetter) {
    return NextResponse.json({ error: "No document on file" }, { status: 404 });
  }

  const signed = await signVerificationDocUrl(profile.churchReferenceLetter);
  if (!signed) {
    return NextResponse.json(
      { error: "Document storage is not configured" },
      { status: 503 }
    );
  }

  return NextResponse.redirect(signed);
}
