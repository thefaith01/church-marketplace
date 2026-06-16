import crypto from "crypto";

/** Long, unguessable token for single-use email invites. */
export function inviteToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

/** Shorter shareable code for a church's public join link. */
export function joinCode(): string {
  return crypto.randomBytes(6).toString("hex");
}
