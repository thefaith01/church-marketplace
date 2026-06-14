import { prisma } from "./prisma";

/**
 * Find an existing conversation between two users, or create one.
 * Order of participants does not matter.
 */
export async function findOrCreateConversation(
  userIdA: string,
  userIdB: string
) {
  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participantOneId: userIdA, participantTwoId: userIdB },
        { participantOneId: userIdB, participantTwoId: userIdA },
      ],
    },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      participantOneId: userIdA,
      participantTwoId: userIdB,
    },
  });
}
