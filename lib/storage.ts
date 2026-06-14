/**
 * Verification document storage in Supabase Storage (private bucket) via REST.
 * No extra dependency required — uses fetch with the service role key.
 *
 * Required env vars to enable uploads:
 *   SUPABASE_URL                - e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY   - service role key (server-side only, keep secret)
 *   SUPABASE_STORAGE_BUCKET     - bucket name (defaults to "verification-docs")
 *
 * Create a PRIVATE Storage bucket named "verification-docs" in Supabase. We store
 * only the object path on the profile; admins view it through a short-lived signed
 * URL (see signVerificationDocUrl), so reference letters are never publicly readable.
 */

const BUCKET = () => process.env.SUPABASE_STORAGE_BUCKET || "verification-docs";

/**
 * Uploads a verification document and returns its object PATH (e.g.
 * "userId/timestamp.pdf"), or null if storage is not configured.
 */
export async function uploadVerificationDoc(
  file: File,
  userId: string
): Promise<string | null> {
  const baseUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !key) {
    console.warn(
      "[storage] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipping upload"
    );
    return null;
  }

  const safeExt = (file.name.split(".").pop() || "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${Date.now()}.${safeExt}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const res = await fetch(`${baseUrl}/storage/v1/object/${BUCKET()}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: bytes,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase storage upload failed (${res.status}): ${detail}`);
  }

  return path;
}

/**
 * Returns a short-lived signed URL for a stored object path, for admin viewing.
 * Returns null if storage is not configured or the object can't be signed.
 */
export async function signVerificationDocUrl(
  path: string
): Promise<string | null> {
  const baseUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !key || !path) return null;

  const res = await fetch(
    `${baseUrl}/storage/v1/object/sign/${BUCKET()}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 120 }),
    }
  );

  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data?.signedURL) return null;
  return `${baseUrl}/storage/v1${data.signedURL}`;
}
