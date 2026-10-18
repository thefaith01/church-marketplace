/**
 * Activation emails: the pure "who is due what" logic.
 *
 * Nothing in this file touches the database, the network or the clock. The
 * caller passes in plain data and `now`, so every rule can be unit tested.
 * See lib/activation-run.ts for the database side and
 * lib/activation-emails.ts for the words.
 */

export type Stage = "A" | "B" | "C" | "D" | "E";

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

/** Days after the stage clock starts at which each step becomes due. */
export const STAGE_OFFSETS_DAYS: Record<Stage, number[]> = {
  A: [1, 3, 7, 21], // signed up, not yet linked to a church
  B: [0, 2, 5], // leader: members waiting (clock starts when someone has waited 2 days)
  C: [3, 10], // verified member, nothing started (clock = verifiedAt)
  D: [1, 4, 10], // verified provider, no active listing
  E: [1, 4, 10], // approved leader, no invites and no roster
};

/** Which NotificationPreference toggle governs each stage. */
export const STAGE_PREFERENCE: Record<Stage, "verificationEmail" | "requestsEmail"> = {
  A: "verificationEmail",
  B: "verificationEmail",
  C: "requestsEmail",
  D: "requestsEmail",
  E: "verificationEmail",
};

export const MIN_GAP_MS = 20 * HOUR;
export const LIFETIME_CAP = 10;
/** A step that became due longer ago than this is not sent (stops a backlog blast for old accounts). */
export const STALE_AFTER_MS = 7 * DAY;
/** Members must be pending this long before their leader is emailed (stage B). */
export const PENDING_GRACE_MS = 2 * DAY;
export const SEND_FROM_HOUR = 8;
export const SEND_UNTIL_HOUR = 20;
export const SEND_TIMEZONE = "Europe/London";

export const SENT_TYPE_RE = /^activation:([A-E]):(\d+)$/;
export const OPTOUT_TYPE = "activation:optout";
export const PENDING_MARKER_TYPE = "activation:marker:pending";

export function sentType(stage: Stage, step: number) {
  return `activation:${stage}:${step}`;
}

export type SentRow = { type: string; createdAt: Date };

export function parseSentType(type: string): { stage: Stage; step: number } | null {
  const m = SENT_TYPE_RE.exec(type);
  return m ? { stage: m[1] as Stage, step: Number(m[2]) } : null;
}

/** Hour of day (0 to 23) in UK local time, so BST and GMT are both right. */
export function londonHour(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SEND_TIMEZONE,
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const h = parts.find((p) => p.type === "hour")?.value ?? "0";
  return Number(h) % 24;
}

export function inSendWindow(now: Date): boolean {
  const h = londonHour(now);
  return h >= SEND_FROM_HOUR && h < SEND_UNTIL_HOUR;
}

export type PlanInput = {
  stage: Stage;
  /** When this stage began for this person. */
  anchor: Date;
  now: Date;
  /** Every activation row for this person (sent emails only; markers are ignored). */
  sent: SentRow[];
  optedOut: boolean;
  /** False when the person switched off the related email toggle. */
  preferenceOn: boolean;
};

export type PlanResult =
  | { action: "send"; step: number; skippedSteps: number[] }
  | { action: "none"; reason: string };

/**
 * Decide whether to send this stage's next email now.
 *
 * Only the latest due, unsent step is sent. Earlier unsent steps are skipped
 * implicitly: a step can only be sent if its number is higher than the highest
 * step already sent since this stage began, so a missed run never replays old
 * steps. Deferrals for quiet hours or spacing write nothing and retry next run.
 */
export function planNext(input: PlanInput): PlanResult {
  const { stage, anchor, now, sent, optedOut, preferenceOn } = input;
  if (optedOut) return { action: "none", reason: "opted out" };
  if (!preferenceOn) return { action: "none", reason: "email preference off" };

  const sends = sent
    .map((r) => ({ ...parseSentType(r.type), createdAt: r.createdAt }))
    .filter((r): r is { stage: Stage; step: number; createdAt: Date } => !!r.stage);

  if (sends.length >= LIFETIME_CAP) return { action: "none", reason: "lifetime cap reached" };

  const offsets = STAGE_OFFSETS_DAYS[stage];
  // Only sends since this stage began count towards its progress.
  const sinceAnchor = sends.filter((r) => r.stage === stage && r.createdAt.getTime() >= anchor.getTime());
  const highest = sinceAnchor.reduce((m, r) => Math.max(m, r.step), 0);

  let latestDue = 0;
  for (let i = 0; i < offsets.length; i++) {
    if (anchor.getTime() + offsets[i] * DAY <= now.getTime()) latestDue = i + 1;
  }
  if (latestDue === 0) return { action: "none", reason: "not due yet" };
  if (latestDue <= highest) {
    return { action: "none", reason: highest >= offsets.length ? "sequence finished" : "next step not due yet" };
  }

  const dueAt = anchor.getTime() + offsets[latestDue - 1] * DAY;
  if (now.getTime() - dueAt > STALE_AFTER_MS) return { action: "none", reason: "step too old to send" };

  const lastSend = sends.reduce((m, r) => Math.max(m, r.createdAt.getTime()), 0);
  if (lastSend && now.getTime() - lastSend < MIN_GAP_MS) return { action: "none", reason: "spacing" };

  if (!inSendWindow(now)) return { action: "none", reason: "outside 08:00 to 20:00 UK time" };

  const skippedSteps: number[] = [];
  for (let s = highest + 1; s < latestDue; s++) skippedSteps.push(s);
  return { action: "send", step: latestDue, skippedSteps };
}

/* ------------------------------------------------------------------ */
/* Who is in which stage                                               */
/* ------------------------------------------------------------------ */

export type Person = {
  userId: string;
  firstName: string;
  isAdmin: boolean;
  role: "MEMBER" | "PROVIDER" | "ADMIN";
  isChurchLeader: boolean;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
  userCreatedAt: Date;
  verifiedAt: Date | null;
  churchId: string | null;
  churchName: string | null;
  churchReferenceName: string | null;
  /** Approved provider request time, if any. */
  providerApprovedAt: Date | null;
  /** Approved church leader request time, if any. */
  leaderApprovedAt: Date | null;
  activeListings: number;
  conversations: number;
  bookings: number;
  serviceRequests: number;
  /** For leaders: their church's counts. */
  churchInvites: number;
  churchRoster: number;
  churchJoinCode: string | null;
  /** For leaders: members of their church in PENDING, and when the first of them crossed the grace period. */
  waitingMembers: number;
  waitingSince: Date | null;
};

export type Candidate = { stage: Stage; anchor: Date };

/**
 * The stages this person could be in right now, in priority order. An empty
 * list means every stage is complete or does not apply, which is what stops a
 * sequence the moment the person does the thing.
 */
export function classify(p: Person): Candidate[] {
  if (p.isAdmin || p.role === "ADMIN") return [];
  const out: Candidate[] = [];

  if (p.isChurchLeader) {
    // Stage B: members are waiting for this leader.
    if (p.waitingMembers > 0 && p.waitingSince) out.push({ stage: "B", anchor: p.waitingSince });
    // Stage E: approved leader, nothing started.
    if (p.churchId && p.churchInvites === 0 && p.churchRoster === 0) {
      out.push({ stage: "E", anchor: p.leaderApprovedAt ?? p.userCreatedAt });
    }
    return out;
  }

  if (p.verificationStatus === "UNVERIFIED") {
    // Stage A: no church linked and no reference given.
    if (!p.churchId && !p.churchReferenceName) out.push({ stage: "A", anchor: p.userCreatedAt });
    return out;
  }

  if (p.verificationStatus === "VERIFIED") {
    const verifiedAt = p.verifiedAt ?? p.userCreatedAt;
    if (p.role === "PROVIDER") {
      // Stage D: verified provider with no active listing.
      if (p.activeListings === 0) out.push({ stage: "D", anchor: p.providerApprovedAt ?? verifiedAt });
    } else if (p.conversations === 0 && p.bookings === 0 && p.serviceRequests === 0) {
      // Stage C: verified member who has not started anything.
      out.push({ stage: "C", anchor: verifiedAt });
    }
  }
  // PENDING members are the leader's job (stage B) and the admin queue's.
  return out;
}

/** Across a church's pending members: when the earliest one crossed the grace period. */
export function waitingSinceForChurch(markers: Date[], now: Date): Date | null {
  const crossed = markers
    .map((m) => new Date(m.getTime() + PENDING_GRACE_MS))
    .filter((d) => d.getTime() <= now.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  return crossed[0] ?? null;
}

/**
 * Plan one person for one run: the first stage, in priority order, that has a
 * step to send. Returns null when nothing is to be sent.
 */
export function planPerson(args: {
  person: Person;
  now: Date;
  sent: SentRow[];
  optedOut: boolean;
  preferences: { verificationEmail: boolean; requestsEmail: boolean } | null;
}): { stage: Stage; step: number; skippedSteps: number[]; anchor: Date } | null {
  for (const c of classify(args.person)) {
    const pref = args.preferences ? args.preferences[STAGE_PREFERENCE[c.stage]] !== false : true;
    const plan = planNext({
      stage: c.stage,
      anchor: c.anchor,
      now: args.now,
      sent: args.sent,
      optedOut: args.optedOut,
      preferenceOn: pref,
    });
    if (plan.action === "send") {
      return { stage: c.stage, step: plan.step, skippedSteps: plan.skippedSteps, anchor: c.anchor };
    }
  }
  return null;
}
