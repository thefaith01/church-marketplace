import { test } from "node:test";
import assert from "node:assert/strict";
import { isArchivedFor, archiveFilter, archiveData, RESURFACE_DATA } from "../lib/conversation-archive.ts";

const conv = { participantOneId: "a", participantTwoId: "b", archivedByOneAt: null, archivedByTwoAt: null };

test("archiving sets only the caller's side", () => {
  assert.deepEqual(Object.keys(archiveData(conv, "a", true)), ["archivedByOneAt"]);
  assert.deepEqual(Object.keys(archiveData(conv, "b", true)), ["archivedByTwoAt"]);
  assert.ok(archiveData(conv, "a", true).archivedByOneAt instanceof Date);
});

test("unarchiving clears the caller's side to null", () => {
  assert.deepEqual(archiveData(conv, "b", false), { archivedByTwoAt: null });
});

test("archive is per user", () => {
  const c = { ...conv, archivedByOneAt: new Date() };
  assert.equal(isArchivedFor(c, "a"), true);
  assert.equal(isArchivedFor(c, "b"), false);
  assert.equal(isArchivedFor(c, "stranger"), false);
});

test("filters target only the user's own side", () => {
  const active = archiveFilter("u", false).OR;
  assert.deepEqual(active[0], { participantOneId: "u", archivedByOneAt: null });
  assert.deepEqual(active[1], { participantTwoId: "u", archivedByTwoAt: null });
  const arch = archiveFilter("u", true).OR;
  assert.deepEqual(arch[0], { participantOneId: "u", archivedByOneAt: { not: null } });
});

test("a new message resurfaces the chat for both people", () => {
  assert.deepEqual({ ...RESURFACE_DATA }, { archivedByOneAt: null, archivedByTwoAt: null });
});
