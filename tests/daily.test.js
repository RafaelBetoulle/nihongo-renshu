import { test } from "node:test";
import assert from "node:assert/strict";
import { planDaily } from "../src/quiz/daily.js";

const items = Array.from({ length: 60 }, (_, i) => ({ key: `vocab:${i}`, module: "vocab", list: `l${i % 6}` }));
const now = Date.UTC(2026, 0, 1);

test("a first daily only proposes new cards", () => {
  const plan = planDaily({ items, cardOf: () => undefined, size: 20, now });
  assert.equal(plan.items.length, 20);
  assert.equal(plan.counts.fresh, 20);
});

test("due cards come before new ones", () => {
  const cards = Object.fromEntries(items.slice(0, 10).map((it) => [it.key, { box: 0, ok: 0, ko: 1, due: now - 1 }]));
  const plan = planDaily({ items, cardOf: (k) => cards[k], size: 20, now });
  assert.equal(plan.counts.due, 10);
  assert.equal(new Set(plan.items.map((it) => it.key)).size, plan.items.length);
});
