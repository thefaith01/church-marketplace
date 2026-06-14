import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { uploadVerificationDoc } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  if (profile.verificationStatus === "VERIFIED") {
    return NextResponse.json(
      { error: "You are already verified" },
      { status: 400 }
    );
  }

  const body = await req.formData();
  const churchReferenceName =
    (body.get("churchReferenceName") as string)?.trim() || null;
  const churchReferenceCity =
    (body.get("churchReferenceCity") as string)?.trim() || null;
  const churchReferencePerson =
    (body.get("churchReferencePerson") as string)?.trim() || null;

  let churchReferenceLetter = profile.churchReferenceLetter;
  const file = body.get("churchReferenceLetter") as File | null;
  if (file && file.size > 0) {
    try {
      const url = await uploadVerificationDoc(file, user.id);
      if (url) churchReferenceLetter = url;
    } catch (err) {
      console.error("[verification] upload failed:", err);
      return NextResponse.json(
        { error: "Document upload failed. Please try again." },
        { status: 500 }
      );
    }
  }

  await prisma.userProfile.update({
    where: { id: profile.id },
    data: {
      churchReferenceName,
      churchReferenceCity,
      churchReferencePerson,
      churchReferenceLetter,
      // Resubmitting moves the user into the review queue.
      verificationStatus: "PENDING",
    },
  });

  return NextResponse.json({ ok: true });
}
