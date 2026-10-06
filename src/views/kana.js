import { KANA_ROWS } from "../content/kana.js";
import { MODES, kana } from "../quiz/catalog.js";
import { esc, shuffle } from "../core/util.js";

const SECTIONS = [
  ["base", "Principaux"],
  ["dakuten", "Dakuten (゛゜)"],
  ["combo", "Combinaisons"]
];
const SCRIPTS = [
  ["hiragana", 0, "Hiragana ひらがな"],
  ["katakana", 1, "Katakana カタカナ"]
];

const rowKey = (script, row) => `${script}:${row}`;

function panel(script, index, title, selected) {
  return `
    <div class="card kana-panel">
      <div class="panel-head">
        <h2>${title}</h2>
        <button class="btn ghost small" data-all="${script}">Tout</button>
        <button class="btn ghost small" data-none="${script}">Aucun</button>
      </div>
      ${SECTIONS.map(
        ([group, label]) => `
        <div class="kana-sec">
          <div class="sec-head"><span>${label}</span><button class="link" data-section="${script}:${group}">tout cocher</button></div>
          <div class="rows">${KANA_ROWS[group]
            .map(
              ([row, chars]) => `
            <button class="row-chip ${selected.has(rowKey(script, row)) ? "on" : ""}" data-row="${rowKey(script, row)}">
              <span class="jp">${chars.map((c) => c[index]).join("")}</span><span class="muted small">${row}</span>
            </button>`
            )
            .join("")}
          </div>
        </div>`
      ).join("")}
    </div>`;
}

function referenceTable() {
  return Object.values(KANA_ROWS)
    .map((rows) =>
      rows
        .map(
          ([, chars]) =>
            `<div class="ref-row">${chars
              .map(
                ([h, k, r]) =>
                  `<button class="ref-cell" data-say="${h}"><span class="jp">${h}</span><span class="jp">${k}</span><span class="small muted">${r}</span></button>`
              )
              .join("")}</div>`
        )
        .join("")
    )
    .join("<hr>");
}

export function renderKana({ app, store, ui, runQuiz }) {
  const prefs = store.prefs.kana ?? { rows: ["hiragana:a", "hiragana:ka"], mode: "read" };
  const selected = new Set(prefs.rows);
  const katakanaBase = kana.filter((it) => it.script === "katakana" && it.group === "base");

  app.innerHTML = `
    <h1 class="page-title">Kana</h1>
    <div class="card kana-start">
      <div class="seg">${MODES.kana
        .map(
          (m) => `
        <label><input type="radio" name="mode" value="${m.id}" ${prefs.mode === m.id ? "checked" : ""}> ${m.label} <span class="muted small">(${m.hint})</span></label>`
        )
        .join("")}
      </div>
      <button class="btn primary big" id="start">Commencer <span id="count"></span></button>
    </div>
    <div class="kana-grid">${SCRIPTS.map(([s, i, t]) => panel(s, i, t, selected)).join("")}</div>
    <details class="card" open>
      <summary>💡 Mnémotechniques katakana</summary>
      <p class="muted small">Pendant un quiz, clique sur 💡 (ou tape « ? ») pour voir l'astuce. Clique sur ✏️ pour écrire la tienne.
        Astuces adaptées du blog <a href="https://akeminosekai.gitlab.io/japonais_1.html" target="_blank" rel="noopener">Akemi no Sekai</a>.</p>
      <div class="tip-grid">${katakanaBase
        .map(
          (it) => `
        <div class="tip-card">${ui.drawingOrChar(it, it.char)}<div><div class="ro">${esc(it.romaji)}</div>${ui.tip(it)}</div></div>`
        )
        .join("")}
      </div>
      <p class="muted small">Dakuten : ゛ rend le son « sale » (k→g, s→z, t→d, h→b) ; le petit rond ゜ donne h→p.</p>
    </details>
    <details class="card"><summary>Tableau de référence</summary><div class="kana-table">${referenceTable()}</div></details>`;

  const mode = () => app.querySelector("[name=mode]:checked").value;
  const chosen = () => kana.filter((it) => selected.has(rowKey(it.script, it.row)));
  const update = () => {
    app.querySelectorAll(".row-chip").forEach((b) => b.classList.toggle("on", selected.has(b.dataset.row)));
    app.querySelector("#count").textContent = `(${chosen().length})`;
    store.prefs.kana = { rows: [...selected], mode: mode() };
    store.save();
  };
  const toggleAll = (keys, on) => keys.forEach((k) => (on ? selected.add(k) : selected.delete(k)));
  const scriptKeys = (script) =>
    Object.values(KANA_ROWS)
      .flat()
      .map(([row]) => rowKey(script, row));

  app.querySelectorAll(".row-chip").forEach((b) => {
    b.onclick = () => {
      toggleAll([b.dataset.row], !selected.has(b.dataset.row));
      update();
    };
  });
  app.querySelectorAll("[data-section]").forEach((b) => {
    b.onclick = () => {
      const [script, group] = b.dataset.section.split(":");
      const keys = KANA_ROWS[group].map(([row]) => rowKey(script, row));
      toggleAll(keys, !keys.every((k) => selected.has(k)));
      update();
    };
  });
  app.querySelectorAll("[data-all]").forEach((b) => {
    b.onclick = () => {
      toggleAll(scriptKeys(b.dataset.all), true);
      update();
    };
  });
  app.querySelectorAll("[data-none]").forEach((b) => {
    b.onclick = () => {
      toggleAll(scriptKeys(b.dataset.none), false);
      update();
    };
  });
  app.querySelectorAll("[name=mode]").forEach((r) => {
    r.onchange = update;
  });
  app.querySelector("#start").onclick = () =>
    runQuiz(
      shuffle(chosen()).map((item) => ({ item, mode: mode() })),
      "Kana",
      "#/kana"
    );
  update();
}
