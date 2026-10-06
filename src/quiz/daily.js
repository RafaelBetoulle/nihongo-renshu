import { errorRate, isDue } from "../core/srs.js";
import { shuffle } from "../core/util.js";

const MAX_NEW_PER_LIST = 2;
const MIN_NEW = 3;

// Mixes, in this order: cards due today, weak cards, then a few new ones (kana are excluded from
// new cards because the learner picks the rows to study on the Kana screen).
export function planDaily({ items, cardOf, size = 20, now = Date.now(), random = Math.random }) {
  const seen = items.filter((it) => cardOf(it.key));
  const due = shuffle(
    seen.filter((it) => isDue(cardOf(it.key), now)),
    random
  ).sort((a, b) => cardOf(a.key).box - cardOf(b.key).box);
  const weak = shuffle(
    seen.filter((it) => !isDue(cardOf(it.key), now) && (cardOf(it.key).ko > 0 || cardOf(it.key).box <= 1)),
    random
  ).sort((a, b) => errorRate(cardOf(b.key)) - errorRate(cardOf(a.key)));
  const unseen = items.filter((it) => !cardOf(it.key) && it.module !== "kana");
  const perList = {};
  const fresh = unseen.filter((it) => {
    const list = `${it.module}:${it.list}`;
    perList[list] = (perList[list] ?? 0) + 1;
    return perList[list] <= MAX_NEW_PER_LIST;
  });

  const newQuota = Math.max(MIN_NEW, Math.round(size * (seen.length < 30 ? 0.6 : 0.2)));
  const picked = new Set();
  const out = [];
  const counts = { due: 0, weak: 0, fresh: 0 };
  const take = (list, limit, tag) => {
    for (const it of list) {
      if (out.length >= size || limit <= 0) break;
      if (picked.has(it.key)) continue;
      picked.add(it.key);
      out.push(it);
      counts[tag]++;
      limit--;
    }
  };

  take(due, size - MIN_NEW, "due");
  take(weak, size - newQuota - out.length, "weak");
  take(fresh, size - out.length, "fresh");
  take(due, size - out.length, "due");
  take(weak, size - out.length, "weak");
  take(unseen, size - out.length, "fresh");

  return { items: shuffle(out, random), counts };
}
