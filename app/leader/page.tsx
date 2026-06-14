import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Container, PageHeader, Badge, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function LeaderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const me = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { church: true },
  });
  if (!me) redirect("/signup");
  if (!me.isChurchLeader || !me.churchId) redirect("/dashboard");

  const members = await prisma.userProfile.findMany({
    where: { churchId: me.churchId, NOT: { id: me.id } },
    include: { user: true },
    orderBy: [{ verificationStatus: "asc" }, { createdAt: "desc" }],
  });

  const pending = members.filter((m) => m.verificationStatus !== "VERIFIED").length;

  return (
    <Container size="wide">
      <PageHeader
        eyebrow="Elder approval"
        title={`${me.church?.name || "Your church"} members`}
        subtitle={`Confirm membership for people linked to your church. ${pending} awaiting you.`}
      />

      <div className="overflow-x-auto rounded-[18px] border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-chip/50">
            <tr>
              {["Name", "Email", "Role", "Status", "Action"].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-semibold text-[#5A4F40]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3 font-medium text-ink">{m.fullName}</td>
                <td className="px-5 py-3 text-muted">{m.user.email}</td>
                <td className="px-5 py-3"><Badge>{m.role}</Badge></td>
                <td className="px-5 py-3">
                  <Badge tone={m.verificationStatus === "VERIFIED" ? "verified" : m.verificationStatus === "PENDING" ? "pending" : "neutral"}>
                    {m.verificationStatus}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    {m.verificationStatus !== "VERIFIED" && (
                      <form action={`/api/leader/${m.id}/verify`} method="POST">
                        <button type="submit" className="rounded-full bg-forest px-3 py-1 text-xs font-semibold text-paper hover:opacity-90">Confirm</button>
                      </form>
                    )}
                    {m.verificationStatus === "VERIFIED" && (
                      <form action={`/api/leader/${m.id}/reject`} method="POST">
                        <button type="submit" className="rounded-full border-[1.5px] border-[#E2C3B6] px-3 py-1 text-xs font-semibold text-clay-dark hover:bg-[#F3E1D9]">Revoke</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {members.length === 0 && (
        <EmptyState icon="⛪" title="No members linked yet" hint="Members who select your church at signup appear here." />
      )}
    </Container>
  );
}
