import test from "node:test";
import assert from "node:assert/strict";
import { eventChatExpiry, validProfileMediaMix } from "../lib/domainRules.mjs";

test("event chats expire exactly 48 hours after the event date closes", () => {
  const lifecycle = eventChatExpiry("2026-09-08");
  assert.equal(lifecycle.closesAt.toISOString(), "2026-09-08T23:59:59.999Z");
  assert.equal(lifecycle.expiresAt.toISOString(), "2026-09-10T23:59:59.999Z");
  assert.equal(eventChatExpiry("not-a-date"), null);
});

test("profile media accepts five photos or a maximum 3 photo + 2 video mix", () => {
  assert.equal(validProfileMediaMix(5, 0), true);
  assert.equal(validProfileMediaMix(3, 2), true);
  assert.equal(validProfileMediaMix(4, 1), false);
  assert.equal(validProfileMediaMix(2, 3), false);
  assert.equal(validProfileMediaMix(6, 0), false);
});
