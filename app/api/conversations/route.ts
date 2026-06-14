import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { findOrCreateConversation } from "@/lib/conversation";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { otherUserId } = await req.json();
  if (!otherUserId) {
    return NextResponse.json(
      { error: "Missing otherUserId" },
      { status: 400 }
    );
  }
  if (otherUserId === user.id) {
    return NextResponse.json(
      { error: "Cannot start a conversation with yourself" },
      { status: 400 }
    );
  }

  const other = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!other) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const conversation = await findOrCreateConversation(user.id, otherUserId);
  return NextResponse.json({ ok: true, id: conversation.id });
}
