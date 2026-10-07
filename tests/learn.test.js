import { test } from "node:test";
import assert from "node:assert/strict";
import { LEARNED, LEARN_MODES, learnSummary, nextStage, planLearn } from "../src/quiz/learn.js";

const items = Array.from({ length: 10 }, (_, i) => ({ key: `w${i}` }));
const stageOf = (stages) => (key) => stages[key] ?? 0;

test("a word climbs one stage per success and steps back on a miss", () => {
  assert.equal(nextStage(0, true), 1);
  assert.equal(nextStage(LEARNED, true), LEARNED);
  assert.equal(nextStage(2, false), 1);
  assert.equal(nextStage(0, false), 0);
});

test("a round finishes started words before introducing new ones", () => {
  const stages = { w8: 1, w9: 2, w0: LEARNED };
  const round = planLearn(items, stageOf(stages), { size: 4 });
  const keys = round.map((e) => e.item.key).sort();
  assert.deepEqual(keys, ["w1", "w2", "w8", "w9"]);
  for (const e of round) assert.equal(e.mode, LEARN_MODES[stages[e.item.key] ?? 0]);
});

test("nothing is left to plan once every word is learned", () => {
  const stages = Object.fromEntries(items.map((it) => [it.key, LEARNED]));
  assert.deepEqual(planLearn(items, stageOf(stages)), []);
  assert.deepEqual(learnSummary(items, stageOf(stages)), { fresh: 0, learning: 0, learned: 10 });
});
