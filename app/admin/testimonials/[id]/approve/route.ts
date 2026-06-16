import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const t = await prisma.testimonial.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  await logAudit(user.id, "Approved testimonial", id);

  try {
    await notify({
      userId: t.providerId,
      category: "requests",
      type: "testimonial_approved",
      title: "You received a testimonial",
      body: "A member's testimonial about your work is now on your profile.",
      url: `/providers/${t.providerId}`,
      email: {
        subject: "A new testimonial is live on your profile",
        html: shell(
          "You received a testimonial",
          "A member left a testimonial about your work, and it's now visible on your provider profile.",
          { label: "View your profile", href: appLink(`/providers/${t.providerId}`) }
        ),
      },
    });
  } catch (err) {
    console.error("[testimonial approve] notify failed:", err);
  }

  return NextResponse.redirect(new URL("/admin/testimonials", req.url));
}
