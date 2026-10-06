import { MODULES } from "../quiz/catalog.js";
import { esc } from "../core/util.js";
import { bindSearch, searchBox } from "./ui.js";

const TABS = {
  katakana: {
    label: "Katakana",
    items: () => MODULES.kana.filter((it) => it.script === "katakana" && it.group === "base"),
    big: (it) => it.char,
    sub: (it) => it.romaji
  },
  mine: {
    label: "Mes astuces",
    items: (store) =>
      Object.values(MODULES)
        .flat()
        .filter((it) => store.tip(it.key)),
    big: (it) => it.char ?? it.jp ?? it.k,
    sub: (it) => it.romaji ?? it.fr
  }
};

export function renderTips({ app, store, ui }) {
  const current = TABS[store.prefs.tipsTab] ? store.prefs.tipsTab : "katakana";
  const tab = TABS[current];
  const items = tab.items(store);

  app.innerHTML = `
    <h1 class="page-title">Astuces mnémotechniques</h1>
    <div class="card">
      <p class="muted">Clique sur ✏️ pour écrire ta propre astuce sur n'importe quel kana, mot ou kanji (★). Laisse le champ vide pour revenir à l'astuce d'origine.
        Les astuces katakana sont adaptées du blog <a href="https://akeminosekai.gitlab.io/japonais_1.html" target="_blank" rel="noopener">Akemi no Sekai</a>.</p>
      <div class="tabs">${Object.entries(TABS)
        .map(
          ([id, t]) =>
            `<button data-tab="${id}" class="${id === current ? "on" : ""}">${t.label} (${t.items(store).length})</button>`
        )
        .join("")}</div>
      ${searchBox()}
      ${
        items.length
          ? `<div class="tip-grid">${items
              .map(
                (it) => `
        <div class="tip-card ${tab.big(it).length > 2 ? "long" : ""}" data-search="${esc(`${tab.big(it)} ${tab.sub(it)} ${ui.tipFor(it)}`)}">
          ${ui.drawingOrChar(it, tab.big(it))}
          <div><div class="ro">${esc(tab.sub(it))}</div>${ui.tip(it)}</div>
        </div>`
              )
              .join("")}</div>`
          : `<p class="muted center">Tu n'as pas encore écrit d'astuce. Clique sur ✏️ dans les listes de vocabulaire ou de kanji.</p>`
      }
    </div>`;

  app.querySelectorAll("[data-tab]").forEach((b) => {
    b.onclick = () => {
      store.prefs.tipsTab = b.dataset.tab;
      store.save();
      renderTips({ app, store, ui });
    };
  });
  bindSearch(app);
}
