/**
 * Lightweight in-memory rate limiter (fixed window per key).
 *
 * Note: serverless instances each keep their own counters, so this is a
 * best-effort first layer that slows bursts on a warm instance. For strict,
 * cross-instance limits use a shared store (e.g. Upstash Redis) later.
 */

type Hit = { count: number; resetAt: number };

const store = new Map<string, Hit>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow without bound.
  if (store.size > 5000) {
    for (const [k, v] of store) if (now > v.resetAt) store.delete(k);
  }

  const cur = store.get(key);
  if (!cur || now > cur.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  cur.count++;
  if (cur.count > limit) {
    return { ok: false, retryAfter: Math.ceil((cur.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
