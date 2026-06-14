import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { VerificationGate } from "@/components/VerificationGate";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) redirect("/signup");

  if (profile.verificationStatus !== "VERIFIED") {
    return <VerificationGate title="Messages require verification" />;
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participantOneId: user.id }, { participantTwoId: user.id }],
    },
    include: {
      participantOne: { include: { profile: true } },
      participantTwo: { include: { profile: true } },
      messages: { orderBy: { timestamp: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Messages</h1>
      <p className="text-gray-500 text-sm mt-1">
        Communicate with providers and manage conversations
      </p>

      <div className="mt-6 space-y-3">
        {conversations.map((conv) => {
          const otherParticipant =
            conv.participantOneId === user.id
              ? conv.participantTwo
              : conv.participantOne;
          const lastMessage = conv.messages[0];

          return (
            <a
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="block rounded-lg border p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-medium">
                  {otherParticipant.profile?.fullName || otherParticipant.email}
                </h3>
                <span className="text-xs text-gray-400">
                  {new Date(conv.lastMessageAt).toLocaleDateString()}
                </span>
              </div>
              {lastMessage && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                  {lastMessage.content}
                </p>
              )}
            </a>
          );
        })}
      </div>

      {conversations.length === 0 && (
        <div className="mt-12 text-center text-gray-400">
          <p className="text-4xl">💬</p>
          <p className="mt-2">No conversations yet. Browse services to start.</p>
        </div>
      )}
    </div>
  );
}
