import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/login");

  const users = await prisma.userProfile.findMany({
    include: { user: true, church: true },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = users.filter(
    (u) => u.verificationStatus === "PENDING"
  ).length;
  const verifiedCount = users.filter(
    (u) => u.verificationStatus === "VERIFIED"
  ).length;
  const unverifiedCount = users.filter(
    (u) => u.verificationStatus === "UNVERIFIED"
  ).length;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <p className="text-gray-500 text-sm mt-1">
            Verify church members and manage access
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border p-4">
          <p className="text-gray-500 text-sm">Unverified</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{unverifiedCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{pendingCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-gray-500 text-sm">Verified</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{verifiedCount}</p>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-left font-semibold">Church</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((profile) => (
              <tr key={profile.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{profile.fullName}</td>
                <td className="px-6 py-3 text-gray-600">{profile.user.email}</td>
                <td className="px-6 py-3">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                    {profile.role}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {profile.church?.name || "Not linked"}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium
                    ${
                      profile.verificationStatus === "VERIFIED"
                        ? "bg-green-100 text-green-700"
                        : profile.verificationStatus === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {profile.verificationStatus}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    {profile.verificationStatus !== "VERIFIED" && (
                      <form action={`/admin/users/${profile.id}/verify`} method="POST">
                        <button
                          type="submit"
                          className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Verify
                        </button>
                      </form>
                    )}
                    {profile.verificationStatus === "VERIFIED" && (
                      <form action={`/admin/users/${profile.id}/reject`} method="POST">
                        <button
                          type="submit"
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="mt-12 text-center text-gray-400">
          <p className="text-4xl">👥</p>
          <p className="mt-2">No users found.</p>
        </div>
      )}
    </div>
  );
}
