import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Container, PageHeader, Card, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";
import BulkVerify from "@/components/BulkVerify";
import CopyLink from "@/components/CopyLink";

export default async function LeaderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const me = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { church: true },
  });
  if (!me) redirect("/signup");
  if (!me.isChurchLeader || !me.churchId) redirect("/dashboard");

  const membersRaw = await prisma.userProfile.findMany({
    where: { churchId: me.churchId, NOT: { id: me.id } },
    include: { user: true },
    orderBy: [{ verificationStatus: "asc" }, { createdAt: "desc" }],
  });
  const members = membersRaw.map((m) => ({
    id: m.id,
    fullName: m.fullName,
    email: m.user.email,
    role: m.role,
    verificationStatus: m.verificationStatus,
  }));
  const pending = members.filter((m) => m.verificationStatus !== "VERIFIED").length;
  const joinPath = me.church?.joinCode ? `/join/${me.church.joinCode}` : null;

  return (
    <Container size="wide">
      <PageHeader
        eyebrow="Church leader"
        title={`${me.church?.name || "Your church"} members`}
        subtitle={`Confirm membership, invite people, and see your church at a glance. ${pending} awaiting you.`}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <p className="font-display font-bold text-ink">Invite link</p>
          <p className="mt-1 text-sm text-muted">
            Share this so people sign up already linked to your church. You still confirm each one.
          </p>
          <div className="mt-3">
            {joinPath ? <CopyLink path={joinPath} /> : <p className="text-sm text-faint">No link created yet.</p>}
          </div>
          <form action="/api/leader/church/join-code" method="POST" className="mt-3">
            <button
              type="submit"
              className="rounded-full border-[1.5px] border-[#D8C9AE] px-4 py-2 text-sm font-semibold text-ink hover:bg-chip"
            >
              {joinPath ? "Regenerate link" : "Create invite link"}
            </button>
          </form>
        </Card>

        <Card>
          <p className="font-display font-bold text-ink">Tools</p>
          <p className="mt-1 text-sm text-muted">Add many members at once, or see your church's numbers.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/leader/import" className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-paper no-underline hover:bg-clay-dark">
              Import members (CSV)
            </a>
            <a href="/leader/analytics" className="rounded-full border-[1.5px] border-[#D8C9AE] px-4 py-2 text-sm font-semibold text-ink no-underline hover:bg-chip">
              Church analytics
            </a>
            <a href={`/churches/${me.churchId}`} className="rounded-full border-[1.5px] border-[#D8C9AE] px-4 py-2 text-sm font-semibold text-ink no-underline hover:bg-chip">
              Public page
            </a>
          </div>
        </Card>
      </div>

      {members.length > 0 ? (
        <BulkVerify members={members} />
      ) : (
        <EmptyState
          icon="⛪"
          title="No members linked yet"
          hint="Share your invite link or import a list to get started."
        />
      )}
    </Container>
  );
}
