import { VerificationStatus, Role } from "@prisma/client";

// How long a verification stays valid before it must be re-confirmed.
export const VERIFICATION_DAYS = { PROVIDER: 365, OTHER: 730 };

export function verificationExpiresAt(profile: {
  verifiedAt?: Date | string | null;
  role?: Role | string;
}): Date | null {
  if (!profile.verifiedAt) return null;
  const days = profile.role === Role.PROVIDER ? VERIFICATION_DAYS.PROVIDER : VERIFICATION_DAYS.OTHER;
  return new Date(new Date(profile.verifiedAt).getTime() + days * 24 * 60 * 60 * 1000);
}

export function isVerified(profile: {
  verificationStatus: VerificationStatus;
  verifiedAt?: Date | string | null;
  role?: Role | string;
}) {
  if (profile.verificationStatus !== VerificationStatus.VERIFIED) return false;
  const expiresAt = verificationExpiresAt(profile);
  // Grandfather profiles verified before expiry tracking (no verifiedAt yet).
  if (!expiresAt) return true;
  return Date.now() < expiresAt.getTime();
}

export function canBrowseMarketplace(profile: any) {
  return isVerified(profile);
}

export function canMessage(profile: any) {
  return isVerified(profile);
}

export function canBook(profile: any) {
  return isVerified(profile);
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
