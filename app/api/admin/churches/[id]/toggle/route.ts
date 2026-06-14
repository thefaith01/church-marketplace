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

  const { id } = await params;
  const church = await prisma.church.findUnique({ where: { id } });
  if (!church) {
    return NextResponse.json({ error: "Church not found" }, { status: 404 });
  }

  await prisma.church.update({
    where: { id },
    data: { status: church.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });

  return NextResponse.redirect(new URL("/admin/churches", req.url));
}
