import { KANA_ROWS } from "../content/kana.js";
import { byKey, kana } from "../quiz/catalog.js";
import { KANA_GROUPS, LAST_STAGE, STAGE_LENGTH, createQuiz } from "../quiz/kanapro.js";
import { esc } from "../core/util.js";

const SCRIPTS = [
  ["hiragana", "Hiragana · ひらがな"],
  ["katakana", "Katakana · カタカナ"]
];
const TOGGLES = {
  alt: "Caractères alternatifs (ga · ba · kya..)",
  similar: "Caractères qui se ressemblent"
};
const STAGES = {
  1: ["Choisis la bonne réponse", "Kana → rōmaji"],
  2: ["Choisis la bonne réponse", "Rōmaji → kana"],
  3: ["Écris la réponse", "Kana → rōmaji"],
  4: ["Écris la réponse", "Trois kana à la fois → rōmaji"]
};
// Menu cards: [question, answer, how it is answered]
const STAGE_CARDS = {
  1: ["あ", "a", "Choix parmi 3"],
  2: ["a", "あ", "Choix parmi 3"],
  3: ["あ", "a", "Au clavier"],
  4: ["あいう", "aiu", "Au clavier"]
};
const STAGE_SHOWN_MS = 1200;
const STAGE_FADE_MS = 1000;
const STAGE_UP_MS = 300;

const ALL_GROUPS = Object.values(KANA_GROUPS).flat();

const label = (group, kanaShown) => group.chars.map(([char, romaji]) => (kanaShown ? char : romaji[0])).join(" · ");

// Floating shortcut shown while the start button is below the fold.
function placeArrow() {
  const start = document.querySelector(".kp-start");
  if (start) document.querySelector(".kp-down").hidden = start.getBoundingClientRect().y <= window.innerHeight;
}
window.addEventListener("scroll", placeArrow);
window.addEventListener("resize", placeArrow);

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

function extras(ui) {
  const katakanaBase = kana.filter((it) => it.script === "katakana" && it.group === "base");
  return `
    <details class="card">
      <summary>💡 Mnémotechniques katakana</summary>
      <p class="muted small">Clique sur ✏️ pour écrire ta propre astuce.
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
}

function renderMenu(ctx) {
  const { app, store, ui } = ctx;
  const stages = new Set((store.prefs.kana?.stages ?? Object.keys(STAGES).map(Number)).filter((s) => STAGES[s]));
  const known = new Set(ALL_GROUPS.map((g) => g.id));
  const selected = new Set((store.prefs.kana?.groups ?? []).filter((id) => known.has(id)));
  const open = new Set();
  let error = "";

  const ofKind = (script, kind) => KANA_GROUPS[script].filter((g) => !kind || g.kind === kind);

  function toggleRow(script, kind) {
    const groups = ofKind(script, kind);
    const count = groups.filter((g) => selected.has(g.id)).length;
    const state = count === groups.length ? "on" : count ? "on half" : "";
    return `
      <div class="kp-row" data-toggle="${script}:${kind}">
        <span class="kp-box ${state}" data-check="${script}:${kind}"></span>
        <span class="kp-caret">${open.has(`${script}:${kind}`) ? "▲" : "▼"}</span>${TOGGLES[kind]}
      </div>`;
  }

  function panel(script, title) {
    let rows = "";
    let kind = "base";
    for (const g of KANA_GROUPS[script]) {
      if (g.kind !== kind) {
        kind = g.kind;
        rows += toggleRow(script, kind);
      }
      if (kind !== "base" && !open.has(`${script}:${kind}`)) continue;
      rows += `
        <div class="kp-row ${kind === "base" ? "" : "alt"} ${g.divider ? "divider" : ""}" data-group="${g.id}">
          <span class="kp-box ${selected.has(g.id) ? "on" : ""}"></span>
          <span class="kp-chars">${esc(label(g, false))}</span>
        </div>`;
    }
    return `
      <div class="card kp-panel">
        <div class="kp-panel-head">${title}</div>
        <div class="kp-rows">${rows}</div>
        <div class="kp-panel-foot">
          <button class="link" data-select="${script}::1">Tout</button> ·
          <button class="link" data-select="${script}::0">Aucun</button> ·
          <button class="link" data-select="${script}:alt:1">Tous les alternatifs</button> ·
          <button class="link" data-select="${script}:alt:0">Aucun alternatif</button>
        </div>
      </div>`;
  }

  function setAll(script, kind, on) {
    for (const g of ofKind(script, kind)) {
      if (on) selected.add(g.id);
      else selected.delete(g.id);
    }
    if (on) error = "";
  }

  function draw() {
    app.innerHTML = `
      <div class="card kp-panel">
        <div class="kp-panel-head">Étapes à jouer</div>
        <div class="kp-stage-cards">${Object.entries(STAGE_CARDS)
          .map(([n, [from, to, mode]]) => {
            const on = stages.has(Number(n));
            return `
          <button class="kp-stage-card ${on ? "on" : ""}" data-stage="${n}" aria-pressed="${on}">
            <span class="kp-stage-name"><span class="kp-box ${on ? "on" : ""}"></span>Étape ${n}</span>
            <span class="kp-stage-demo">${from}<span class="kp-stage-arrow">→</span>${to}</span>
            <span class="kp-stage-mode">${mode}</span>
          </button>`;
          })
          .join("")}
        </div>
      </div>
      <div class="kana-grid">${SCRIPTS.map(([script, title]) => panel(script, title)).join("")}</div>
      <div class="kp-actions">
        ${error ? `<div class="kp-error">${error}</div>` : ""}
        <button class="btn primary kp-start">Commencer le quiz !</button>
      </div>
      <button class="kp-down" hidden>Go !</button>
      ${extras(ui)}`;

    app.querySelectorAll("[data-group]").forEach((row) => {
      const group = ALL_GROUPS.find((g) => g.id === row.dataset.group);
      const show = (kanaShown) => {
        row.querySelector(".kp-chars").textContent = label(group, kanaShown);
      };
      row.onpointerdown = () => show(true);
      row.onpointerup = row.onpointerleave = row.onpointercancel = () => show(false);
      row.onclick = () => {
        if (selected.delete(group.id)) return draw();
        selected.add(group.id);
        error = "";
        draw();
      };
    });
    app.querySelectorAll("[data-toggle]").forEach((row) => {
      row.onclick = () => {
        const key = row.dataset.toggle;
        if (!open.delete(key)) open.add(key);
        draw();
      };
    });
    app.querySelectorAll("[data-check]").forEach((box) => {
      box.onclick = (ev) => {
        ev.stopPropagation();
        const [script, kind] = box.dataset.check.split(":");
        setAll(script, kind, !ofKind(script, kind).every((g) => selected.has(g.id)));
        draw();
      };
    });
    app.querySelectorAll("[data-select]").forEach((link) => {
      link.onclick = () => {
        const [script, kind, on] = link.dataset.select.split(":");
        setAll(script, kind, on === "1");
        draw();
      };
    });
    app.querySelectorAll("[data-stage]").forEach((row) => {
      row.onclick = () => {
        const n = Number(row.dataset.stage);
        if (!stages.delete(n)) stages.add(n);
        error = "";
        draw();
      };
    });
    app.querySelector(".kp-start").onclick = () => {
      if (!selected.size || !stages.size) {
        error = selected.size ? "Choisis au moins une étape !" : "Choisis au moins un groupe !";
        return draw();
      }
      const chosen = [...stages].sort();
      store.prefs.kana = { groups: [...selected], stages: chosen };
      store.save();
      renderGame(ctx, [...selected], chosen);
    };
    app.querySelector(".kp-down").onclick = () => {
      const top = app.querySelector(".kp-start").getBoundingClientRect().top + window.scrollY - window.innerHeight + 50;
      window.scrollTo(0, Math.max(0, top));
    };
    placeArrow();
  }

  draw();
}

// Plays the chosen stages in order; "keep playing" starts the same round again.
function renderGame(ctx, groups, stages) {
  const { app, store } = ctx;
  const startedAt = Date.now();
  let round = 0;
  let stage = stages[0];
  let total = 0;
  let right = 0;

  app.innerHTML = `
    <div class="kp-game">
      <button class="link kp-back">← Retour au menu</button>
      <div class="kp-body"></div>
    </div>`;
  const root = app.firstElementChild;
  const body = root.querySelector(".kp-body");
  const later = (fn, ms) => setTimeout(() => root.isConnected && fn(), ms);
  window.scrollTo(0, 0);

  function exit() {
    const secs = Math.round((Date.now() - startedAt) / 1000);
    if (total) store.logSession({ title: "Kana", total, firstTry: right, secs });
    renderMenu(ctx);
    window.scrollTo(0, 0);
  }
  root.querySelector(".kp-back").onclick = exit;

  function record(char, correct) {
    const key = [`kana:h:${char}`, `kana:k:${char}`].find((k) => byKey.has(k));
    if (key) store.record(key, correct);
  }

  function showStage() {
    if (round >= stages.length) return showEnd();
    stage = stages[round];
    const [title, sub] = STAGES[stage];
    body.innerHTML = `
      <div class="kp-stage">
        <h1>Étape ${stage}</h1>
        <h3>${title}</h3>
        <h4>${sub}</h4>
      </div>`;
    const screen = body.firstElementChild;
    later(() => screen.classList.add("out"), STAGE_SHOWN_MS);
    later(() => screen.isConnected && showQuestion(), STAGE_SHOWN_MS + STAGE_FADE_MS);
  }

  function showEnd() {
    body.innerHTML = `
      <div class="kp-stage kp-end">
        <h1>Félicitations !</h1>
        <h3>${stages.length > 1 ? `Tu as réussi les ${stages.length} étapes.` : `Tu as réussi l'étape ${stage}.`}</h3>
        <h4>Veux-tu continuer à jouer ou revenir au menu ?</h4>
        <p><button class="btn primary" data-act="keep">Continuer à jouer</button></p>
        <p><button class="btn primary" data-act="menu">Retour au menu</button></p>
      </div>`;
    body.querySelector("[data-act=keep]").onclick = () => {
      round = 0;
      showStage();
    };
    body.querySelector("[data-act=menu]").onclick = exit;
  }

  function showQuestion() {
    const quiz = createQuiz(groups, stage);
    const typed = stage >= 3;
    let cleared = false;

    body.innerHTML = `
      <div class="kp-question">
        <div class="kp-previous"></div>
        <div class="kp-big"></div>
        <div class="kp-answers">${typed ? `<form><input class="kp-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Réponse"></form>` : ""}</div>
        <div class="kp-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${STAGE_LENGTH}">
          <div class="kp-progress-bar"></div>
          <span>Étape ${stage}</span>
        </div>
      </div>`;
    const $ = (s) => body.querySelector(s);

    function paint() {
      const prev = quiz.previous;
      $(".kp-previous").className = `kp-previous ${prev ? (prev.correct ? "correct" : "wrong") : ""}`;
      $(".kp-previous").textContent = prev ? prev.text : "C'est parti ! Quel est ce caractère ?";
      $(".kp-previous").title = prev ? (prev.correct ? "Bonne réponse !" : "Mauvaise réponse !") : "";
      $(".kp-big").textContent = quiz.prompt;
      $(".kp-progress").setAttribute("aria-valuenow", quiz.progress);
      $(".kp-progress-bar").style.width = `${Math.round((quiz.progress / STAGE_LENGTH) * 100)}%`;
      if (typed) return;
      $(".kp-answers").innerHTML = quiz.options.map((o) => `<button class="btn kp-answer">${esc(o)}</button>`).join("");
      $(".kp-answers")
        .querySelectorAll("button")
        .forEach((b) => {
          b.onclick = () => submit(b.textContent);
        });
    }

    function submit(value) {
      if (cleared) return;
      const [asked] = quiz.question;
      const { correct, complete } = quiz.answer(value);
      total++;
      if (correct) right++;
      if (stage < LAST_STAGE) record(asked, correct);
      if (complete) {
        cleared = true;
        paint();
        later(() => {
          round++;
          showStage();
        }, STAGE_UP_MS);
        return;
      }
      quiz.next();
      paint();
    }

    if (typed) {
      const input = $(".kp-input");
      input.oninput = () => {
        input.value = input.value.replace(/\s+/g, "");
      };
      $("form").onsubmit = (ev) => {
        ev.preventDefault();
        if (!input.value) return;
        submit(input.value.toLowerCase());
        input.value = "";
      };
      input.focus();
    }
    paint();
  }

  showStage();
}

export function renderKana(ctx) {
  renderMenu(ctx);
}
