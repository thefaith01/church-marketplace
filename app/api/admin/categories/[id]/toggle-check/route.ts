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
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  await prisma.category.update({
    where: { id },
    data: { requiresBackgroundCheck: !cat.requiresBackgroundCheck },
  });
  return NextResponse.redirect(new URL("/admin/categories", req.url));
}
