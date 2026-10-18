// Run with: npm test   (Node 22.18 or newer runs the .ts files directly)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classify,
  planNext,
  planPerson,
  inSendWindow,
  londonHour,
  waitingSinceForChurch,
  sentType,
  STAGE_OFFSETS_DAYS,
  LIFETIME_CAP,
} from "../lib/activation.ts";
import { signStop, verifyStop, stopUrl, bearerMatches } from "../lib/activation-sign.ts";
import { renderActivationEmail } from "../lib/activation-emails.ts";

const DAY = 86400000;
const HOUR = 3600000;
// Winter (GMT): 12:00 London = 12:00 UTC. Summer (BST): 12:00 London = 11:00 UTC.
const base = new Date("2026-01-12T00:00:00Z");
const at = (anchor, days, hoursExtra = 12) => new Date(anchor.getTime() + days * DAY + hoursExtra * HOUR);
const row = (stage, step, when) => ({ type: sentType(stage, step), createdAt: when });
const plan = (o) => planNext({ optedOut: false, preferenceOn: true, sent: [], ...o });

/* ---------- every stage and step becomes due on its offset ---------- */
for (const [stage, offsets] of Object.entries(STAGE_OFFSETS_DAYS)) {
  offsets.forEach((days, i) => {
    test(`stage ${stage} step ${i + 1} is due at +${days} days, not before`, () => {
      const anchor = base;
      const sent = [];
      for (let s = 1; s <= i; s++) sent.push(row(stage, s, at(anchor, offsets[s - 1], 10)));
      const early = plan({ stage, anchor, now: new Date(anchor.getTime() + days * DAY - HOUR), sent });
      assert.equal(early.action, "none");
      const due = plan({ stage, anchor, now: at(anchor, days, 12), sent });
      assert.deepEqual([due.action, due.step], ["send", i + 1]);
    });
  });
}

test("nothing is due before the first offset", () => {
  assert.equal(plan({ stage: "A", anchor: base, now: at(base, 0, 12) }).reason, "not due yet");
});

/* ---------- skipping after missed runs ---------- */
test("after missed runs only the latest due step is sent, earlier ones skipped", () => {
  const r = plan({ stage: "A", anchor: base, now: at(base, 7, 12) });
  assert.equal(r.action, "send");
  assert.equal(r.step, 3);
  assert.deepEqual(r.skippedSteps, [1, 2]);
});

test("a step already sent is not sent again, and earlier steps do not replay", () => {
  const sent = [row("A", 3, at(base, 7, 9))];
  assert.equal(plan({ stage: "A", anchor: base, now: at(base, 7, 18), sent }).action, "none");
  const later = plan({ stage: "A", anchor: base, now: at(base, 21, 12), sent });
  assert.deepEqual([later.action, later.step], ["send", 4]);
});

test("sequence finished after the last step", () => {
  const sent = [row("A", 4, at(base, 21, 9))];
  assert.equal(plan({ stage: "A", anchor: base, now: at(base, 40, 12), sent }).reason, "sequence finished");
});

test("a step that became due more than 7 days ago is not sent (no backlog blast for old accounts)", () => {
  assert.equal(plan({ stage: "A", anchor: base, now: at(base, 400, 12) }).reason, "step too old to send");
  assert.equal(plan({ stage: "A", anchor: base, now: at(base, 5, 12) }).action, "send");
});

/* ---------- spacing ---------- */
test("at least 20 hours between any two activation emails", () => {
  const justSent = [row("D", 1, at(base, 0, 14))];
  const anchor = new Date(base.getTime() - 5 * DAY);
  const tooSoon = new Date(at(base, 0, 14).getTime() + 19 * HOUR); // 09:00 next day, UK winter
  assert.equal(plan({ stage: "A", anchor, now: tooSoon, sent: justSent }).reason, "spacing");
  const ok = new Date(at(base, 0, 14).getTime() + 21 * HOUR);
  assert.equal(plan({ stage: "A", anchor, now: ok, sent: justSent }).action, "send");
});

/* ---------- quiet hours, GMT and BST ---------- */
test("send window is 08:00 to 20:00 UK time in winter (GMT)", () => {
  assert.equal(londonHour(new Date("2026-01-12T07:59:00Z")), 7);
  assert.equal(inSendWindow(new Date("2026-01-12T07:59:00Z")), false);
  assert.equal(inSendWindow(new Date("2026-01-12T08:00:00Z")), true);
  assert.equal(inSendWindow(new Date("2026-01-12T19:59:00Z")), true);
  assert.equal(inSendWindow(new Date("2026-01-12T20:00:00Z")), false);
});

test("send window is 08:00 to 20:00 UK time in summer (BST, UTC+1)", () => {
  assert.equal(inSendWindow(new Date("2026-07-13T06:59:00Z")), false); // 07:59 BST
  assert.equal(inSendWindow(new Date("2026-07-13T07:00:00Z")), true); // 08:00 BST
  assert.equal(inSendWindow(new Date("2026-07-13T18:59:00Z")), true); // 19:59 BST
  assert.equal(inSendWindow(new Date("2026-07-13T19:00:00Z")), false); // 20:00 BST
});

test("a due step outside the window waits and is not lost", () => {
  const anchor = new Date("2026-01-01T00:00:00Z");
  const night = new Date("2026-01-02T22:00:00Z");
  assert.equal(plan({ stage: "A", anchor, now: night }).reason, "outside 08:00 to 20:00 UK time");
  const morning = new Date("2026-01-03T08:30:00Z");
  assert.equal(plan({ stage: "A", anchor, now: morning }).action, "send");
});

/* ---------- caps, opt out, preferences ---------- */
test("lifetime cap of 10 emails per person", () => {
  const sent = [];
  for (let i = 0; i < LIFETIME_CAP; i++) sent.push(row("B", 1, new Date(base.getTime() - (i + 40) * DAY)));
  assert.equal(plan({ stage: "A", anchor: base, now: at(base, 1, 12), sent }).reason, "lifetime cap reached");
  assert.equal(plan({ stage: "A", anchor: base, now: at(base, 1, 12), sent: sent.slice(1) }).action, "send");
});

test("opt out and a switched off preference stop everything", () => {
  assert.equal(plan({ stage: "A", anchor: base, now: at(base, 1, 12), optedOut: true }).reason, "opted out");
  assert.equal(plan({ stage: "A", anchor: base, now: at(base, 1, 12), preferenceOn: false }).reason, "email preference off");
});

test("a new stage start restarts the sequence (rows from before the anchor do not count)", () => {
  const oldSent = [row("B", 3, new Date(base.getTime() - 30 * DAY))];
  const r = plan({ stage: "B", anchor: base, now: at(base, 0, 12), sent: oldSent });
  assert.deepEqual([r.action, r.step], ["send", 1]);
});

/* ---------- classification and completion ---------- */
const person = (o = {}) => ({
  userId: "u1",
  firstName: "Grace",
  isAdmin: false,
  role: "MEMBER",
  isChurchLeader: false,
  verificationStatus: "UNVERIFIED",
  userCreatedAt: base,
  verifiedAt: null,
  churchId: null,
  churchName: null,
  churchReferenceName: null,
  providerApprovedAt: null,
  leaderApprovedAt: null,
  activeListings: 0,
  conversations: 0,
  bookings: 0,
  serviceRequests: 0,
  churchInvites: 0,
  churchRoster: 0,
  churchJoinCode: null,
  waitingMembers: 0,
  waitingSince: null,
  ...o,
});
const stagesOf = (p) => classify(p).map((c) => c.stage);

test("A: unverified with no church and no reference; stops once church or reference is added", () => {
  assert.deepEqual(stagesOf(person()), ["A"]);
  assert.deepEqual(stagesOf(person({ churchId: "c1" })), []);
  assert.deepEqual(stagesOf(person({ churchReferenceName: "Grace Chapel" })), []);
  assert.deepEqual(stagesOf(person({ verificationStatus: "PENDING" })), []);
  assert.equal(classify(person())[0].anchor.getTime(), base.getTime());
});

test("B: leader with members waiting; stops when nobody waits", () => {
  const leader = person({ isChurchLeader: true, verificationStatus: "VERIFIED", churchId: "c1", churchInvites: 2, waitingMembers: 3, waitingSince: at(base, 2, 0) });
  assert.deepEqual(stagesOf(leader), ["B"]);
  assert.deepEqual(stagesOf({ ...leader, waitingMembers: 0, waitingSince: null }), []);
});

test("B: members become eligible only after 2 days pending", () => {
  assert.equal(waitingSinceForChurch([at(base, 0, 0)], at(base, 1, 23)), null);
  assert.equal(waitingSinceForChurch([at(base, 0, 0)], at(base, 2, 1)).getTime(), at(base, 2, 0).getTime());
  const first = waitingSinceForChurch([at(base, 1, 0), at(base, 0, 0)], at(base, 5, 0));
  assert.equal(first.getTime(), at(base, 2, 0).getTime());
});

test("B steps run at 0, +2 and +5 days from the moment the first member crossed 2 days", () => {
  const anchor = at(base, 2, 0);
  const sent = [row("B", 1, at(base, 2, 10))];
  assert.equal(plan({ stage: "B", anchor, now: at(base, 3, 12), sent }).action, "none");
  const s2 = plan({ stage: "B", anchor, now: at(base, 4, 12), sent });
  assert.deepEqual([s2.action, s2.step], ["send", 2]);
  const s3 = plan({ stage: "B", anchor, now: at(base, 7, 12), sent: [...sent, row("B", 2, at(base, 4, 10))] });
  assert.deepEqual([s3.action, s3.step], ["send", 3]);
});

test("C: verified member with nothing started; any conversation, booking or request completes it", () => {
  const m = person({ verificationStatus: "VERIFIED", verifiedAt: base });
  assert.deepEqual(stagesOf(m), ["C"]);
  assert.equal(classify(m)[0].anchor.getTime(), base.getTime());
  assert.deepEqual(stagesOf({ ...m, conversations: 1 }), []);
  assert.deepEqual(stagesOf({ ...m, bookings: 1 }), []);
  assert.deepEqual(stagesOf({ ...m, serviceRequests: 1 }), []);
});

test("D: verified provider with no active listing; an active listing completes it", () => {
  const p = person({ role: "PROVIDER", verificationStatus: "VERIFIED", verifiedAt: base, providerApprovedAt: at(base, 3, 0) });
  assert.deepEqual(stagesOf(p), ["D"]);
  assert.equal(classify(p)[0].anchor.getTime(), at(base, 3, 0).getTime());
  assert.deepEqual(stagesOf({ ...p, activeListings: 1 }), []);
  assert.deepEqual(stagesOf({ ...p, verificationStatus: "PENDING" }), []);
});

test("E: approved leader with 0 invites and 0 roster; either completes it", () => {
  const l = person({ isChurchLeader: true, verificationStatus: "VERIFIED", churchId: "c1", leaderApprovedAt: at(base, 1, 0) });
  assert.deepEqual(stagesOf(l), ["E"]);
  assert.equal(classify(l)[0].anchor.getTime(), at(base, 1, 0).getTime());
  assert.deepEqual(stagesOf({ ...l, churchInvites: 1 }), []);
  assert.deepEqual(stagesOf({ ...l, churchRoster: 4 }), []);
});

test("admins are never emailed", () => {
  assert.deepEqual(stagesOf(person({ isAdmin: true })), []);
  assert.deepEqual(stagesOf(person({ role: "ADMIN" })), []);
});

test("a leader gets B before E and falls through to E when B has nothing to send", () => {
  const l = person({ isChurchLeader: true, verificationStatus: "VERIFIED", churchId: "c1", leaderApprovedAt: base, waitingMembers: 1, waitingSince: at(base, 2, 0) });
  assert.deepEqual(stagesOf(l), ["B", "E"]);
  const first = planPerson({ person: l, now: at(base, 2, 12), sent: [], optedOut: false, preferences: null });
  assert.equal(first.stage, "B");
  const afterB = planPerson({
    person: l,
    now: at(base, 4, 12),
    sent: [row("B", 1, at(base, 2, 10)), row("B", 2, at(base, 3, 10)), row("E", 1, at(base, 1, 10))],
    optedOut: false,
    preferences: null,
  });
  // B step 3 not due until +5 days; E step 2 (+4 days) is due and unsent.
  assert.deepEqual([afterB.stage, afterB.step], ["E", 2]);
});

test("preferences: verification toggle governs A, B, E; requests toggle governs C, D", () => {
  const a = person();
  const now = at(base, 1, 12);
  assert.equal(planPerson({ person: a, now, sent: [], optedOut: false, preferences: { verificationEmail: false, requestsEmail: true } }), null);
  assert.equal(planPerson({ person: a, now, sent: [], optedOut: false, preferences: { verificationEmail: true, requestsEmail: false } }).stage, "A");
  const c = person({ verificationStatus: "VERIFIED", verifiedAt: base });
  assert.equal(planPerson({ person: c, now: at(base, 3, 12), sent: [], optedOut: false, preferences: { verificationEmail: true, requestsEmail: false } }), null);
});

test("completion stops a stage mid sequence", () => {
  const sent = [row("A", 1, at(base, 1, 10))];
  const before = planPerson({ person: person(), now: at(base, 3, 12), sent, optedOut: false, preferences: null });
  assert.equal(before.step, 2);
  const after = planPerson({ person: person({ churchId: "c1" }), now: at(base, 3, 12), sent, optedOut: false, preferences: null });
  assert.equal(after, null);
});

/* ---------- stop links and cron auth ---------- */
test("stop links are signed per user and cannot be forged", () => {
  const secret = "test-secret-test-secret-test-secret-1234";
  const sig = signStop("user1", secret);
  assert.equal(verifyStop("user1", sig, secret), true);
  assert.equal(verifyStop("user2", sig, secret), false);
  assert.equal(verifyStop("user1", sig + "x", secret), false);
  assert.equal(verifyStop("user1", sig, "another-secret"), false);
  assert.equal(verifyStop("user1", "", secret), false);
  assert.match(stopUrl("https://example.org/", "user1", secret), /^https:\/\/example\.org\/api\/activation\/stop\?u=user1&s=/);
});

test("cron authorisation needs the exact bearer secret", () => {
  assert.equal(bearerMatches("Bearer abc", "abc"), true);
  assert.equal(bearerMatches("Bearer abd", "abc"), false);
  assert.equal(bearerMatches("abc", "abc"), false);
  assert.equal(bearerMatches(null, "abc"), false);
  assert.equal(bearerMatches("Bearer ", undefined), false);
  assert.equal(bearerMatches("Bearer undefined", undefined), false);
});

/* ---------- copy ---------- */
const ctx = (stage, step, o = {}) => ({
  stage,
  step,
  firstName: "Grace",
  baseUrl: "https://example.org",
  stopUrl: "https://example.org/api/activation/stop?u=x&s=y",
  churchName: "Grace Chapel",
  categories: ["Plumbing", "Tutoring", "Gardening", "Catering"],
  waitingCount: 3,
  joinCode: "abc123",
  ...o,
});

test("every stage and step renders with a stop link, a tagged link, no dashes and no bold", () => {
  for (const [stage, offsets] of Object.entries(STAGE_OFFSETS_DAYS)) {
    offsets.forEach((_, i) => {
      const e = renderActivationEmail(ctx(stage, i + 1));
      assert.ok(e.subject.length > 10, `${stage}${i + 1} subject`);
      assert.ok(e.html.includes("Stop these emails"), `${stage}${i + 1} stop link`);
      assert.ok(e.html.includes(`r=${stage}${i + 1}`), `${stage}${i + 1} tag`);
      const words = `${e.subject} ${e.text}`.replace(/https?:\/\/\S+/g, "");
      assert.ok(!/[\u2013\u2014]/.test(words), `${stage}${i + 1} has an en or em dash`);
      assert.ok(!/ - /.test(words), `${stage}${i + 1} has a spaced hyphen`);
      assert.ok(!/<strong|<b>/.test(e.html), `${stage}${i + 1} has bold`);
    });
  }
});

test("copy names only real categories passed in, and omits the phrase when there are none", () => {
  assert.match(renderActivationEmail(ctx("C", 1)).text, /Plumbing, Tutoring or Gardening/);
  assert.ok(!renderActivationEmail(ctx("C", 1)).text.includes("Catering"));
  assert.ok(!/Right now you can look in/.test(renderActivationEmail(ctx("C", 1, { categories: [] })).text));
});

test("names are escaped in html", () => {
  const e = renderActivationEmail(ctx("A", 1, { firstName: "<b>Eve</b>" }));
  assert.ok(!e.html.includes("<b>Eve"));
});

test("stage B copy gives a count and no member details", () => {
  const e = renderActivationEmail(ctx("B", 1, { waitingCount: 1 }));
  assert.match(e.subject, /1 person from Grace Chapel/);
});
