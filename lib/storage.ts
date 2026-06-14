/**
 * Uploads a verification document to Supabase Storage via its REST API.
 * No extra dependency required — uses fetch with the service role key.
 *
 * Required env vars to enable uploads:
 *   SUPABASE_URL                - e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY   - service role key (server-side only, keep secret)
 *   SUPABASE_STORAGE_BUCKET     - bucket name (defaults to "verification-docs")
 *
 * Create a Storage bucket named "verification-docs" in the Supabase dashboard.
 * Make it public if you want the returned URL to be directly viewable; otherwise
 * the stored path is still recorded and admins can generate signed URLs.
 *
 * Returns the stored file URL, or null if storage is not configured.
 */
export async function uploadVerificationDoc(
  file: File,
  userId: string
): Promise<string | null> {
  const baseUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "verification-docs";

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

  const res = await fetch(
    `${baseUrl}/storage/v1/object/${bucket}/${encodeURIComponent(path)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: bytes,
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase storage upload failed (${res.status}): ${detail}`);
  }

  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
