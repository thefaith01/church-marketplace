import { cookies } from "next/headers";
import { verifyJwt } from "./jwt";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const payload = await verifyJwt(token);
    return prisma.user.findUnique({ where: { id: payload.userId as string } });
  } catch {
    return null;
  }
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  return prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { church: true },
  });
}
