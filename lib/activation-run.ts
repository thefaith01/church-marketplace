import { prisma } from "./prisma";
import { sendEmail } from "./email";
import {
  OPTOUT_TYPE,
  PENDING_MARKER_TYPE,
  SENT_TYPE_RE,
  STAGE_OFFSETS_DAYS,
  STAGE_PREFERENCE,
  classify,
  planNext,
  planPerson,
  sentType,
  waitingSinceForChurch,
  type Person,
  type SentRow,
  type Stage,
} from "./activation";
import { renderActivationEmail, type EmailContext } from "./activation-emails";
import { stopUrl } from "./activation-sign";

type Options = {
  now?: Date;
  baseUrl: string;
  /** Render only; nothing is sent and nothing is written. */
  dryRun?: boolean;
  /** Limit to one user (required for rendered output in dry runs). */
  userId?: string;
  /** Dry run only: render every step of the person's stage(s), ignoring timing. */
  all?: boolean;
};

const MAX_PROFILES = 2000;

/**
 * Database side of activation emails. Reads people and their history, hands
 * plain data to the pure logic in lib/activation.ts, then (unless dry run)
 * records a Notification row and sends the email.
 *
 * Records are Notification rows only, so there is no schema change:
 *   activation:<stage>:<step>   one per email sent (also shows in the in app bell)
 *   activation:optout           the person asked to stop
 *   activation:marker:pending   first time we saw a member waiting (stage B clock)
 */
export async function runActivation(opts: Options) {
  const now = opts.now ?? new Date();
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  const categories = (
    await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, take: 6, select: { name: true } })
  ).map((c) => c.name);

  const profiles = await prisma.userProfile.findMany({
    where: {
      role: { not: "ADMIN" },
      user: { isAdmin: false, ...(opts.userId ? { id: opts.userId } : {}) },
    },
    orderBy: { createdAt: "asc" },
    take: MAX_PROFILES,
    select: {
      fullName: true,
      role: true,
      isChurchLeader: true,
      verificationStatus: true,
      verifiedAt: true,
      churchId: true,
      churchReferenceName: true,
      church: {
        select: { name: true, joinCode: true, _count: { select: { invites: true, roster: true } } },
      },
      providerRequests: {
        where: { status: "APPROVED" },
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { updatedAt: true },
      },
      user: {
        select: {
          id: true,
          email: true,
          createdAt: true,
          churchLeaderRequests: {
            where: { status: "APPROVED" },
            orderBy: { updatedAt: "desc" },
            take: 1,
            select: { updatedAt: true },
          },
          notificationPreference: { select: { verificationEmail: true, requestsEmail: true } },
          _count: {
            select: {
              listings: { where: { status: "ACTIVE" } },
              conversationsAsOne: true,
              conversationsAsTwo: true,
              sentBookings: true,
              receivedBookings: true,
              serviceRequests: true,
            },
          },
        },
      },
    },
  });

  const ids = profiles.map((p) => p.user.id);
  const rows = ids.length
    ? await prisma.notification.findMany({
        where: { userId: { in: ids }, type: { startsWith: "activation:" } },
        select: { userId: true, type: true, createdAt: true },
      })
    : [];

  const sentBy = new Map<string, SentRow[]>();
  const optedOut = new Set<string>();
  const markerBy = new Map<string, Date>();
  for (const r of rows) {
    if (r.type === OPTOUT_TYPE) optedOut.add(r.userId);
    else if (r.type === PENDING_MARKER_TYPE) {
      const prev = markerBy.get(r.userId);
      if (!prev || r.createdAt > prev) markerBy.set(r.userId, r.createdAt);
    } else if (SENT_TYPE_RE.test(r.type)) {
      const list = sentBy.get(r.userId) ?? [];
      list.push({ type: r.type, createdAt: r.createdAt });
      sentBy.set(r.userId, list);
    }
  }

  // Stage B clock: record the first time each pending member is seen.
  const pendingMembers = profiles.filter((p) => p.verificationStatus === "PENDING" && !p.isChurchLeader);
  let markersCreated = 0;
  for (const p of pendingMembers) {
    if (markerBy.has(p.user.id)) continue;
    markerBy.set(p.user.id, now);
    if (!opts.dryRun) {
      await prisma.notification.create({
        data: {
          userId: p.user.id,
          type: PENDING_MARKER_TYPE,
          title: "Your church details are waiting for confirmation",
          linkUrl: "/dashboard",
          readAt: now,
        },
      });
      markersCreated++;
    }
  }

  // Per church: how many members are waiting and since when.
  const waiting = new Map<string, { total: number; markers: Date[] }>();
  let pendingWithoutLeaderRoute = 0;
  for (const p of pendingMembers) {
    if (!p.churchId) {
      pendingWithoutLeaderRoute++;
      continue;
    }
    const w = waiting.get(p.churchId) ?? { total: 0, markers: [] };
    w.total++;
    const m = markerBy.get(p.user.id);
    if (m) w.markers.push(m);
    waiting.set(p.churchId, w);
  }

  const people = profiles.map((p) => {
    const u = p.user;
    const w = p.isChurchLeader && p.churchId ? waiting.get(p.churchId) : undefined;
    const person: Person = {
      userId: u.id,
      firstName: p.fullName.trim().split(/\s+/)[0] || "",
      isAdmin: false,
      role: p.role,
      isChurchLeader: p.isChurchLeader,
      verificationStatus: p.verificationStatus,
      userCreatedAt: u.createdAt,
      verifiedAt: p.verifiedAt,
      churchId: p.churchId,
      churchName: p.church?.name ?? null,
      churchReferenceName: p.churchReferenceName,
      providerApprovedAt: p.providerRequests[0]?.updatedAt ?? null,
      leaderApprovedAt: u.churchLeaderRequests[0]?.updatedAt ?? null,
      activeListings: u._count.listings,
      conversations: u._count.conversationsAsOne + u._count.conversationsAsTwo,
      bookings: u._count.sentBookings + u._count.receivedBookings,
      serviceRequests: u._count.serviceRequests,
      churchInvites: p.church?._count.invites ?? 0,
      churchRoster: p.church?._count.roster ?? 0,
      churchJoinCode: p.church?.joinCode ?? null,
      waitingMembers: w?.total ?? 0,
      waitingSince: w ? waitingSinceForChurch(w.markers, now) : null,
    };
    return { person, email: u.email, prefs: u.notificationPreference };
  });

  const summary = {
    dryRun: !!opts.dryRun,
    considered: people.length,
    sent: 0,
    wouldSend: 0,
    failed: 0,
    sentByStage: {} as Record<string, number>,
    markersCreated,
    pendingWithoutLeaderRoute,
    candidatesByStage: {} as Record<string, number>,
  };
  const rendered: Array<Record<string, unknown>> = [];

  const contextFor = (person: Person, stage: Stage, step: number): EmailContext => ({
    stage,
    step,
    firstName: person.firstName,
    baseUrl: opts.baseUrl,
    stopUrl: stopUrl(opts.baseUrl, person.userId, secret),
    churchName: person.churchName,
    categories,
    waitingCount: person.waitingMembers,
    joinCode: person.churchJoinCode,
  });

  for (const { person, email, prefs } of people) {
    const sent = sentBy.get(person.userId) ?? [];
    for (const c of classify(person)) {
      summary.candidatesByStage[c.stage] = (summary.candidatesByStage[c.stage] ?? 0) + 1;
    }

    // Dry run for one person: show every step and why/when each stage would send.
    if (opts.dryRun && opts.userId) {
      const stages = classify(person).map((c) => {
        const pref = prefs ? prefs[STAGE_PREFERENCE[c.stage]] !== false : true;
        const decision = planNext({
          stage: c.stage,
          anchor: c.anchor,
          now,
          sent,
          optedOut: optedOut.has(person.userId),
          preferenceOn: pref,
        });
        const steps = opts.all
          ? STAGE_OFFSETS_DAYS[c.stage].map((_, i) => i + 1)
          : decision.action === "send"
            ? [decision.step]
            : [];
        return {
          stage: c.stage,
          anchor: c.anchor.toISOString(),
          decision,
          emails: steps.map((s) => {
            const r = renderActivationEmail(contextFor(person, c.stage, s));
            return { step: s, subject: r.subject, text: r.text };
          }),
        };
      });
      rendered.push({ userId: person.userId, stages });
      continue;
    }

    const plan = planPerson({
      person,
      now,
      sent,
      optedOut: optedOut.has(person.userId),
      preferences: prefs,
    });
    if (!plan || opts.dryRun) {
      if (plan && opts.dryRun) summary.wouldSend++;
      continue;
    }

    const email_ = renderActivationEmail(contextFor(person, plan.stage, plan.step));
    // Claim the slot first so an overlapping run cannot send the same step twice.
    const row = await prisma.notification.create({
      data: {
        userId: person.userId,
        type: sentType(plan.stage, plan.step),
        title: email_.title,
        linkUrl: email_.linkPath,
      },
      select: { id: true },
    });
    try {
      const unsub = stopUrl(opts.baseUrl, person.userId, secret);
      const res = await sendEmail({
        to: email,
        subject: email_.subject,
        html: email_.html,
        text: email_.text,
        headers: {
          "List-Unsubscribe": `<${unsub}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      if (res.skipped) {
        // No sender configured: do not count this as sent.
        await prisma.notification.delete({ where: { id: row.id } }).catch(() => {});
        continue;
      }
      summary.sent++;
      summary.sentByStage[plan.stage] = (summary.sentByStage[plan.stage] ?? 0) + 1;
    } catch (err) {
      console.error("[activation] send failed:", plan.stage, plan.step, err instanceof Error ? err.message : err);
      await prisma.notification.delete({ where: { id: row.id } }).catch(() => {});
      summary.failed++;
    }
  }

  return { summary, rendered };
}

/** Record that a person asked to stop activation emails (idempotent). */
export async function recordOptOut(userId: string) {
  const existing = await prisma.notification.findFirst({
    where: { userId, type: OPTOUT_TYPE },
    select: { id: true },
  });
  if (existing) return;
  await prisma.notification.create({
    data: {
      userId,
      type: OPTOUT_TYPE,
      title: "You stopped setup reminder emails",
      linkUrl: "/dashboard",
      readAt: new Date(),
    },
  });
}
