import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { Container, PageHeader, Badge, EmptyState, ui } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function AdminChurchesPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const churches = await prisma.church.findMany({
    include: { _count: { select: { profiles: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container size="wide">
      <PageHeader title="Manage churches" subtitle="Create and manage the churches members can link to." />

      <div className="rounded-[18px] border border-line bg-paper p-5 shadow-sm">
        <h2 className="font-display font-bold text-ink">Add a church</h2>
        <form action="/api/admin/churches" method="POST" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input name="name" required placeholder="Church name" className={`${ui.input} mt-0`} />
          <input name="city" placeholder="City" className={`${ui.input} mt-0`} />
          <input name="region" placeholder="Region" className={`${ui.input} mt-0`} />
          <input name="contactInfo" placeholder="Contact (email or phone)" className={`${ui.input} mt-0`} />
          <div className="sm:col-span-2">
            <button type="submit" className={ui.btnPrimary}>Add church</button>
          </div>
        </form>
      </div>

      <div className="mt-6 space-y-3">
        {churches.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 rounded-[18px] border border-line bg-paper p-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-ink">{c.name}</h3>
                <Badge tone={c.status === "ACTIVE" ? "verified" : "neutral"}>{c.status}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-muted">
                {[c.city, c.region].filter(Boolean).join(", ") || "No location"} · {c._count.profiles} member
                {c._count.profiles !== 1 ? "s" : ""}
              </p>
            </div>
            <form action={`/api/admin/churches/${c.id}/toggle`} method="POST">
              <button type="submit" className="rounded-full border-[1.5px] border-[#D8C9AE] px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-chip">
                {c.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </button>
            </form>
          </div>
        ))}
      </div>

      {churches.length === 0 && <EmptyState icon="⛪" title="No churches yet." hint="Add the first one above." />}
    </Container>
  );
}
