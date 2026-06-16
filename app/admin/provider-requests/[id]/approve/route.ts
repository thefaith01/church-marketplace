import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const request = await prisma.providerRequest.findUnique({
    where: { id },
    include: { profile: { include: { user: true } } },
  });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.providerRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    }),
    prisma.userProfile.update({
      where: { id: request.profileId },
      data: { role: "PROVIDER" },
    }),
  ]);

  await logAudit(user.id, "Approved provider request", request.profile.fullName);

  try {
    await notify({
      userId: request.profile.userId,
      category: "requests",
      type: "provider_approved",
      title: "You're now a provider",
      body: "Your request was approved. You can create listings and offer your services.",
      url: "/my-listings",
      email: {
        subject: "Your provider request was approved",
        html: shell(
          "Provider request approved",
          `Hi ${request.profile.fullName.split(" ")[0]}, your request to become a provider has been approved. You can now create listings and offer your services.`,
          { label: "Go to my listings", href: appLink("/my-listings") }
        ),
      },
    });
  } catch (err) {
    console.error("[provider-request approve] notify failed:", err);
  }

  return NextResponse.redirect(new URL("/admin/provider-requests", req.url));
}
