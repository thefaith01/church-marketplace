import { VerificationStatus, Role } from "@prisma/client";

export function isVerified(profile: { verificationStatus: VerificationStatus }) {
  return profile.verificationStatus === VerificationStatus.VERIFIED;
}

export function canBrowseMarketplace(profile: any) {
  return isVerified(profile);
}

export function canMessage(profile: any) {
  return isVerified(profile);
}

export function canBook(profile: any) {
  return isVerified(profile) && profile.role !== Role.ADMIN;
}

export function isAdmin(user: { isAdmin: boolean }) {
  return user.isAdmin === true;
}

/**
 * A church leader (elder) may verify or reject members linked to their own
 * church, and no one else.
 */
export function canLeaderModerate(
  actor: { isChurchLeader?: boolean; churchId?: string | null },
  target: { churchId?: string | null }
) {
  return (
    actor.isChurchLeader === true &&
    !!actor.churchId &&
    actor.churchId === target.churchId
  );
}
