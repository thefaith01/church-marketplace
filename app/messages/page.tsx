import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { Container, PageHeader, EmptyState } from "@/components/ui";
import { ArchiveButton } from "@/components/ArchiveButton";
import { archiveFilter } from "@/lib/conversation-archive";
import { redirect } from "next/navigation";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/signup");
  if (profile.verificationStatus !== "VERIFIED" && !isAdmin(user)) {
    return <VerificationGate title="Messages require verification" />;
  }

  const { view } = await searchParams;
  const showArchived = view === "archived";

  const conversations = await prisma.conversation.findMany({
    where: archiveFilter(user.id, showArchived),
    include: {
      participantOne: { include: { profile: true } },
      participantTwo: { include: { profile: true } },
      messages: { orderBy: { timestamp: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const archivedCount = await prisma.conversation.count({
    where: archiveFilter(user.id, true),
  });
  const tabBase = "rounded-full px-4 py-2 text-sm font-semibold no-underline";
  const tabOn = `${tabBase} bg-ink text-paper`;
  const tabOff = `${tabBase} border-[1.5px] border-[#D8C9AE] text-ink hover:bg-chip`;

  return (
    <Container size="narrow">
      <PageHeader title="Messages" subtitle="Communicate with providers and manage conversations." />

      <div className="mb-4 flex gap-2">
        <a href="/messages" className={showArchived ? tabOff : tabOn}>Active</a>
        <a href="/messages?view=archived" className={showArchived ? tabOn : tabOff}>
          Archived{archivedCount > 0 ? ` (${archivedCount})` : ""}
        </a>
      </div>

      <div className="space-y-3">
        {conversations.map((conv) => {
          const other = conv.participantOneId === user.id ? conv.participantTwo : conv.participantOne;
          const last = conv.messages[0];
          return (
            <div
              key={conv.id}
              className="flex items-stretch gap-2 rounded-[18px] border border-line bg-paper p-2 transition hover:shadow-md"
            >
              <a href={`/messages/${conv.id}`} className="block min-w-0 flex-1 rounded-[14px] p-2 no-underline">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate font-display font-bold text-ink">
                    {other.profile?.fullName || other.email}
                  </h3>
                  <span className="shrink-0 text-xs text-faint">{new Date(conv.lastMessageAt).toLocaleDateString()}</span>
                </div>
                {last && <p className="mt-1 line-clamp-1 text-sm text-muted">{last.content}</p>}
              </a>
              <div className="flex items-center pr-2">
                <ArchiveButton conversationId={conv.id} archived={showArchived} />
              </div>
            </div>
          );
        })}
      </div>

      {conversations.length === 0 && (
        showArchived ? (
          <EmptyState icon="🗂️" title="No archived conversations." hint="Archived chats appear here. A new message brings a chat back to Active." />
        ) : (
          <EmptyState icon="💬" title="No conversations yet." hint="Browse services to start a conversation." />
        )
      )}
    </Container>
  );
}
