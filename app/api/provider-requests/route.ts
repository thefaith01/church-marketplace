import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { uploadVerificationDoc } from "@/lib/storage";
import {
  notifyAdminsOfProviderRequest,
  notifyLeaderOfProviderRequest,
} from "@/lib/email";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { church: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  if (profile.role !== "MEMBER") {
    return NextResponse.json(
      { error: "Only members can request to become providers." },
      { status: 400 }
    );
  }

  const existing = await prisma.providerRequest.findFirst({
    where: { profileId: profile.id, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You already have a request under review." },
      { status: 400 }
    );
  }

  const form = await req.formData();
  const rawNote = (form.get("note") as string | null)?.trim() || "";
  const churchContact = (form.get("churchContact") as string | null)?.trim() || "";
  const document = form.get("document");

  let note = rawNote;
  if (churchContact) {
    note = note
      ? `${note}\n\nChurch contact: ${churchContact}`
      : `Church contact: ${churchContact}`;
  }

  let documentPath: string | null = null;
  if (document instanceof File && document.size > 0) {
    try {
      documentPath = await uploadVerificationDoc(document, user.id);
    } catch (err) {
      console.error("[provider-request] upload failed:", err);
    }
  }

  await prisma.providerRequest.create({
    data: { profileId: profile.id, note: note || null, documentPath },
  });

  await logAudit(user.id, "Requested provider status", profile.fullName);

  try {
    await notifyAdminsOfProviderRequest({
      fullName: profile.fullName,
      churchName: profile.church?.name,
      churchContact: churchContact || profile.church?.contactInfo,
      hasDocument: Boolean(documentPath),
    });

    if (profile.churchId) {
      const leaders = await prisma.userProfile.findMany({
        where: {
          churchId: profile.churchId,
          isChurchLeader: true,
          userId: { not: user.id },
        },
        include: { user: true },
      });
      await notifyLeaderOfProviderRequest({
        to: leaders.map((l) => l.user.email),
        fullName: profile.fullName,
      });
    }
  } catch (err) {
    console.error("[provider-request] notify failed:", err);
  }

  return NextResponse.json({ ok: true });
}
