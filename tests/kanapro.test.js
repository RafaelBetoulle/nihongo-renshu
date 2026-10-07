import { test } from "node:test";
import assert from "node:assert/strict";
import { KANA_GROUPS, STAGE_LENGTH, createQuiz, romajiOf } from "../src/quiz/kanapro.js";

const groups = Object.values(KANA_GROUPS).flat();
const everything = groups.map((g) => g.id);

test("groups match Kana Pro: 26 hiragana, 33 katakana, unique ids", () => {
  assert.equal(KANA_GROUPS.hiragana.length, 26);
  assert.equal(KANA_GROUPS.katakana.length, 33);
  assert.equal(new Set(everything).size, everything.length);
  for (const g of groups) for (const [char, romaji] of g.chars) assert.ok(romaji?.length, `${g.id} ${char}`);
});

test("alternative spellings are accepted", () => {
  assert.deepEqual(romajiOf("し"), ["shi", "si"]);
  assert.deepEqual(romajiOf("ヂ"), ["ji", "di", "dzi"]);
  assert.deepEqual(romajiOf("ティ"), ["ti"]);
});

test("stage 1 offers three distinct readings including the right one", () => {
  for (let i = 0; i < 300; i++) {
    const quiz = createQuiz(everything, 1);
    const [char] = quiz.question;
    assert.equal(quiz.prompt, char);
    assert.equal(quiz.options.length, 3);
    assert.equal(new Set(quiz.options).size, 3);
    assert.ok(quiz.options.includes(romajiOf(char)[0]));
  }
});

test("stage 2 asks a reading and expects the kana", () => {
  const quiz = createQuiz(["h:a", "h:ka"], 2);
  const [char] = quiz.question;
  assert.equal(quiz.prompt, romajiOf(char)[0]);
  assert.ok(quiz.options.includes(char));
  assert.equal(quiz.answer(char).correct, true);
  assert.deepEqual(quiz.previous, { text: `${romajiOf(char)[0]} = ${char}`, correct: true });
});

test("stage 4 asks three kana and accepts any spelling of each", () => {
  const quiz = createQuiz(["h:sa", "h:ta"], 4);
  assert.equal(quiz.question.length, 3);
  const typed = quiz.question.map((c) => romajiOf(c).at(-1)).join("");
  assert.equal(quiz.answer(typed).correct, true);
});

test("the same kana is never asked twice in a row", () => {
  const quiz = createQuiz(["h:ya"], 3);
  for (let i = 0; i < 50; i++) {
    const [before] = quiz.question;
    quiz.next();
    assert.notEqual(quiz.question[0], before);
  }
});

test("a wrong answer takes a point back, never below zero", () => {
  const quiz = createQuiz(["h:a"], 3);
  const right = () => quiz.answer(romajiOf(quiz.question[0])[0]);
  assert.equal(quiz.answer("zzz").correct, false);
  assert.equal(quiz.progress, 0);
  right();
  right();
  quiz.answer("zzz");
  assert.equal(quiz.progress, 1);
  let result;
  for (let i = 1; i < STAGE_LENGTH; i++) result = right();
  assert.equal(result.complete, true);
});
