import { LISTS, MODES, MODULES } from "../quiz/catalog.js";
import { LEARNED, learnSummary, nextStage, planLearn } from "../quiz/learn.js";
import { esc, shuffle } from "../core/util.js";
import { startFlashcards } from "./flashcards.js";
import { startMatch } from "./match.js";
import { renderTestSetup } from "./test.js";
import { prioritize } from "./study.js";
import { bindSearch, searchBox } from "./ui.js";
import { bindDifficulty, difficultyBar } from "./difficulty.js";

const SIZES = [10, 20, 30, 50, 0];
const ALL = { id: "all", label: "Tout le vocabulaire" };
const ICONS = {
  all: "全",
  greetings: "礼",
  numbers: "数",
  people: "人",
  time: "時",
  food: "食",
  places: "所",
  objects: "物",
  adjectives: "形",
  verbs: "動",
  questions: "何"
};

const listLabel = (id) => LISTS.vocab.find((l) => l.id === id)?.label ?? id;

function findSet(id) {
  const list = [ALL, ...LISTS.vocab].find((l) => l.id === id);
  if (!list) return null;
  const items = id === ALL.id ? MODULES.vocab : MODULES.vocab.filter((w) => w.list === id);
  return { ...list, items };
}

const learnedCount = (items, store) => learnSummary(items, store.learnStage).learned;

function renderSets({ app, store, ui }) {
  app.innerHTML = `
    <h1 class="page-title">Vocabulaire</h1>
    <p class="muted set-stats">Choisis une liste, puis révise-la avec les cartes, le mode Apprendre ou les exercices.</p>
    <section class="tiles">${[ALL, ...LISTS.vocab]
      .map(({ id }) => {
        const set = findSet(id);
        const pct = ui.masteryOf(set.items);
        return `<a class="tile-card card" href="#/vocab/${id}">
          <div class="tile-ch">${ICONS[id] ?? "語"}</div>
          <div class="tile-body">
            <div class="tile-title">${esc(set.label)}</div>
            <div class="muted small">${set.items.length} mots · ${learnedCount(set.items, store)} appris</div>
            <div class="meter"><div style="width:${pct}%"></div></div><div class="small muted">${pct}% maîtrisé</div>
          </div>
        </a>`;
      })
      .join("")}
    </section>`;
}

function termsTable(set, ui) {
  const withList = set.id === ALL.id;
  return `
    <div class="card"><h2>Termes de la liste (${set.items.length})</h2>${searchBox()}
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Japonais</th><th>Lecture</th><th>Français</th>${withList ? "<th>Liste</th>" : ""}<th></th></tr></thead>
        <tbody>${set.items
          .map(
            (w) => `
          <tr data-search="${esc(`${w.jp} ${w.kana} ${w.romaji} ${w.fr}`)}">
            <td><span class="jp big-cell">${esc(w.jp)}</span>${ui.meanings(w.jp)}</td>
            <td><span class="jp">${esc(w.kana)}</span><br><span class="muted small">${esc(w.romaji)}</span>${w.note ? `<br><span class="muted small">dico : ${esc(w.note)}</span>` : ""}</td>
            <td>${esc(w.fr)}${ui.tip(w)}</td>
            ${withList ? `<td class="small muted">${esc(listLabel(w.list))}</td>` : ""}
            <td class="nowrap">${ui.level(w.key)} ${ui.speakButton(w.kana)}</td>
          </tr>`
          )
          .join("")}
        </tbody>
      </table></div>
    </div>`;
}

function renderSet(set, ctx) {
  const { app, store, ui } = ctx;
  const base = `#/vocab/${set.id}`;
  const learn = learnSummary(set.items, store.learnStage);
  const best = store.prefs.vocab?.best?.[set.id];
  const tiles = [
    ["cards", "🎴", "Cartes", "Retourne les cartes et trie-les : sues ou à revoir"],
    [
      "learn",
      "🎓",
      "Apprendre",
      learn.learned === set.items.length
        ? "Liste apprise ✓ — relancer repart de zéro"
        : `Pas à pas : sens, puis japonais, puis écriture · ${learn.learned}/${set.items.length} appris`
    ],
    ["test", "📝", "Test", "Vrai ou faux, QCM, appariement et questions écrites, noté à la fin"],
    [
      "match",
      "🧩",
      "Associer",
      `Relie les paires contre la montre${best ? ` · record ${(best / 1000).toFixed(1)} s` : ""}`
    ],
    ["drill", "🎯", "Entraînement ciblé", "Un seul type de question, celui que tu choisis"]
  ];

  app.innerHTML = `
    <a class="crumb" href="#/vocab">← Toutes les listes</a>
    <h1 class="page-title">${esc(set.label)}</h1>
    <p class="muted set-stats">${set.items.length} mots · ${ui.masteryOf(set.items)}% maîtrisé · ${learn.learned} appris, ${learn.learning} en cours</p>
    ${difficultyBar()}
    <section class="tiles study-tiles">${tiles
      .map(
        ([route, icon, title, desc]) => `<a class="tile-card card" href="${base}/${route}">
          <div class="tile-ch">${icon}</div>
          <div class="tile-body"><div class="tile-title">${title}</div><div class="muted small">${desc}</div></div>
        </a>`
      )
      .join("")}
    </section>
    ${termsTable(set, ui)}`;

  bindSearch(app);
  bindDifficulty(app, store, () => {
    const y = window.scrollY;
    renderSet(set, ctx);
    window.scrollTo(0, y);
  });
}

function renderDrill(set, { app, store, runQuiz, go }) {
  const base = `#/vocab/${set.id}`;
  const prefs = (store.prefs.vocab ??= {});
  const modes = MODES.vocab.filter((m) => !m.needs || set.items.some((w) => w[m.needs]));
  const mode = modes.some((m) => m.id === prefs.mode) ? prefs.mode : modes[0].id;

  app.innerHTML = `
    <a class="crumb" href="${base}">← ${esc(set.label)}</a>
    <div class="card drill-setup"><h2>Entraînement ciblé</h2>
      <div class="modes">${modes
        .map(
          (m) => `
        <label class="mode"><input type="radio" name="mode" value="${m.id}" ${m.id === mode ? "checked" : ""}>
          <span><b>${m.label}</b><br><span class="muted small">${m.hint}</span></span></label>`
        )
        .join("")}
      </div>
      <label class="size">Questions par session
        <select id="size">${SIZES.map((n) => `<option value="${n}" ${n === store.settings.sessionSize ? "selected" : ""}>${n || "Toutes"}</option>`).join("")}</select>
      </label>
      <button class="btn primary big" id="start">Commencer</button>
      <button class="btn ghost big" id="back">Retour</button>
    </div>`;

  const chosen = () => app.querySelector("[name=mode]:checked").value;
  app.querySelectorAll("[name=mode]").forEach((i) => {
    i.onchange = () => {
      prefs.mode = chosen();
      store.save();
    };
  });
  app.querySelector("#size").onchange = (e) => {
    store.settings.sessionSize = Number(e.target.value);
    store.save();
  };
  app.querySelector("#back").onclick = () => go(base);
  app.querySelector("#start").onclick = () => {
    const def = modes.find((m) => m.id === chosen());
    let items = prioritize(
      set.items.filter((w) => !def.needs || w[def.needs]),
      store
    );
    if (store.settings.sessionSize) items = items.slice(0, store.settings.sessionSize);
    runQuiz(
      items.map((item) => ({ item, mode: def.id })),
      `${def.label} · ${set.label}`,
      base
    );
  };
}

function runLearn(set, ctx) {
  const { store, runQuiz } = ctx;
  if (set.items.every((w) => store.learnStage(w.key) >= LEARNED)) store.resetLearn(set.items.map((w) => w.key));
  runQuiz(planLearn(set.items, store.learnStage), `Apprendre · ${set.label}`, `#/vocab/${set.id}`, {
    onAnswer: ({ item }, ok) => store.setLearnStage(item.key, nextStage(store.learnStage(item.key), ok)),
    more: () => {
      const s = learnSummary(set.items, store.learnStage);
      const note = `<b>${s.learned}</b> appris · <b>${s.learning}</b> en cours · <b>${s.fresh}</b> pas encore vus`;
      return s.learned === set.items.length
        ? { note: `🎉 Liste apprise ! ${note}` }
        : { note, label: "Continuer", run: () => runLearn(set, ctx) };
    }
  });
}

export function renderVocab(ctx, [id, activity] = []) {
  const { app, store, ui, go } = ctx;
  const set = id ? findSet(id) : null;
  if (!set) return renderSets(ctx);
  const onExit = () => go(`#/vocab/${set.id}`);

  if (activity === "cards") {
    startFlashcards(app, set.items, { store, ui, title: `Cartes · ${set.label}`, onExit });
  } else if (activity === "learn") {
    runLearn(set, ctx);
  } else if (activity === "drill") {
    renderDrill(set, ctx);
  } else if (activity === "test") {
    renderTestSetup(set, ctx);
  } else if (activity === "match") {
    const prefs = (store.prefs.vocab ??= {});
    startMatch(app, shuffle(set.items), {
      store,
      best: prefs.best?.[set.id],
      onBest: (time) => {
        prefs.best = { ...prefs.best, [set.id]: time };
        store.save();
      },
      onExit
    });
  } else {
    renderSet(set, ctx);
  }
}
