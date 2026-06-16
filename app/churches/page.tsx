import { prisma } from "@/lib/prisma";
import { Container, PageHeader, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ChurchesPage() {
  const churches = await prisma.church.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });

  return (
    <Container>
      <PageHeader
        eyebrow="Congregations"
        title="Churches on the marketplace"
        subtitle="Find your church and join your community."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {churches.map((c) => (
          <a
            key={c.id}
            href={`/churches/${c.id}`}
            className="rounded-[18px] border border-line bg-paper p-5 no-underline transition hover:shadow-md"
          >
            <h3 className="font-display font-bold text-ink">{c.name}</h3>
            {c.city && <p className="mt-0.5 text-sm text-muted">{c.city}</p>}
            {c.description && <p className="mt-2 line-clamp-2 text-sm text-faint">{c.description}</p>}
          </a>
        ))}
      </div>

      {churches.length === 0 && <EmptyState icon="⛪" title="No churches listed yet" />}
    </Container>
  );
}
