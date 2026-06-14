import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.formData();
  const name = (body.get("name") as string)?.trim();
  if (name) {
    await prisma.church.create({
      data: {
        name,
        city: (body.get("city") as string)?.trim() || null,
        region: (body.get("region") as string)?.trim() || null,
        contactInfo: (body.get("contactInfo") as string)?.trim() || null,
      },
    });
  }

  return NextResponse.redirect(new URL("/admin/churches", req.url));
}
