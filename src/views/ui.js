import { esc } from "../core/util.js";
import { inlineRomaji } from "../core/japanese.js";
import { MASTERED_BOX } from "../core/srs.js";
import { defaultTip, drawingOf, meaningsOf } from "../quiz/catalog.js";

export function createUi(store) {
  const inline = (text) =>
    store.settings.romaji
      ? inlineRomaji(text)
          .map((p) => esc(p.text) + (p.romaji ? ` <i class="ro-inline">(${esc(p.romaji)})</i>` : ""))
          .join("")
      : esc(text);

  const meanings = (text) => {
    if (!store.settings.kanjiMeaning) return "";
    const list = meaningsOf(text);
    return list.length ? `<span class="gloss">${esc(list.map(([k, f]) => `${k} ${f}`).join(" · "))}</span>` : "";
  };

  const tipFor = (item) => store.tip(item.key) || defaultTip(item);

  const tip = (item) => {
    const custom = store.tip(item.key);
    const text = tipFor(item);
    const label = text ? "Modifier l'astuce" : "Ajouter une astuce";
    return `<div class="tip ${custom ? "custom" : ""}" data-tip="${esc(item.key)}">${text ? `💡 ${inline(text)} ` : ""}<button class="edit" data-edit-tip="${esc(item.key)}" title="${label}">✏️${text ? "" : " ajouter une astuce"}</button></div>`;
  };

  const tipBox = (q, { withDrawing }) =>
    `<div class="tip-box">${withDrawing && q.drawing ? `<div class="tip-drawing">${q.drawing}</div>` : ""}💡 ${inline(q.tip)}</div>`;

  const level = (key) => {
    const card = store.card(key);
    const box = card ? Math.min(card.box, MASTERED_BOX) : 0;
    const title = card ? `${card.ok} ✓ / ${card.ko} ✗` : "jamais vu";
    return `<span class="lvl lvl${box}" title="${title}">${"●".repeat(box)}${"○".repeat(MASTERED_BOX - box)}</span>`;
  };

  const masteryOf = (items) =>
    items.length ? Math.round((100 * items.reduce((sum, it) => sum + store.mastery(it.key), 0)) / items.length) : 0;

  const speakButton = (text) => `<button class="speak-sm" data-say="${esc(text)}" title="Écouter">🔊</button>`;

  const drawingOrChar = (item, char) => {
    const drawing = drawingOf(item);
    return drawing ? `<div class="draw">${drawing}</div>` : `<div class="big">${esc(char)}</div>`;
  };

  return { inline, meanings, tip, tipFor, tipBox, level, masteryOf, speakButton, drawingOrChar };
}

export const searchBox = () =>
  `<input class="search" type="search" placeholder="Rechercher (japonais, rōmaji ou français)…">`;

export function bindSearch(root) {
  const input = root.querySelector(".search");
  if (!input) return;
  input.oninput = () => {
    const q = input.value.toLowerCase();
    root.querySelectorAll("[data-search]").forEach((el) => {
      el.hidden = !el.dataset.search.toLowerCase().includes(q);
    });
  };
}
