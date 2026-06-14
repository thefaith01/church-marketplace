import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canBrowseMarketplace, isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { ListingCard } from "@/components/ListingCard";
import { Container, PageHeader, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile || (!canBrowseMarketplace(profile) && !isAdmin(user))) {
    return <VerificationGate title="Verification Required" />;
  }

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { listing: { include: { provider: { include: { profile: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container size="wide">
      <PageHeader title="Saved listings" subtitle="Listings you've saved for later." />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {favs.map((f) => (
          <ListingCard key={f.id} listing={f.listing} saved={true} />
        ))}
      </div>

      {favs.length === 0 && (
        <EmptyState icon="♥" title="No saved listings yet" hint="Tap the heart on a listing to save it here." />
      )}
    </Container>
  );
}
