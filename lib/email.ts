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
