const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ENTITIES[c]);

export function shuffle(list, random = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pick = (list, random = Math.random) => list[Math.floor(random() * list.length)];

export function choices(correct, pool, count = 4, random = Math.random) {
  const others = shuffle([...new Set(pool.filter((x) => x !== correct))], random).slice(0, count - 1);
  return shuffle([correct, ...others], random);
}

export const pluralize = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;
