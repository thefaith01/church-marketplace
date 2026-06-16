import { prisma } from "./prisma";
import { sendPushToUser } from "./push";
import { sendEmail } from "./email";

/** Preference categories. Each maps to `${category}Email` / `${category}Push` columns. */
export type NotifyCategory = "messages" | "bookings" | "verification" | "requests";

type NotifyArgs = {
  userId: string;
  category: NotifyCategory;
  type: string;
  title: string;
  body?: string;
  url?: string;
  /** Optional email. If provided and the user allows email for this category, it is sent. */
  email?: { subject: string; html: string };
};

/**
 * Single entry point for user-facing notifications. Always records an in-app
 * notification, then sends a browser push and/or an email according to the
 * user's preferences (defaults to on when no preference row exists).
 */
export async function notify(args: NotifyArgs) {
  // 1. In-app notification (always recorded).
  try {
    await prisma.notification.create({
      data: {
        userId: args.userId,
        type: args.type,
        title: args.title,
        body: args.body ?? null,
        linkUrl: args.url ?? null,
      },
    });
  } catch (err) {
    console.error("[notify] in-app failed:", err);
  }

  // 2. Load preferences (absent = all channels on).
  const prefs = await prisma.notificationPreference
    .findUnique({ where: { userId: args.userId } })
    .catch(() => null);

  const pushOn = prefs ? (prefs as any)[`${args.category}Push`] !== false : true;
  const emailOn = prefs ? (prefs as any)[`${args.category}Email`] !== false : true;

  // 3. Push.
  if (pushOn) {
    await sendPushToUser(args.userId, {
      title: args.title,
      body: args.body,
      url: args.url,
    }).catch((err) => console.error("[notify] push failed:", err));
  }

  // 4. Email.
  if (emailOn && args.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: args.userId },
        select: { email: true },
      });
      if (user?.email) {
        await sendEmail({ to: user.email, subject: args.email.subject, html: args.email.html });
      }
    } catch (err) {
      console.error("[notify] email failed:", err);
    }
  }
}
