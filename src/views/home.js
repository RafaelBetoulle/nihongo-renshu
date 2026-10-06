import { MODULES } from "../quiz/catalog.js";
import { planDaily } from "../quiz/daily.js";
import { esc } from "../core/util.js";

export function dailyPlan(store) {
  const items = Object.values(MODULES).flat();
  return planDaily({ items, cardOf: store.card, size: store.settings.sessionSize || 20 });
}

function streak(history) {
  const days = new Set(history.map((h) => new Date(h.date).toDateString()));
  let n = 0;
  for (const d = new Date(); days.has(d.toDateString()); d.setDate(d.getDate() - 1)) n++;
  return n;
}

const TILES = [
  ["kana", "あ", "Kana", "Hiragana et katakana, façon Kana Pro"],
  ["vocab", "語", "Vocabulaire", `${MODULES.vocab.length} mots du quotidien`],
  ["kanji", "漢", "Kanji", `${MODULES.kanji.length} kanji du niveau N5`],
  ["tips", "💡", "Astuces", "Moyens mnémotechniques et dessins"]
];

export function renderHome({ app, store, ui }) {
  const plan = dailyPlan(store);
  const today = new Date().toDateString();
  const doneToday = store.prefs.lastDaily === today;
  const days = streak(store.history);

  app.innerHTML = `
    <section class="hero card">
      <div>
        <h1>おかえり、${esc(store.profile.name)} !</h1>
        ${store.settings.romaji ? `<p class="ro-line">Okaeri ! — Bon retour !</p>` : ""}
        <p class="muted">${days ? `🔥 ${days} jour${days > 1 ? "s" : ""} d'affilée` : "Prêt pour une petite session ?"}</p>
      </div>
      <div class="hero-review">
        <div class="daily-title">${doneToday ? "✓ Daily fait aujourd'hui" : "Ton daily du jour"}</div>
        <div class="daily-mix">
          <span><b>${plan.counts.due}</b> à revoir</span>
          <span><b>${plan.counts.weak}</b> points faibles</span>
          <span><b>${plan.counts.fresh}</b> nouveaux</span>
        </div>
        <a class="btn primary" href="#/daily">${doneToday ? "Encore un tour" : "Lancer le daily"} (${plan.items.length})</a>
        <div class="muted small">Un mélange de kana, de vocabulaire et de kanji</div>
      </div>
    </section>
    <section class="tiles">
      ${TILES.map(([route, ch, title, desc]) => {
        const items = MODULES[route];
        const pct = items ? ui.masteryOf(items) : null;
        return `<a class="tile-card card" href="#/${route}">
          <div class="tile-ch">${ch}</div>
          <div class="tile-body">
            <div class="tile-title">${title}</div>
            <div class="muted small">${desc}</div>
            ${pct === null ? "" : `<div class="meter"><div style="width:${pct}%"></div></div><div class="small muted">${pct}% maîtrisé</div>`}
          </div>
        </a>`;
      }).join("")}
    </section>`;
}

export function runDaily({ store, runQuiz }) {
  const plan = dailyPlan(store);
  store.prefs.lastDaily = new Date().toDateString();
  store.save();
  runQuiz(
    plan.items.map((item) => ({ item, mode: "mix" })),
    "Daily",
    "#/"
  );
}
