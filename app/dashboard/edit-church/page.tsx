import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { EditChurchForm } from "@/components/EditChurchForm";
import { redirect } from "next/navigation";

export default async function EditChurchPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) redirect("/signup");

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <a href="/dashboard" className="text-sm font-semibold text-clay hover:underline">
        ← Back to dashboard
      </a>
      <h1 className="mt-3 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">Church &amp; verification</h1>
      <p className="mt-1 text-sm text-muted">
        Keep your church details up to date so an admin can verify you.
      </p>

      <div className="mt-6">
        <EditChurchForm
          status={profile.verificationStatus}
          hasExistingDoc={Boolean(profile.churchReferenceLetter)}
          initial={{
            churchId: profile.churchId ?? "",
            churchReferenceName: profile.churchReferenceName ?? "",
            churchReferenceCity: profile.churchReferenceCity ?? "",
            churchReferencePerson: profile.churchReferencePerson ?? "",
          }}
        />
      </div>
    </div>
  );
}
