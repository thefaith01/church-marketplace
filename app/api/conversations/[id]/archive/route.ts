import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { archiveData } from "@/lib/conversation-archive";

// Archive or unarchive a conversation for the signed in participant only.
// Nothing is deleted and the other person's view is never changed.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body.archived !== "boolean") {
    return NextResponse.json({ error: "archived must be true or false" }, { status: 400 });
  }

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: { id: true, participantOneId: true, participantTwoId: true },
  });
  if (
    !conversation ||
    (conversation.participantOneId !== user.id && conversation.participantTwoId !== user.id)
  ) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  await prisma.conversation.update({
    where: { id },
    data: archiveData(conversation, user.id, body.archived),
  });
  return NextResponse.json({ ok: true, archived: body.archived });
}
