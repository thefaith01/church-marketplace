import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { MessageComposer } from "@/components/MessageComposer";
import { redirect, notFound } from "next/navigation";

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
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

  if (
    conversation.participantOneId !== user.id &&
    conversation.participantTwoId !== user.id
  ) {
    redirect("/messages");
  }

  const other =
    conversation.participantOneId === user.id
      ? conversation.participantTwo
      : conversation.participantOne;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <a href="/messages" className="text-sm text-blue-700 hover:underline">
        ← All messages
      </a>
      <h1 className="mt-3 text-2xl font-bold">
        {other.profile?.fullName || other.email}
      </h1>

      <div className="mt-5 space-y-3">
        {conversation.messages.map((m) => {
          const mine = m.senderId === user.id;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? "bg-blue-700 text-white"
                    : "bg-white border text-gray-800"
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    mine ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {new Date(m.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}

        {conversation.messages.length === 0 && (
          <p className="text-center text-sm text-gray-400">
            No messages yet. Say hello.
          </p>
        )}
      </div>

      <MessageComposer conversationId={conversation.id} />
    </div>
  );
}
