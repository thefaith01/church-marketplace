import { prisma } from "./prisma";

/** Records an admin/leader action. Never throws; logging must not break the action. */
export async function logAudit(actorId: string, action: string, detail?: string | null) {
  try {
    await prisma.auditLog.create({
      data: { actorId, action, detail: detail ?? null },
    });
  } catch (err) {
    console.error("[audit] failed:", err);
  }
}
