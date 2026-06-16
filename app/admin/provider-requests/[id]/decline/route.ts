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

  await prisma.providerRequest.update({
    where: { id },
    data: { status: "DECLINED" },
  });

  await logAudit(user.id, "Declined provider request", request.profile.fullName);

  try {
    await notify({
      userId: request.profile.userId,
      category: "requests",
      type: "provider_declined",
      title: "Provider request update",
      body: "Your request to become a provider was not approved at this time.",
      url: "/dashboard",
      email: {
        subject: "Your provider request was declined",
        html: shell(
          "Provider request declined",
          `Hi ${request.profile.fullName.split(" ")[0]}, your request to become a provider was not approved at this time. Reach out to your church or an admin if you have questions.`,
          { label: "Go to dashboard", href: appLink("/dashboard") }
        ),
      },
    });
  } catch (err) {
    console.error("[provider-request decline] notify failed:", err);
  }

  return NextResponse.redirect(new URL("/admin/provider-requests", req.url));
}
