import { NextRequest, NextResponse } from "next/server";
import { bearerMatches } from "@/lib/activation-sign";
import { runActivation } from "@/lib/activation-run";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Activation emails ("started but not finished" nudges).
 *
 * Authorised only by `Authorization: Bearer <CRON_SECRET>`, which is what
 * Vercel's own cron sends. Called daily by Vercel (vercel.json) and hourly by
 * the CEO's scheduler. Safe to call often: spacing, quiet hours and caps live
 * in lib/activation.ts.
 *
 *   ?dryRun=1                    counts only, sends nothing, writes nothing
 *   ?dryRun=1&userId=<id>        rendered emails for that person, sends nothing
 *   ?dryRun=1&userId=<id>&all=1  every step of their stage, ignoring timing
 */
async function handle(req: NextRequest) {
  if (!bearerMatches(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "1";
  const userId = url.searchParams.get("userId") || undefined;
  const all = url.searchParams.get("all") === "1";
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || url.origin;

  try {
    const { summary, rendered } = await runActivation({ baseUrl, dryRun, userId, all });
    return NextResponse.json({ ok: true, summary, ...(dryRun && userId ? { rendered } : {}) });
  } catch (err) {
    console.error("[activation] run failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "Run failed" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
