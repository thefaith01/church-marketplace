import { SignJWT, jwtVerify } from "jose";

const PLACEHOLDER = "cmm-secret-key-2024-change-this";

/**
 * Resolves the signing secret from the environment, lazily so a misconfigured
 * deploy fails on use (with a clear message) rather than silently signing tokens
 * with a weak or empty key.
 */
function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) {
    throw new Error("JWT_SECRET is not set. Set a strong random secret (32+ chars).");
  }
  if (s === PLACEHOLDER || s.length < 32) {
    console.warn(
      "[jwt] JWT_SECRET is weak or still the placeholder. Rotate it to a strong 32+ character random value."
    );
  }
  return new TextEncoder().encode(s);
}

export async function signJwt(payload: object) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}
