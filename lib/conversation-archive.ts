// Per user archive helpers. Archiving is stored on the conversation, one
// nullable timestamp per participant, so it hides the chat for that person only.

type Sides = { participantOneId: string; participantTwoId: string };
type ArchiveFields = { archivedByOneAt: Date | null; archivedByTwoAt: Date | null };

export function isArchivedFor(c: Sides & ArchiveFields, userId: string): boolean {
  if (c.participantOneId === userId) return c.archivedByOneAt !== null;
  if (c.participantTwoId === userId) return c.archivedByTwoAt !== null;
  return false;
}

/** Prisma where clause for a user's active (archived = false) or archived chats. */
export function archiveFilter(userId: string, archived: boolean) {
  return {
    OR: [
      { participantOneId: userId, archivedByOneAt: archived ? { not: null } : null },
      { participantTwoId: userId, archivedByTwoAt: archived ? { not: null } : null },
    ],
  };
}

/** Data to set or clear the archive flag for one participant. */
export function archiveData(c: Sides, userId: string, archived: boolean) {
  const value = archived ? new Date() : null;
  return c.participantOneId === userId ? { archivedByOneAt: value } : { archivedByTwoAt: value };
}

/** A new message brings the chat back into both people's active lists. */
export const RESURFACE_DATA = { archivedByOneAt: null, archivedByTwoAt: null } as const;
