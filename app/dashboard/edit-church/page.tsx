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
    <div className="mx-auto max-w-xl p-6">
      <a href="/dashboard" className="text-sm text-blue-700 hover:underline">
        ← Back to dashboard
      </a>
      <h1 className="mt-3 text-2xl font-bold">Church & verification</h1>
      <p className="text-gray-500 text-sm mt-1">
        Keep your church details up to date so an admin can verify you.
      </p>

      <div className="mt-6">
        <EditChurchForm
          status={profile.verificationStatus}
          hasExistingDoc={Boolean(profile.churchReferenceLetter)}
          initial={{
            churchReferenceName: profile.churchReferenceName ?? "",
            churchReferenceCity: profile.churchReferenceCity ?? "",
            churchReferencePerson: profile.churchReferencePerson ?? "",
          }}
        />
      </div>
    </div>
  );
}
