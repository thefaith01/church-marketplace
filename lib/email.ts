import { prisma } from "./prisma";

type SendArgs = { to: string | string[]; subject: string; html: string };

/**
 * Sends an email via the Resend REST API.
 * No-ops safely (returns { skipped: true }) when RESEND_API_KEY is not set,
 * so signup and other flows never break in an unconfigured environment.
 *
 * Required env vars to enable sending:
 *   RESEND_API_KEY   - your Resend API key
 *   EMAIL_FROM       - verified sender, e.g. "Church Marketplace <noreply@yourdomain.com>"
 *                      (falls back to Resend's onboarding@resend.dev sandbox sender)
 */
export async function sendEmail({ to, subject, html }: SendArgs) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping email:", subject);
    return { skipped: true as const };
  }

  const from =
    process.env.EMAIL_FROM || "Church Marketplace <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${detail}`);
  }

  return { skipped: false as const };
}

/**
 * Notifies platform admins that a new user has signed up and needs review.
 * Recipients are every user with isAdmin=true; if none exist, falls back to
 * the ADMIN_EMAIL env var.
 */
export async function notifyAdminsOfSignup(args: {
  fullName: string;
  email: string;
  role: string;
  churchReferenceName?: string | null;
  churchReferenceCity?: string | null;
}) {
  const admins = await prisma.user.findMany({
    where: { isAdmin: true },
    select: { email: true },
  });
  const recipients = admins.map((a) => a.email);
  if (recipients.length === 0 && process.env.ADMIN_EMAIL) {
    recipients.push(process.env.ADMIN_EMAIL);
  }
  if (recipients.length === 0) {
    console.warn("[email] No admin recipients found — skipping signup notice");
    return { skipped: true as const };
  }

  const church = args.churchReferenceName
    ? `${args.churchReferenceName}${
        args.churchReferenceCity ? `, ${args.churchReferenceCity}` : ""
      }`
    : "Not provided";

  const html = `
    <div style="font-family: system-ui, sans-serif; color: #1f2937;">
      <h2 style="color:#1d4ed8;">New member signup</h2>
      <p>A new user has registered and is awaiting verification.</p>
      <table style="border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding:4px 12px 4px 0; color:#6b7280;">Name</td><td>${args.fullName}</td></tr>
        <tr><td style="padding:4px 12px 4px 0; color:#6b7280;">Email</td><td>${args.email}</td></tr>
        <tr><td style="padding:4px 12px 4px 0; color:#6b7280;">Role</td><td>${args.role}</td></tr>
        <tr><td style="padding:4px 12px 4px 0; color:#6b7280;">Church</td><td>${church}</td></tr>
      </table>
      <p style="margin-top:16px;">Review and verify them in the admin panel under Manage Users.</p>
    </div>
  `;

  return sendEmail({
    to: recipients,
    subject: `New signup awaiting verification: ${args.fullName}`,
    html,
  });
}

/** Absolute link into the app, if APP_URL is configured; otherwise a relative path. */
function appLink(path: string) {
  const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  return base ? `${base.replace(/\/$/, "")}${path}` : path;
}

function shell(heading: string, body: string, cta?: { label: string; href: string }) {
  return `
    <div style="font-family: system-ui, sans-serif; color: #2A2018; max-width: 520px;">
      <h2 style="color:#C05A36;">${heading}</h2>
      <div style="font-size:15px; line-height:1.55; color:#3C3528;">${body}</div>
      ${
        cta
          ? `<p style="margin-top:20px;"><a href="${cta.href}" style="background:#C05A36;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600;">${cta.label}</a></p>`
          : ""
      }
    </div>
  `;
}

/** Tell the requester their booking was accepted or declined. */
export function notifyBookingResponse(args: {
  to: string;
  providerName: string;
  listingTitle: string;
  accepted: boolean;
}) {
  const verb = args.accepted ? "accepted" : "declined";
  return sendEmail({
    to: args.to,
    subject: `Your booking request was ${verb}`,
    html: shell(
      `Booking ${verb}`,
      `${args.providerName} has <strong>${verb}</strong> your booking request for "${args.listingTitle}".`,
      { label: "View booking", href: appLink("/manage") }
    ),
  });
}

/** Tell a provider they have a new booking request. */
export function notifyNewBooking(args: {
  to: string;
  requesterName: string;
  listingTitle: string;
}) {
  return sendEmail({
    to: args.to,
    subject: `New booking request: ${args.listingTitle}`,
    html: shell(
      "New booking request",
      `${args.requesterName} has requested your service "${args.listingTitle}". Respond from your bookings.`,
      { label: "View request", href: appLink("/manage") }
    ),
  });
}

/** Tell a user they have a new message. */
export function notifyNewMessage(args: {
  to: string;
  senderName: string;
  conversationId: string;
}) {
  return sendEmail({
    to: args.to,
    subject: `New message from ${args.senderName}`,
    html: shell(
      "You have a new message",
      `${args.senderName} sent you a message on the marketplace.`,
      { label: "Open conversation", href: appLink(`/messages/${args.conversationId}`) }
    ),
  });
}

/** Tell a member their account has been verified. */
export function notifyVerified(args: { to: string; fullName: string }) {
  return sendEmail({
    to: args.to,
    subject: "You're verified — the marketplace is unlocked",
    html: shell(
      "You're verified",
      `Hi ${args.fullName.split(" ")[0]}, an admin has confirmed your church connection. You can now browse services, message providers, and make bookings.`,
      { label: "Go to dashboard", href: appLink("/dashboard") }
    ),
  });
}

/** Tell a provider that a new service request matches a category they offer. */
export function notifyServiceRequestMatch(args: {
  to: string;
  requestTitle: string;
  requestId: string;
}) {
  return sendEmail({
    to: args.to,
    subject: "A new request matches your service",
    html: shell(
      "A request matches what you offer",
      `A member posted "${args.requestTitle}" in a category you provide. Respond if you can help.`,
      { label: "View request", href: appLink(`/requests/${args.requestId}`) }
    ),
  });
}
