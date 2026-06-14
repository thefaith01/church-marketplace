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

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <a href="/messages" className="text-sm font-semibold text-clay hover:underline">
        ← All messages
      </a>
      <h1 className="mt-3 font-display text-[26px] font-bold tracking-[-0.02em] text-ink">
        {other.profile?.fullName || other.email}
      </h1>

      <div className="mt-5 space-y-3">
        {conversation.messages.map((m) => {
          const mine = m.senderId === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine ? "bg-clay text-paper" : "border border-line bg-paper text-ink"
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-[#F3D9CE]" : "text-faint"}`}>
                  {new Date(m.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}

        {conversation.messages.length === 0 && (
          <p className="text-center text-sm text-faint">No messages yet. Say hello.</p>
        )}
      </div>

      <MessageComposer conversationId={conversation.id} />
    </div>
  );
}
