import { KANA_ROWS } from "../content/kana.js";
import { VOCAB_LISTS } from "../content/vocab.js";
import { KANJI_LISTS } from "../content/kanji.js";
import { KATAKANA_TIPS } from "../content/katakana-tips.js";
import { KATAKANA_DRAWINGS } from "../content/katakana-drawings.js";
import { toRomaji } from "../core/romaji.js";
import { hasKanji, kanjiMeanings } from "../core/japanese.js";
import { choices, esc, pick } from "../core/util.js";

const readingRomaji = (reading) => toRomaji(reading.replace(/[()]/g, ""));

export const kana = Object.entries(KANA_ROWS).flatMap(([group, rows]) =>
  rows.flatMap(([row, chars]) =>
    chars.flatMap(([hira, kata, romaji]) => [
      { key: `kana:h:${hira}`, module: "kana", script: "hiragana", group, row, char: hira, romaji },
      { key: `kana:k:${kata}`, module: "kana", script: "katakana", group, row, char: kata, romaji }
    ])
  )
);

export const vocab = VOCAB_LISTS.flatMap((list) =>
  list.words.map((w) => {
    const romaji = w.ro ?? toRomaji(w.kana);
    return {
      ...w,
      key: `vocab:${w.jp}`,
      module: "vocab",
      list: list.id,
      romaji,
      answers: [romaji, toRomaji(w.kana), ...(w.alt ?? [])]
    };
  })
);

export const kanji = KANJI_LISTS.flatMap((list) =>
  list.kanji.map((k) => ({
    ...k,
    key: `kanji:${k.k}`,
    module: "kanji",
    list: list.id,
    readings: [...k.on, ...k.kun].flatMap((r) => [toRomaji(r.replace(/\(.*\)/, "")), readingRomaji(r)])
  }))
);

export const LISTS = {
  vocab: VOCAB_LISTS.map(({ id, label }) => ({ id, label })),
  kanji: KANJI_LISTS.map(({ id, label }) => ({ id, label }))
};

export const KANJI_MEANINGS = new Map(kanji.map((k) => [k.k, k.fr]));
export const meaningsOf = (text) => kanjiMeanings(text, KANJI_MEANINGS);

export const MODULES = { kana, vocab, kanji };
export const byKey = new Map(
  Object.values(MODULES)
    .flat()
    .map((it) => [it.key, it])
);

export function defaultTip(item) {
  if (item.module === "kana" && item.script === "katakana") return KATAKANA_TIPS[item.char] ?? "";
  return "";
}

export const drawingOf = (item) =>
  item.module === "kana" && item.script === "katakana" ? (KATAKANA_DRAWINGS[item.char] ?? "") : "";

const reading = (w) => (hasKanji(w.jp) || w.jp !== w.kana ? w.kana : "");

// Reading aids are attached to every question; the session shows them according to the difficulty.
const VOCAB_NOTES = Object.fromEntries(vocab.map((x) => [x.jp, { reading: reading(x), romaji: x.romaji }]));

// Wrong answers come from the word's own list (verbs among verbs, numbers among numbers) so that
// the right one cannot be guessed from its category; other lists only fill in if the list is too small.
function vocabChoices(w, field) {
  const same = vocab.filter((x) => x.list === w.list).map((x) => x[field]);
  const enough = new Set(same).size >= 4;
  return choices(w[field], enough ? same : [...same, ...vocab.map((x) => x[field])]);
}

function vocabReveal(w) {
  const r = reading(w);
  return `<span class="jp">${esc(w.jp)}</span>${r ? ` <span class="muted">(${esc(r)})</span>` : ""} · <i>${esc(w.romaji)}</i> — ${esc(w.fr)}`;
}

function kanjiReveal(k) {
  const list = (rs) => (rs.length ? rs.map((r) => `${esc(r)} <i>(${esc(readingRomaji(r))})</i>`).join("、") : "—");
  return `<span class="jp big-inline">${esc(k.k)}</span> ${esc(k.fr)}<br><span class="muted">on : ${list(k.on)} · kun : ${list(k.kun)}</span>`;
}

const BUILDERS = {
  kana: {
    read: (it) => ({
      kind: "type",
      prompt: it.char,
      promptClass: "kana",
      label: it.script === "hiragana" ? "Hiragana" : "Katakana",
      answers: [it.romaji],
      correctText: it.romaji,
      reveal: `<b>${esc(it.char)}</b> = ${esc(it.romaji)}`,
      speak: it.char,
      short: it.char,
      drawingInHint: true
    }),
    write: (it) => ({
      kind: "choice",
      prompt: it.romaji,
      promptClass: "romaji",
      label: `Quel ${it.script} ?`,
      options: choices(
        it.char,
        kana.filter((x) => x.script === it.script && x.romaji !== it.romaji).map((x) => x.char)
      ),
      correct: it.char,
      optionClass: "kana-opt",
      correctText: it.char,
      reveal: `${esc(it.romaji)} = <b>${esc(it.char)}</b>`,
      speak: it.char,
      short: it.romaji,
      drawingInHint: false
    })
  },
  vocab: {
    read: (w) => ({
      kind: "type",
      prompt: w.jp,
      promptClass: "jp",
      label: "Lecture en rōmaji",
      meaningsOf: w.jp,
      answers: w.answers,
      correctText: w.romaji,
      reveal: vocabReveal(w),
      speak: w.kana,
      short: w.jp
    }),
    meaning: (w) => ({
      kind: "choice",
      prompt: w.jp,
      promptClass: "jp",
      subReading: reading(w),
      subRomaji: w.romaji,
      label: "Que veut dire… ?",
      options: vocabChoices(w, "fr"),
      correct: w.fr,
      correctText: w.fr,
      reveal: vocabReveal(w),
      speak: w.kana,
      short: w.jp
    }),
    recall: (w) => ({
      kind: "choice",
      prompt: w.fr,
      promptClass: "fr",
      label: "Comment dit-on… ?",
      options: vocabChoices(w, "jp"),
      correct: w.jp,
      optionClass: "jp-opt",
      optionNotes: VOCAB_NOTES,
      correctText: w.jp,
      reveal: vocabReveal(w),
      speak: w.kana,
      short: w.fr
    }),
    write: (w) => ({
      kind: "type",
      prompt: w.fr,
      promptClass: "fr",
      label: "Écris en rōmaji",
      answers: w.answers,
      correctText: w.romaji,
      reveal: vocabReveal(w),
      speak: w.kana,
      short: w.fr
    }),
    dict: (w) => ({
      kind: "choice",
      prompt: w.jp,
      promptClass: "jp",
      subReading: reading(w),
      subRomaji: w.romaji,
      sub: w.fr,
      label: "Forme du dictionnaire ?",
      options: choices(
        w.note,
        vocab.filter((x) => x.note).map((x) => x.note)
      ),
      correct: w.note,
      optionClass: "jp-opt",
      correctText: w.note,
      reveal: `${vocabReveal(w)} · dico : <span class="jp">${esc(w.note)}</span>`,
      speak: w.kana,
      short: w.jp
    })
  },
  kanji: {
    meaning: (k) => ({
      kind: "choice",
      prompt: k.k,
      promptClass: "kanji",
      label: "Sens de ce kanji ?",
      options: choices(
        k.fr,
        kanji.map((x) => x.fr)
      ),
      correct: k.fr,
      correctText: k.fr,
      reveal: kanjiReveal(k),
      short: k.k
    }),
    reading: (k) => ({
      kind: "type",
      prompt: k.k,
      promptClass: "kanji",
      label: "Tape une lecture (on ou kun)",
      answers: k.readings,
      correctText: [...k.on, ...k.kun].join("、"),
      reveal: kanjiReveal(k),
      short: k.k
    }),
    word: (k) => {
      const [word, kanaReading, fr] = pick(k.ex);
      const romaji = toRomaji(kanaReading);
      return {
        kind: "type",
        prompt: word,
        promptClass: "jp",
        label: "Lis ce mot (rōmaji)",
        meaningsOf: word,
        answers: [romaji],
        correctText: romaji,
        reveal: `<span class="jp">${esc(word)}</span> (${esc(kanaReading)}) · <i>${esc(romaji)}</i> — ${esc(fr)}`,
        speak: kanaReading,
        short: word
      };
    }
  }
};

export const MODES = {
  kana: [
    { id: "read", label: "Kana → rōmaji", hint: "saisie" },
    { id: "write", label: "Rōmaji → kana", hint: "QCM" }
  ],
  vocab: [
    { id: "read", label: "Lecture", hint: "japonais → taper le rōmaji" },
    { id: "meaning", label: "Sens", hint: "japonais → choisir le français" },
    { id: "recall", label: "Inverse", hint: "français → choisir le japonais" },
    { id: "write", label: "Inverse écrit", hint: "français → taper le rōmaji" },
    { id: "mix", label: "Mélange", hint: "un peu de tout" },
    { id: "dict", label: "Forme du dictionnaire", hint: "verbe en ます → choisir 行く, 食べる…", needs: "note" }
  ],
  kanji: [
    { id: "meaning", label: "Sens", hint: "kanji → choisir le sens" },
    { id: "reading", label: "Lectures", hint: "kanji → taper une lecture on/kun" },
    { id: "word", label: "Mots", hint: "lire les mots d'exemple" },
    { id: "mix", label: "Mélange", hint: "sens + mots" }
  ]
};

const MIX = { kana: ["read", "write"], vocab: ["read", "meaning", "recall"], kanji: ["meaning", "word"] };

export function buildQuestion(item, mode, { tipFor }) {
  const builders = BUILDERS[item.module];
  const chosen = builders[mode] ? mode : pick(MIX[item.module]);
  const q = builders[chosen](item);
  const drawing = drawingOf(item);
  return {
    ...q,
    key: item.key,
    tip: tipFor(item),
    drawing,
    drawingInHint: Boolean(drawing && q.drawingInHint)
  };
}
