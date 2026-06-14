import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { Container, PageHeader, Badge, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function AdminReportsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const reports = await prisma.report.findMany({
    include: {
      reporter: { include: { profile: true } },
      listing: true,
      reportedUser: { include: { profile: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const openCount = reports.filter((r) => r.status === "OPEN").length;

  return (
    <Container size="wide">
      <PageHeader
        title="Reports"
        subtitle={`Review and resolve flagged listings and members. ${openCount} open.`}
      />

      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="rounded-[18px] border border-line bg-paper p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-ink">{r.reason}</h3>
                  <Badge tone={r.status === "OPEN" ? "pending" : r.status === "RESOLVED" ? "verified" : "neutral"}>
                    {r.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Target:{" "}
                  {r.listing
                    ? `Listing "${r.listing.title}"`
                    : r.reportedUser
                      ? `Member ${r.reportedUser.profile?.fullName || r.reportedUser.email}`
                      : "Unknown"}
                </p>
                {r.details && <p className="mt-1 text-sm text-[#3C3528]">{r.details}</p>}
                <p className="mt-1 text-xs text-faint">
                  By {r.reporter.profile?.fullName || r.reporter.email} ·{" "}
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              {r.status === "OPEN" && (
                <div className="flex flex-shrink-0 gap-2">
                  <form action={`/api/admin/reports/${r.id}/resolve`} method="POST">
                    <button type="submit" className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-paper hover:opacity-90">
                      Resolve
                    </button>
                  </form>
                  <form action={`/api/admin/reports/${r.id}/dismiss`} method="POST">
                    <button type="submit" className="rounded-full border-[1.5px] border-[#D8C9AE] px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-chip">
                      Dismiss
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <EmptyState icon="🛡" title="No reports" hint="Flagged listings and members will appear here." />
      )}
    </Container>
  );
}
