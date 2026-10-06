import { test } from "node:test";
import assert from "node:assert/strict";
import { DAY, INTERVALS, isDue, mastery, review } from "../src/core/srs.js";

const now = Date.UTC(2026, 0, 1);

test("a correct answer moves the card up one box", () => {
  const card = review(undefined, true, { now });
  assert.equal(card.box, 1);
  assert.equal(card.ok, 1);
  assert.ok(!isDue(card, now));
  assert.ok(isDue(card, now + DAY));
});

test("a wrong answer sends the card back to box 0, due immediately", () => {
  const card = review({ box: 3, ok: 3, ko: 0 }, false, { now });
  assert.equal(card.box, 0);
  assert.equal(card.ko, 1);
  assert.ok(isDue(card, now));
});

test("a hinted answer does not level the card up", () => {
  assert.equal(review({ box: 2, ok: 2, ko: 0 }, true, { hinted: true, now }).box, 2);
  assert.equal(review(undefined, true, { hinted: true, now }).box, 1);
});

test("boxes are capped and mastery is normalised", () => {
  let card;
  for (let i = 0; i < 20; i++) card = review(card, true, { now });
  assert.equal(card.box, INTERVALS.length - 1);
  assert.equal(mastery(card), 1);
  assert.equal(mastery(undefined), 0);
});
