import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { Container, PageHeader, Badge, EmptyState } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const users = await prisma.userProfile.findMany({
    include: { user: true, church: true },
    orderBy: { createdAt: "desc" },
  });

  const count = (s: string) => users.filter((u) => u.verificationStatus === s).length;
  const stats = [
    ["Unverified", count("UNVERIFIED")],
    ["Pending", count("PENDING")],
    ["Verified", count("VERIFIED")],
  ] as const;

  return (
    <Container size="wide">
      <PageHeader title="Manage users" subtitle="Verify church members and manage access." />

      <div className="mb-6 grid grid-cols-3 gap-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-[18px] border border-line bg-paper p-4 shadow-sm">
            <p className="text-sm text-faint">{label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-chip/50">
            <tr>
              {["Name", "Email", "Role", "Church", "Status", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-semibold text-[#5A4F40]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((profile) => (
              <tr key={profile.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3 font-medium text-ink">{profile.fullName}</td>
                <td className="px-5 py-3 text-muted">{profile.user.email}</td>
                <td className="px-5 py-3"><Badge>{profile.role}</Badge></td>
                <td className="px-5 py-3 text-muted">{profile.church?.name || "Not linked"}</td>
                <td className="px-5 py-3">
                  <Badge tone={profile.verificationStatus === "VERIFIED" ? "verified" : profile.verificationStatus === "PENDING" ? "pending" : "neutral"}>
                    {profile.verificationStatus}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    {profile.verificationStatus !== "VERIFIED" && (
                      <form action={`/admin/users/${profile.id}/verify`} method="POST">
                        <button type="submit" className="rounded-full bg-forest px-3 py-1 text-xs font-semibold text-paper hover:opacity-90">Verify</button>
                      </form>
                    )}
                    {profile.verificationStatus === "VERIFIED" && (
                      <form action={`/admin/users/${profile.id}/reject`} method="POST">
                        <button type="submit" className="rounded-full border-[1.5px] border-[#E2C3B6] px-3 py-1 text-xs font-semibold text-clay-dark hover:bg-[#F3E1D9]">Reject</button>
                      </form>
                    )}
                    {profile.churchReferenceLetter && (
                      <a
                        href={`/api/admin/verification-doc?profileId=${profile.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-ink hover:bg-chip"
                      >
                        Doc
                      </a>
                    )}
                    <form action={`/api/admin/users/${profile.id}/toggle-leader`} method="POST">
                      <button
                        type="submit"
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          profile.isChurchLeader
                            ? "border-forest text-forest"
                            : "border-line text-ink hover:bg-chip"
                        }`}
                      >
                        {profile.isChurchLeader ? "Leader ✓" : "Make leader"}
                      </button>
                    </form>
                    <form action={`/api/admin/users/${profile.id}/toggle-check`} method="POST">
                      <button
                        type="submit"
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          profile.backgroundCheckCleared
                            ? "border-forest text-forest"
                            : "border-line text-ink hover:bg-chip"
                        }`}
                      >
                        {profile.backgroundCheckCleared ? "Checked ✓" : "Mark checked"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && <EmptyState icon="👥" title="No users found." />}
    </Container>
  );
}
