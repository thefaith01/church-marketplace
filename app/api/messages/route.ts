import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, content } = await req.json();

  if (!conversationId || !content) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  if (
    conversation.participantOneId !== user.id &&
    conversation.participantTwoId !== user.id
  ) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }

  const message = await prisma.message.create({
    data: {
      content,
      conversationId,
      senderId: user.id,
    },
    include: { sender: { include: { profile: true } } },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  return NextResponse.json(message);
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 }
    );
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  if (
    conversation.participantOneId !== user.id &&
    conversation.participantTwoId !== user.id
  ) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { sender: { include: { profile: true } } },
    orderBy: { timestamp: "asc" },
  });

  return NextResponse.json(messages);
}
