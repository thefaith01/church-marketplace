import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyStop } from "@/lib/activation-sign";
import { recordOptOut } from "@/lib/activation-run";
import { escapeHtml } from "@/lib/activation-emails";

export const dynamic = "force-dynamic";

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title></head>
<body style="font-family: system-ui, sans-serif; color:#2A2018; background:#FBF6EC; margin:0;">
<div style="max-width:480px; margin:48px auto; padding:0 20px;">
<h1 style="color:#C05A36; font-size:24px;">${escapeHtml(title)}</h1>
${body}
</div></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

function validate(req: NextRequest) {
  const url = new URL(req.url);
  const u = url.searchParams.get("u") || "";
  const s = url.searchParams.get("s") || "";
  const secret = process.env.JWT_SECRET || "";
  return verifyStop(u, s, secret) ? { u, s } : null;
}

/** GET only asks for confirmation, so a link scanner cannot stop anyone's emails by accident. */
export async function GET(req: NextRequest) {
  const v = validate(req);
  if (!v) return page("This link is not valid", "<p>The link may be incomplete. You can also manage emails from your account settings.</p>", 400);
  return page(
    "Stop these emails?",
    `<p style="line-height:1.55;">We will stop sending you setup reminders from Church Member Marketplace. Emails about your bookings, messages and account will carry on.</p>
<form method="POST" action="/api/activation/stop?u=${encodeURIComponent(v.u)}&s=${encodeURIComponent(v.s)}">
<button type="submit" style="background:#C05A36;color:#fff;border:0;padding:10px 18px;border-radius:999px;font-weight:600;font-size:15px;cursor:pointer;">Stop these emails</button>
</form>`
  );
}

/** POST stops them. Mail apps that offer one tap unsubscribe also POST here. */
export async function POST(req: NextRequest) {
  const v = validate(req);
  if (!v) return page("This link is not valid", "<p>The link may be incomplete.</p>", 400);
  const exists = await prisma.user.findUnique({ where: { id: v.u }, select: { id: true } });
  if (!exists) return page("This link is not valid", "<p>We could not find that account.</p>", 400);
  await recordOptOut(v.u);
  return page("Done, no more reminders", "<p style=\"line-height:1.55;\">We will not send you any more setup reminders. Emails about your bookings, messages and account will carry on.</p>");
}
