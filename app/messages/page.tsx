import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { Container, PageHeader, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/signup");
  if (profile.verificationStatus !== "VERIFIED" && !isAdmin(user)) {
    return <VerificationGate title="Messages require verification" />;
  }

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participantOneId: user.id }, { participantTwoId: user.id }] },
    include: {
      participantOne: { include: { profile: true } },
      participantTwo: { include: { profile: true } },
      messages: { orderBy: { timestamp: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return (
    <Container size="narrow">
      <PageHeader title="Messages" subtitle="Communicate with providers and manage conversations." />

      <div className="space-y-3">
        {conversations.map((conv) => {
          const other = conv.participantOneId === user.id ? conv.participantTwo : conv.participantOne;
          const last = conv.messages[0];
          return (
            <a
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="block rounded-[18px] border border-line bg-paper p-4 no-underline transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-display font-bold text-ink">
                  {other.profile?.fullName || other.email}
                </h3>
                <span className="text-xs text-faint">{new Date(conv.lastMessageAt).toLocaleDateString()}</span>
              </div>
              {last && <p className="mt-1 line-clamp-1 text-sm text-muted">{last.content}</p>}
            </a>
          );
        })}
      </div>

      {conversations.length === 0 && (
        <EmptyState icon="💬" title="No conversations yet." hint="Browse services to start a conversation." />
      )}
    </Container>
  );
}
