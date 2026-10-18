import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { findOrCreateConversation } from "@/lib/conversation";
import { canMessage, isVerified } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const myProfile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!myProfile || (!canMessage(myProfile) && !user.isAdmin)) {
    return NextResponse.json(
      { error: "Your account needs to be verified by your church before you can message." },
      { status: 403 }
    );
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

  const other = await prisma.user.findUnique({
    where: { id: otherUserId },
    include: { profile: true },
  });
  if (!other || (!user.isAdmin && !other.isAdmin && !(other.profile && isVerified(other.profile)))) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const conversation = await findOrCreateConversation(user.id, otherUserId);
  return NextResponse.json({ ok: true, id: conversation.id });
}
