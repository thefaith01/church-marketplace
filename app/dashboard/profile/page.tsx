import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { ProfileForm } from "@/components/ProfileForm";
import { redirect } from "next/navigation";

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/signup");

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <a href="/dashboard" className="text-sm font-semibold text-clay hover:underline">
        ← Back to dashboard
      </a>
      <h1 className="mt-3 font-display text-[32px] font-bold tracking-[-0.02em] text-ink">Your profile</h1>
      <p className="mt-1 text-sm text-muted">
        Your name and bio. Providers' bios appear on their public profile.
      </p>

      <div className="mt-6">
        <ProfileForm
          initial={{
            fullName: profile.fullName,
            bio: profile.bio ?? "",
            avatarUrl: profile.avatarUrl ?? "",
          }}
        />
      </div>
    </div>
  );
}
