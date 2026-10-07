import { matches } from "../core/romaji.js";
import { pick, shuffle } from "../core/util.js";

// Quizlet-style test: a fixed set of questions of several types, answered on one page and graded at the end.
export const TEST_TYPES = [
  ["tf", "Vrai ou faux"],
  ["choice", "Choix multiple"],
  ["match", "Appariement"],
  ["written", "Questions écrites"]
];
const MATCH_GROUP = 5;
const CHOICES = 4;

export const sideText = (w, side) => (side === "jp" ? w.jp : w.fr);

const normalize = (text) =>
  String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// "(ma) mère" accepts "mère" and "ma mère"; "voir, regarder" accepts either word.
export function frenchAnswers(fr) {
  const parts = [fr, ...fr.split(",")];
  const variants = parts.flatMap((p) => [p.replace(/\([^)]*\)/g, ""), p.replace(/[()]/g, "")]);
  return [...new Set(variants.map(normalize).filter(Boolean))];
}

export const isWrittenRight = (q, value) =>
  q.answer === "jp" ? matches(value, q.item.answers) : frenchAnswers(q.item.fr).includes(normalize(value));

// Other words whose text on that side differs from the item's, one per distinct text. Words of the
// same list come first so that the right answer cannot be guessed from its category.
function others(item, pool, side, random) {
  const seen = new Set([sideText(item, side)]);
  const mixed = shuffle(pool, random);
  const sameFirst = [...mixed.filter((w) => w.list === item.list), ...mixed.filter((w) => w.list !== item.list)];
  return sameFirst.filter((w) => {
    const text = sideText(w, side);
    if (seen.has(text)) return false;
    seen.add(text);
    return true;
  });
}

function groups(words) {
  const out = [];
  for (let i = 0; i < words.length;) {
    const left = words.length - i;
    const size = left - MATCH_GROUP === 1 ? MATCH_GROUP - 1 : Math.min(MATCH_GROUP, left);
    out.push(words.slice(i, i + size));
    i += size;
  }
  return out;
}

// `answer` is the language of the expected answer: "fr", "jp" or "both". Each word is asked once.
export function planTest(items, { count, answer = "both", types, random = Math.random }) {
  const words = shuffle(items, random).slice(0, Math.max(1, Math.min(count, items.length)));
  let enabled = TEST_TYPES.map(([id]) => id).filter((id) => types.includes(id));
  const share = () => Math.floor(words.length / enabled.length);
  if (enabled.includes("match") && enabled.length > 1 && share() < 2) enabled = enabled.filter((id) => id !== "match");
  if (enabled.length === 1 && enabled[0] === "match" && words.length < 2) enabled = ["choice"];

  const side = () => (answer === "both" ? pick(["fr", "jp"], random) : answer);
  const builders = {
    tf: (item) => {
      const a = side();
      const truth = random() < 0.5;
      return { type: "tf", item, answer: a, truth, shown: truth ? item : (others(item, items, a, random)[0] ?? item) };
    },
    choice: (item) => {
      const a = side();
      const options = shuffle([item, ...others(item, items, a, random).slice(0, CHOICES - 1)], random);
      return { type: "choice", item, answer: a, options };
    },
    written: (item) => ({ type: "written", item, answer: side() })
  };

  const out = [];
  let start = 0;
  enabled.forEach((type, i) => {
    const size = share() + (i < words.length % enabled.length ? 1 : 0);
    const chunk = words.slice(start, start + size);
    start += size;
    if (type === "match") {
      for (const group of groups(chunk))
        out.push({ type, items: group, answer: side(), options: shuffle(group, random) });
    } else {
      out.push(...chunk.map(builders[type]));
    }
  });
  return out.map((q) =>
    q.type === "tf" ? { ...q, truth: sideText(q.shown, q.answer) === sideText(q.item, q.answer) } : q
  );
}

export const wordsOf = (q) => q.items ?? [q.item];
