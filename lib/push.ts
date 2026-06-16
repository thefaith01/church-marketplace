import webpush from "web-push";
import { prisma } from "./prisma";

/**
 * Web push via VAPID. No-ops safely when VAPID keys are not configured.
 *
 * Required env vars to enable push:
 *   VAPID_PUBLIC_KEY              - VAPID public key
 *   VAPID_PRIVATE_KEY            - VAPID private key (keep secret)
 *   VAPID_SUBJECT                - mailto: or https: contact (optional)
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY - same public key, exposed to the browser
 *
 * Generate a key pair once with:  npx web-push generate-vapid-keys
 */

let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@cmmarketplace.org";
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body?: string; url?: string };

/** Sends a push to every device the user has subscribed. Prunes dead subscriptions. */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!ensureConfigured()) return;
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return;

  const data = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          data
        );
      } catch (err: any) {
        const code = err?.statusCode;
        if (code === 404 || code === 410) {
          // Subscription expired or was revoked — remove it.
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        } else {
          console.error("[push] send failed:", code || err);
        }
      }
    })
  );
}
