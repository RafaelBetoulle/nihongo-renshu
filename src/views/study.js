import { LISTS, MODES, MODULES } from "../quiz/catalog.js";
import { toRomaji } from "../core/romaji.js";
import { esc, shuffle } from "../core/util.js";
import { bindSearch, searchBox } from "./ui.js";

const TITLES = { kanji: "Kanji" };
const SIZES = [10, 20, 30, 50, 0];

// Weakest and never-seen items first, with a bit of randomness so sessions don't repeat.
export function prioritize(items, store) {
  return shuffle(items)
    .map((it) => ({ it, weight: store.mastery(it.key) + Math.random() * 0.3 }))
    .sort((a, b) => a.weight - b.weight)
    .map((x) => x.it);
}

function setupPanel(module, store, ui) {
  const items = MODULES[module];
  const prefs = store.prefs[module] ?? {};
  const selected = new Set(prefs.lists ?? LISTS[module].map((l) => l.id));
  const mode = MODES[module].some((m) => m.id === prefs.mode) ? prefs.mode : MODES[module][0].id;
  const size = store.settings.sessionSize;

  return `
    <div class="setup card">
      <div class="lessons">
        <div class="sec-head"><span>Listes</span><button class="link" data-toggle-all>tout / rien</button></div>
        ${LISTS[module]
          .map((l) => {
            const inList = items.filter((it) => it.list === l.id);
            return `<label class="lesson"><input type="checkbox" value="${l.id}" ${selected.has(l.id) ? "checked" : ""}>
            <span>${esc(l.label)}</span><span class="muted small">${inList.length} · ${ui.masteryOf(inList)}%</span></label>`;
          })
          .join("")}
      </div>
      <div>
        <div class="modes">${MODES[module]
          .map(
            (m) => `
          <label class="mode"><input type="radio" name="mode" value="${m.id}" ${m.id === mode ? "checked" : ""}>
            <span><b>${m.label}</b><br><span class="muted small">${m.hint}</span></span></label>`
          )
          .join("")}
        </div>
        <label class="size">Questions par session
          <select id="size">${SIZES.map((n) => `<option value="${n}" ${n === size ? "selected" : ""}>${n || "Toutes"}</option>`).join("")}</select>
        </label>
        <button class="btn primary big" id="start">Commencer</button>
      </div>
    </div>`;
}

function bindSetup(module, { app, store, runQuiz }) {
  const checked = () => [...app.querySelectorAll(".lessons input:checked")].map((i) => i.value);
  const save = () => {
    store.prefs[module] = { lists: checked(), mode: app.querySelector("[name=mode]:checked").value };
    store.save();
  };
  app.querySelectorAll(".lessons input, [name=mode]").forEach((i) => {
    i.onchange = save;
  });
  app.querySelector("[data-toggle-all]").onclick = () => {
    const boxes = [...app.querySelectorAll(".lessons input")];
    const all = boxes.every((b) => b.checked);
    boxes.forEach((b) => {
      b.checked = !all;
    });
    save();
  };
  app.querySelector("#size").onchange = (e) => {
    store.settings.sessionSize = Number(e.target.value);
    store.save();
  };
  app.querySelector("#start").onclick = () => {
    save();
    const lists = new Set(checked());
    const mode = store.prefs[module].mode;
    let items = prioritize(
      MODULES[module].filter((it) => lists.has(it.list)),
      store
    );
    if (store.settings.sessionSize) items = items.slice(0, store.settings.sessionSize);
    runQuiz(
      items.map((item) => ({ item, mode })),
      TITLES[module],
      `#/${module}`
    );
  };
}

function kanjiGrid(ui) {
  const readings = (list) =>
    list
      .map((r) => `<span class="jp">${esc(r)}</span> <i class="ro-inline">${esc(toRomaji(r.replace(/[()]/g, "")))}</i>`)
      .join("、") || "—";
  return `
    <div class="card"><h2>Les kanji</h2>${searchBox()}
      <div class="kanji-grid">${MODULES.kanji
        .map(
          (k) => `
        <div class="kanji-card" data-search="${esc(`${k.k} ${k.fr} ${k.on.join(" ")} ${k.kun.join(" ")}`)}">
          <div class="kanji-big">${esc(k.k)}</div>
          <div class="kanji-fr">${esc(k.fr)}</div>
          <div class="small"><span class="muted">on</span> ${readings(k.on)}</div>
          <div class="small"><span class="muted">kun</span> ${readings(k.kun)}</div>
          <div class="small kanji-ex">${k.ex.map(([w, r, f]) => `<span class="jp">${esc(w)}</span> <span class="muted">${esc(r)} · <i>${esc(toRomaji(r))}</i> · ${esc(f)}</span>`).join("<br>")}</div>
          ${ui.tip(k)}
          <div>${ui.level(k.key)}</div>
        </div>`
        )
        .join("")}
      </div>
    </div>`;
}

export function renderStudy(module, ctx) {
  const { app, store, ui } = ctx;
  app.innerHTML = `<h1 class="page-title">${TITLES[module]}</h1>${setupPanel(module, store, ui)}${kanjiGrid(ui)}`;
  bindSetup(module, ctx);
  bindSearch(app);
}
