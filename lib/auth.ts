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
