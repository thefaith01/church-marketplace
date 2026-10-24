import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { MessageThread } from "@/components/MessageThread";
import { ArchiveButton } from "@/components/ArchiveButton";
import { isArchivedFor } from "@/lib/conversation-archive";
import { redirect, notFound } from "next/navigation";

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/signup");
  if (profile.verificationStatus !== "VERIFIED" && !isAdmin(user)) {
    return <VerificationGate title="Messages require verification" />;
  }

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participantOne: { include: { profile: true } },
      participantTwo: { include: { profile: true } },
      messages: {
        include: { sender: { include: { profile: true } } },
        orderBy: { timestamp: "asc" },
      },
    },
  });
  if (!conversation) notFound();

  if (conversation.participantOneId !== user.id && conversation.participantTwoId !== user.id) {
    redirect("/messages");
  }

  const other = conversation.participantOneId === user.id ? conversation.participantTwo : conversation.participantOne;

  const archived = isArchivedFor(conversation, user.id);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <a href="/messages" className="text-sm font-semibold text-clay hover:underline">
        ← All messages
      </a>
      <div className="mt-3 flex items-center justify-between gap-3">
        <h1 className="min-w-0 truncate font-display text-[26px] font-bold tracking-[-0.02em] text-ink">
          {other.profile?.fullName || other.email}
        </h1>
        <ArchiveButton
          conversationId={conversation.id}
          archived={archived}
          redirectTo={archived ? undefined : "/messages"}
        />
      </div>
      {archived && (
        <p className="mt-2 text-sm text-muted">
          This chat is archived. Sending or receiving a message brings it back to your active list.
        </p>
      )}

      <MessageThread
        conversationId={conversation.id}
        currentUserId={user.id}
        initial={conversation.messages.map((m) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          timestamp: m.timestamp.toISOString(),
        }))}
      />
    </div>
  );
}
