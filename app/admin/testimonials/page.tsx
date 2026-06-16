import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { Container, PageHeader, Card, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function AdminTestimonialsPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const items = await prisma.testimonial.findMany({
    where: { status: "PENDING" },
    include: {
      author: { include: { profile: true } },
      provider: { include: { profile: true } },
      booking: { include: { listing: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container>
      <PageHeader title="Testimonials" subtitle="Review member testimonials before they appear publicly." />

      <div className="space-y-4">
        {items.map((t) => (
          <Card key={t.id}>
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="font-semibold text-ink">
                {t.author.profile?.fullName || t.author.email}
              </span>
              <span className="text-faint">
                on {t.booking.listing.title} · for {t.provider.profile?.fullName || t.provider.email}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-chip/60 p-3 text-sm text-ink">
              {t.content}
            </p>
            <div className="mt-3 flex gap-2 border-t border-[#EFE7D6] pt-3">
              <form action={`/admin/testimonials/${t.id}/approve`} method="POST">
                <button type="submit" className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper hover:opacity-90">
                  Approve
                </button>
              </form>
              <form action={`/admin/testimonials/${t.id}/reject`} method="POST">
                <button type="submit" className="rounded-full border-[1.5px] border-[#E2C3B6] px-4 py-2 text-sm font-semibold text-clay-dark hover:bg-[#F3E1D9]">
                  Reject
                </button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && <EmptyState icon="💬" title="No testimonials to review" hint="Approved testimonials show on provider profiles." />}
    </Container>
  );
}
