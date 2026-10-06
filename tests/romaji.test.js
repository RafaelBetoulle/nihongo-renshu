import { test } from "node:test";
import assert from "node:assert/strict";
import { matches, normalize, toRomaji } from "../src/core/romaji.js";

test("converts kana to Hepburn rōmaji", () => {
  assert.equal(toRomaji("ひらがな"), "hiragana");
  assert.equal(toRomaji("カタカナ"), "katakana");
  assert.equal(toRomaji("きょうしつ"), "kyoushitsu");
  assert.equal(toRomaji("がっこう"), "gakkou");
  assert.equal(toRomaji("まっちゃ"), "matcha");
  assert.equal(toRomaji("コーヒー"), "koohii");
  assert.equal(toRomaji("きんえん"), "kin'en");
});

test("accepts the usual romanization variants", () => {
  for (const [a, b] of [
    ["shi", "si"],
    ["tsu", "tu"],
    ["fu", "hu"],
    ["ji", "zi"],
    ["ja", "zya"],
    ["chi", "ti"],
    ["nooto", "nōto"],
    ["benkyoushimasu", "benkyou shimasu"],
    ["o", "wo"]
  ]) {
    assert.equal(normalize(a), normalize(b), `${a} ≡ ${b}`);
  }
});

test("matches typed answers, including kana input", () => {
  assert.ok(matches("Konnichiwa", ["konnichiwa"]));
  assert.ok(matches("ほん", ["hon"]));
  assert.ok(!matches("", ["a"]));
  assert.ok(!matches("ka", ["ki"]));
});
