import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";
import { shell, appLink } from "@/lib/email";

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

  // Notify the recipient, but suppress emails on rapid consecutive messages
  // from the same sender so an active exchange doesn't flood their inbox.
  try {
    const prev = await prisma.message.findFirst({
      where: { conversationId, NOT: { id: message.id } },
      orderBy: { timestamp: "desc" },
    });
    const justMessaged =
      !!prev &&
      prev.senderId === user.id &&
      Date.now() - new Date(prev.timestamp).getTime() < 10 * 60 * 1000;

    if (!justMessaged) {
      const recipientId =
        conversation.participantOneId === user.id
          ? conversation.participantTwoId
          : conversation.participantOneId;
      const senderName = message.sender.profile?.fullName || user.email;
      const preview = content.length > 80 ? `${content.slice(0, 80)}…` : content;
      await notify({
        userId: recipientId,
        category: "messages",
        type: "message",
        title: `New message from ${senderName}`,
        body: preview,
        url: `/messages/${conversationId}`,
        email: {
          subject: `New message from ${senderName}`,
          html: shell(
            "You have a new message",
            `${senderName} sent you a message on the marketplace.`,
            { label: "Open conversation", href: appLink(`/messages/${conversationId}`) }
          ),
        },
      });
    }
  } catch (err) {
    console.error("[message] email failed:", err);
  }

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
