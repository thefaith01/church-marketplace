import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { Container, PageHeader, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function AdminAuditPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const logs = await prisma.auditLog.findMany({
    include: { actor: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Container size="wide">
      <PageHeader title="Audit log" subtitle="Recent admin and church-leader actions." />

      <div className="overflow-x-auto rounded-[18px] border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-chip/50">
            <tr>
              {["When", "Who", "Action", "Detail"].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-semibold text-[#5A4F40]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0">
                <td className="whitespace-nowrap px-5 py-3 text-faint">
                  {new Date(l.createdAt).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-ink">{l.actor.profile?.fullName || l.actor.email}</td>
                <td className="px-5 py-3 font-medium text-ink">{l.action}</td>
                <td className="px-5 py-3 text-muted">{l.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && <EmptyState icon="📜" title="No activity yet" hint="Admin and leader actions will be recorded here." />}
    </Container>
  );
}
