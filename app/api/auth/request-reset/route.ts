import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { isEmail } from "@/lib/validate";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Cap reset emails per connection; respond ok regardless to avoid enumeration.
  const rl = rateLimit(`reset:${clientIp(req)}`, 5, 15 * 60_000);
  if (!rl.ok) {
    return NextResponse.json({ ok: true });
  }

  const { email } = await req.json().catch(() => ({}));

  // Always respond the same way, whether or not the account exists.
  if (isEmail(email)) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: { tokenHash, userId: user.id, expiresAt },
      });

      const base =
        process.env.APP_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        new URL(req.url).origin;
      const link = `${base.replace(/\/$/, "")}/reset-password/${rawToken}`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your password",
          html: `
            <div style="font-family: system-ui, sans-serif; color:#2A2018; max-width:520px;">
              <h2 style="color:#C05A36;">Reset your password</h2>
              <p style="font-size:15px; line-height:1.55;">
                We received a request to reset your Church Member Marketplace password.
                This link expires in one hour. If you didn't request it, you can ignore this email.
              </p>
              <p style="margin-top:18px;">
                <a href="${link}" style="background:#C05A36;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600;">Set a new password</a>
              </p>
            </div>
          `,
        });
      } catch (err) {
        console.error("[request-reset] email failed:", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
