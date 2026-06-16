import { prisma } from "@/lib/prisma";
import { Container, PageHeader, EmptyState } from "@/components/ui";
import { ListingCard } from "@/components/ListingCard";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChurchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const church = await prisma.church.findUnique({ where: { id } });
  if (!church || church.status !== "ACTIVE") notFound();

  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE", provider: { profile: { churchId: id } } },
    include: { provider: { include: { profile: true } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 24,
  });

  const joinHref = church.joinCode ? `/join/${church.joinCode}` : "/signup";

  return (
    <Container size="wide">
      <PageHeader eyebrow="Congregation" title={church.name} subtitle={church.city || undefined} />

      {church.description && (
        <p className="-mt-4 mb-6 max-w-2xl text-[15px] text-muted">{church.description}</p>
      )}

      <div className="mb-8">
        <a
          href={joinHref}
          className="inline-block rounded-full bg-clay px-6 py-3 font-semibold text-paper no-underline hover:bg-clay-dark"
        >
          Join / get verified with {church.name}
        </a>
      </div>

      <h2 className="font-display text-lg font-bold text-ink">Services from this church</h2>
      <p className="mt-0.5 text-sm text-muted">Sign in as a verified member to message or book.</p>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>

      {listings.length === 0 && (
        <EmptyState
          icon="📋"
          title="No public listings yet"
          hint="Providers from this church will appear here."
        />
      )}
    </Container>
  );
}
