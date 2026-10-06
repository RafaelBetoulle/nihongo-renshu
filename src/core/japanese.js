import { KANA_RE, KANJI_RE, toRomaji } from "./romaji.js";

export const hasKana = (text) => KANA_RE.test(text);
export const hasKanji = (text) => KANJI_RE.test(text);
export const hasJapanese = (text) => hasKana(text) || hasKanji(text);

export function kanjiMeanings(text, dictionary) {
  const seen = new Set();
  const out = [];
  for (const c of String(text)) {
    if (dictionary.has(c) && !seen.has(c)) {
      seen.add(c);
      out.push([c, dictionary.get(c).split(",")[0]]);
    }
  }
  return out;
}

// Splits mixed French/Japanese text so that kana-only passages can be followed by their rōmaji.
const KANA_RUN = /[\u3040-\u30ff]+/g;

export function inlineRomaji(text) {
  const parts = [];
  let last = 0;
  for (const m of String(text).matchAll(KANA_RUN)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ text: m[0], romaji: toRomaji(m[0]) });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}
