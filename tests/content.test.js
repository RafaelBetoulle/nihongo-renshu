import { test } from "node:test";
import assert from "node:assert/strict";
import { MODULES, buildQuestion } from "../src/quiz/catalog.js";
import { KATAKANA_TIPS } from "../src/content/katakana-tips.js";
import { KATAKANA_DRAWINGS } from "../src/content/katakana-drawings.js";
import { KANA_RE } from "../src/core/romaji.js";

const settings = { showReading: true };
const tipFor = () => "";

test("every item has a unique key", () => {
  const keys = Object.values(MODULES)
    .flat()
    .map((it) => it.key);
  assert.equal(new Set(keys).size, keys.length);
});

test("vocabulary readings are kana and produce rōmaji", () => {
  for (const w of MODULES.vocab) {
    assert.ok(KANA_RE.test(w.kana), w.jp);
    assert.match(w.romaji, /^[a-z' ]+$/, w.jp);
  }
});

test("every base katakana has a tip and a drawing", () => {
  for (const it of MODULES.kana.filter((k) => k.script === "katakana" && k.group === "base")) {
    assert.ok(KATAKANA_TIPS[it.char], it.char);
    assert.ok(KATAKANA_DRAWINGS[it.char]?.startsWith("<svg"), it.char);
  }
});

test("every question can be built in every mode", () => {
  const modes = {
    kana: ["read", "write"],
    vocab: ["read", "meaning", "recall", "write", "dict"],
    kanji: ["meaning", "reading", "word"]
  };
  for (const [module, list] of Object.entries(MODULES)) {
    for (const item of list) {
      for (const mode of modes[module]) {
        if (mode === "dict" && !item.note) continue;
        const q = buildQuestion(item, mode, { settings, tipFor });
        if (q.kind === "choice") {
          assert.ok(q.options.includes(q.correct), `${item.key} ${mode}`);
          assert.equal(new Set(q.options).size, q.options.length, `${item.key} ${mode}`);
        } else {
          assert.ok(q.answers.length > 0, `${item.key} ${mode}`);
        }
      }
    }
  }
});

test("multiple-choice answers for a word all come from its own list", () => {
  const byText = { fr: new Map(), jp: new Map() };
  for (const w of MODULES.vocab) {
    byText.fr.set(w.fr, [...(byText.fr.get(w.fr) ?? []), w.list]);
    byText.jp.set(w.jp, [...(byText.jp.get(w.jp) ?? []), w.list]);
  }
  for (const w of MODULES.vocab) {
    for (const [mode, field] of [
      ["meaning", "fr"],
      ["recall", "jp"]
    ]) {
      const q = buildQuestion(w, mode, { settings, tipFor });
      assert.equal(q.options.length, 4, `${w.key} ${mode}`);
      for (const o of q.options) assert.ok(byText[field].get(o).includes(w.list), `${w.key} ${mode} ${o}`);
    }
  }
});
