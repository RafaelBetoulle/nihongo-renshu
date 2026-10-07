import { KANA_ROWS, KANA_ALT_ROMAJI, KATAKANA_LOOKALIKES, KATAKANA_EXTRA } from "../content/kana.js";
import { shuffle } from "../core/util.js";

// Same rules as kana.pro/legacy: four stages, each cleared with STAGE_LENGTH points.
// A right answer is worth one point, a wrong one takes a point back.
export const STAGE_LENGTH = 20;
export const LAST_STAGE = 4;
const OPTION_COUNT = 3;
const OPTION_POOL = 20;

const rowGroups = (prefix, index, section, kind) =>
  KANA_ROWS[section].map(([row, chars]) => ({
    id: `${prefix}:${row}`,
    kind,
    chars: chars.map((c) => [c[index], [c[2], ...(KANA_ALT_ROMAJI[c[0]] ?? [])]])
  }));

const hiragana = [
  ...rowGroups("h", 0, "base", "base"),
  ...rowGroups("h", 0, "dakuten", "alt"),
  ...rowGroups("h", 0, "combo", "alt")
];
const katakanaBase = rowGroups("k", 1, "base", "base");
const katakanaRomaji = new Map(katakanaBase.flatMap((g) => g.chars));
const katakana = [
  ...katakanaBase,
  ...KATAKANA_LOOKALIKES.map(([id, chars]) => ({
    id: `k:${id}`,
    kind: "similar",
    chars: chars.map((c) => [c, katakanaRomaji.get(c)])
  })),
  ...rowGroups("k", 1, "dakuten", "alt"),
  ...rowGroups("k", 1, "combo", "alt"),
  ...KATAKANA_EXTRA.map(([id, chars]) => ({ id: `k:${id}`, kind: "alt", chars: chars.map(([c, r]) => [c, [r]]) }))
];

for (const id of ["h:kya", "k:kya", "k:fa"]) [...hiragana, ...katakana].find((g) => g.id === id).divider = true;

export const KANA_GROUPS = { hiragana, katakana };

const ROMAJI = new Map([...hiragana, ...katakana].flatMap((g) => g.chars));
export const romajiOf = (char) => ROMAJI.get(char);
const primary = (char) => ROMAJI.get(char)[0];

function without(list, item) {
  const i = list.indexOf(item);
  return i < 0 ? list : list.toSpliced(i, 1);
}

// Draws `amount` kana from the pool. With `include`, the draw is a set of answer options:
// it contains `include` and never two kana that read the same.
function draw(pool, amount, { include, exclude } = {}, random) {
  let rest = exclude ? without(pool, exclude) : pool;
  if (!include) return shuffle(rest, random).slice(0, amount);
  rest = shuffle(without(rest, include), random)
    .slice(0, OPTION_POOL)
    .filter((k) => primary(k) !== primary(include));
  rest = rest.filter((k, i) => !rest.slice(i + 1).some((other) => primary(other) === primary(k)));
  return shuffle([...rest.slice(0, amount - 1), include], random);
}

const combine = (lists) => lists.reduce((acc, list) => acc.flatMap((a) => list.map((b) => a + b)), [""]);

export function createQuiz(groupIds, stage, random = Math.random) {
  const ids = new Set(groupIds);
  // A kana picked through two groups (a row and a look-alike group) is deliberately asked more often.
  const pool = [...hiragana, ...katakana].filter((g) => ids.has(g.id)).flatMap((g) => g.chars.map(([c]) => c));
  const reversed = stage === 2;
  let question = [];
  let options = [];
  let allowed = [];
  let previous = null;
  let progress = 0;

  function next() {
    question = draw(pool, stage === LAST_STAGE ? 3 : 1, { exclude: question[0] }, random);
    options = draw(pool, OPTION_COUNT, { include: question[0] }, random);
    allowed = reversed ? question : combine(question.map(romajiOf));
  }

  function answer(text) {
    const correct = allowed.includes(text);
    progress = correct ? progress + 1 : Math.max(0, progress - 1);
    previous = { text: `${quiz.prompt} = ${allowed[0]}`, correct };
    return { correct, complete: progress >= STAGE_LENGTH };
  }

  const quiz = {
    next,
    answer,
    get question() {
      return question;
    },
    get prompt() {
      return reversed ? primary(question[0]) : question.join("");
    },
    get options() {
      return reversed ? options : options.map(primary);
    },
    get previous() {
      return previous;
    },
    get progress() {
      return progress;
    }
  };
  next();
  return quiz;
}
