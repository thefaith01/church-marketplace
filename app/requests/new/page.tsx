import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { canBrowseMarketplace, isAdmin } from "@/lib/auth";
import { VerificationGate } from "@/components/VerificationGate";
import { RequestForm } from "@/components/RequestForm";
import { redirect } from "next/navigation";

export default async function NewRequestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile || (!canBrowseMarketplace(profile) && !isAdmin(user))) {
    return <VerificationGate title="Verification Required" />;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <a href="/requests" className="text-sm font-semibold text-clay hover:underline">
        ← Back to requests
      </a>
      <h1 className="mt-3 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">
        Post a service request
      </h1>
      <p className="mt-1 text-sm text-muted">
        Describe what you need. Providers can respond with a message.
      </p>
      <div className="mt-6">
        <RequestForm />
      </div>
    </div>
  );
}
