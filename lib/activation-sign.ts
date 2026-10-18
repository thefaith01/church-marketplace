import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed "stop these emails" links. The signature is an HMAC of the user id,
 * keyed with JWT_SECRET, so a link cannot be forged or reused for someone else.
 */
export function signStop(userId: string, secret: string): string {
  return createHmac("sha256", secret).update(`activation-stop:${userId}`).digest("base64url");
}

export function verifyStop(userId: string, sig: string, secret: string): boolean {
  if (!userId || !sig || !secret) return false;
  const expected = Buffer.from(signStop(userId, secret));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function stopUrl(baseUrl: string, userId: string, secret: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}/api/activation/stop?u=${encodeURIComponent(userId)}&s=${signStop(userId, secret)}`;
}

/** Constant time check of "Bearer <secret>" against the expected secret. */
export function bearerMatches(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false;
  const given = Buffer.from(header);
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
