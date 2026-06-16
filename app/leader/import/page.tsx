import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Container, PageHeader, Card } from "@/components/ui";
import CsvImportForm from "@/components/CsvImportForm";

export default async function LeaderImportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const me = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!me?.isChurchLeader || !me.churchId) redirect("/dashboard");

  return (
    <Container size="narrow">
      <PageHeader
        eyebrow="Church leader"
        title="Import members"
        subtitle="Bring in your congregation list to invite or pre-approve them."
      />
      <Card>
        <CsvImportForm />
      </Card>
      <p className="mt-4 text-sm text-muted">
        Invites and roster matches link people to your church, but they still appear under your
        members for you to confirm before the marketplace unlocks for them.
      </p>
    </Container>
  );
}
