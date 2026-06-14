import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const request = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (request.requesterId !== user.id && !isAdmin(user)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  await prisma.serviceRequest.update({ where: { id }, data: { status: "CLOSED" } });

  return NextResponse.redirect(new URL(`/requests/${id}`, req.url));
}
