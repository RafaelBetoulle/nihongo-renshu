import { test } from "node:test";
import assert from "node:assert/strict";
import { MODULES } from "../src/quiz/catalog.js";
import { frenchAnswers, isWrittenRight, planTest, sideText, wordsOf } from "../src/quiz/test.js";

const ALL = ["tf", "choice", "match", "written"];
const verbs = MODULES.vocab.filter((w) => w.list === "verbs");

test("a test asks each word once and only uses the enabled question types", () => {
  for (const types of [ALL, ["tf"], ["match"], ["choice", "written"]]) {
    const questions = planTest(verbs, { count: 13, types });
    const keys = questions.flatMap((q) => wordsOf(q).map((w) => w.key));
    assert.equal(keys.length, 13);
    assert.equal(new Set(keys).size, 13);
    for (const q of questions) assert.ok(types.includes(q.type), q.type);
  }
});

test("the number of questions is capped by the size of the list", () => {
  const questions = planTest(verbs, { count: 99, types: ["written"] });
  assert.equal(questions.length, verbs.length);
});

test("choices hold the right answer once and matching groups have at least two words", () => {
  for (const answer of ["fr", "jp", "both"]) {
    for (const q of planTest(MODULES.vocab, { count: 60, answer, types: ALL })) {
      if (answer !== "both") assert.equal(q.answer, answer);
      if (q.type === "choice") {
        const texts = q.options.map((w) => sideText(w, q.answer));
        assert.equal(new Set(texts).size, texts.length);
        assert.ok(texts.includes(sideText(q.item, q.answer)));
      }
      if (q.type === "match") assert.ok(q.items.length >= 2);
      if (q.type === "tf") assert.equal(q.truth, sideText(q.shown, q.answer) === sideText(q.item, q.answer));
    }
  }
});

test("written French answers tolerate accents, parentheses and alternatives", () => {
  assert.deepEqual(frenchAnswers("(ma) mère"), ["mere", "ma mere"]);
  assert.ok(frenchAnswers("voir, regarder").includes("regarder"));
  assert.ok(frenchAnswers("enchanté(e)").includes("enchante"));
  const item = verbs.find((w) => w.jp === "食べます");
  assert.ok(isWrittenRight({ item, answer: "fr" }, " Manger "));
  assert.ok(isWrittenRight({ item, answer: "jp" }, "tabemasu"));
  assert.ok(!isWrittenRight({ item, answer: "fr" }, ""));
  assert.ok(!isWrittenRight({ item, answer: "jp" }, ""));
});
