import { TEST_TYPES, isWrittenRight, planTest, sideText, wordsOf } from "../quiz/test.js";
import { esc } from "../core/util.js";
import { bindDifficulty, difficultyBar } from "./difficulty.js";

const ANSWERS = [
  ["both", "Les deux"],
  ["fr", "Français"],
  ["jp", "Japonais"]
];
const LABELS = Object.fromEntries(TEST_TYPES);
const other = (side) => (side === "jp" ? "fr" : "jp");

function aidAttrs(w) {
  return `data-reading="${esc(w.jp !== w.kana ? w.kana : "")}" data-romaji="${esc(w.romaji)}"`;
}

// Japanese text is followed by a slot for its reading aids, filled according to the difficulty.
const term = (w, side) =>
  side === "jp" ? `<span class="jp">${esc(w.jp)}</span><span class="opt-ro" ${aidAttrs(w)}></span>` : esc(w.fr);

const solution = (w, side) => (side === "jp" ? `${w.jp} (${w.romaji})` : w.fr);

export function renderTestSetup(set, ctx) {
  const { app, store, go } = ctx;
  const prefs = (store.prefs.vocab ??= {});
  const max = set.items.length;
  const saved = prefs.test ?? {};
  const types = saved.types ?? TEST_TYPES.map(([id]) => id);

  app.innerHTML = `
    <a class="crumb" href="#/vocab/${set.id}">← ${esc(set.label)}</a>
    <div class="card test-setup"><h2>Configure ton test</h2>
      <label class="size"><span>Questions <span class="muted small">(max. ${max})</span></span>
        <input type="number" id="t-count" min="1" max="${max}" value="${Math.min(saved.count ?? 20, max)}"></label>
      <label class="size">Réponse
        <select id="t-answer">${ANSWERS.map(([v, l]) => `<option value="${v}" ${v === (saved.answer ?? "both") ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      <hr>
      ${TEST_TYPES.map(([id, label]) => `<label class="size">${label} <input type="checkbox" data-type="${id}" ${types.includes(id) ? "checked" : ""}></label>`).join("")}
      <button class="btn primary big" id="t-start">Commencer le test</button>
      <button class="btn ghost big" id="t-back">Retour</button>
    </div>`;

  app.querySelector("#t-back").onclick = () => go(`#/vocab/${set.id}`);
  app.querySelector("#t-start").onclick = () => {
    const chosen = [...app.querySelectorAll("[data-type]:checked")].map((i) => i.dataset.type);
    if (!chosen.length) {
      alert("Active au moins un type de question.");
      return;
    }
    const count = Math.max(1, Math.min(max, Number(app.querySelector("#t-count").value) || max));
    prefs.test = { count, answer: app.querySelector("#t-answer").value, types: chosen };
    store.save();
    runTest(set, ctx, prefs.test);
  };
}

function questionCard(q, qi, from, total) {
  const words = wordsOf(q);
  const number = words.length > 1 ? `${from}–${from + words.length - 1}` : from;
  const head = `<div class="q-label">${LABELS[q.type]} · ${number} / ${total}</div>`;
  const prompt = (w) => `<div class="tq-prompt">${term(w, other(q.answer))}</div>`;
  let body;
  if (q.type === "tf") {
    body = `${prompt(q.item)}<div class="tq-claim">= ${term(q.shown, q.answer)}</div>
      <div class="options"><button class="opt" data-v="1">Vrai</button><button class="opt" data-v="0">Faux</button></div>`;
  } else if (q.type === "choice") {
    body = `${prompt(q.item)}<div class="options">${q.options
      .map((w, i) => `<button class="opt" data-v="${i}">${term(w, q.answer)}</button>`)
      .join("")}</div>`;
  } else if (q.type === "match") {
    const options = q.options
      .map((w) =>
        q.answer === "jp"
          ? `<option value="${esc(w.key)}" data-text="${esc(w.jp)}" ${aidAttrs(w)}>${esc(w.jp)}</option>`
          : `<option value="${esc(w.key)}">${esc(w.fr)}</option>`
      )
      .join("");
    body = q.items
      .map(
        (w, r) => `<div class="tq-row" data-r="${r}"><div>${term(w, other(q.answer))}</div>
          <select><option value="">— choisir —</option>${options}</select><div class="tq-mark"></div></div>`
      )
      .join("");
  } else {
    body = `${prompt(q.item)}<input class="answer-input" autocomplete="off" autocapitalize="off" spellcheck="false"
      placeholder="${q.answer === "jp" ? "en rōmaji…" : "en français…"}">`;
  }
  return `<div class="card tq" data-q="${qi}">${head}${body}<div class="q-feedback"></div></div>`;
}

function runTest(set, ctx, config) {
  const { app, store, go } = ctx;
  const questions = planTest(set.items, config);
  const total = questions.reduce((n, q) => n + wordsOf(q).length, 0);
  const startedAt = Date.now();
  const title = `Test · ${set.label}`;
  const root = document.createElement("div");
  root.className = "test";
  app.replaceChildren(root);

  let from = 1;
  root.innerHTML = `
    <div class="quiz-top">
      <button class="btn ghost small" data-act="quit">✕ Quitter</button>
      <div class="test-title">${esc(title)}</div>
      <div class="counter">${total} questions</div>
    </div>
    ${difficultyBar()}
    <div class="test-result"></div>
    ${questions
      .map((q, qi) => {
        const html = questionCard(q, qi, from, total);
        from += wordsOf(q).length;
        return html;
      })
      .join("")}
    <button class="btn primary big" data-act="submit">Valider le test</button>`;

  function renderAids() {
    const s = store.settings;
    root.querySelectorAll("[data-romaji]").forEach((el) => {
      const notes = [s.showReading && el.dataset.reading, s.romaji && el.dataset.romaji].filter(Boolean).join(" · ");
      if (el.tagName === "OPTION") el.textContent = el.dataset.text + (notes ? ` — ${notes}` : "");
      else el.textContent = notes;
    });
  }
  bindDifficulty(root, store, renderAids);
  renderAids();

  root.onclick = (ev) => {
    const opt = ev.target.closest(".tq .opt");
    if (!opt || opt.disabled) return;
    opt.parentElement.querySelectorAll(".opt").forEach((b) => b.classList.toggle("sel", b === opt));
  };
  root.querySelector("[data-act=quit]").onclick = () => go(`#/vocab/${set.id}`);
  root.querySelector("[data-act=submit]").onclick = grade;

  function grade() {
    let right = 0;
    questions.forEach((q, qi) => {
      const card = root.querySelector(`[data-q="${qi}"]`);
      const results = [];
      let correction = "";
      if (q.type === "match") {
        card.querySelectorAll(".tq-row").forEach((row, r) => {
          const w = q.items[r];
          const picked = q.options.find((o) => o.key === row.querySelector("select").value);
          const ok = Boolean(picked) && sideText(picked, q.answer) === sideText(w, q.answer);
          row.classList.add(ok ? "ok" : "ko");
          row.querySelector(".tq-mark").textContent = ok ? "✓" : `✗ ${solution(w, q.answer)}`;
          results.push([w, ok]);
        });
      } else if (q.type === "written") {
        results.push([q.item, isWrittenRight(q, card.querySelector("input").value)]);
        correction = solution(q.item, q.answer);
      } else {
        const chosen = card.querySelector(".opt.sel");
        const buttons = [...card.querySelectorAll(".opt")];
        const isCorrect = (b) =>
          q.type === "tf"
            ? (b.dataset.v === "1") === q.truth
            : sideText(q.options[Number(b.dataset.v)], q.answer) === sideText(q.item, q.answer);
        buttons.forEach((b) => {
          b.classList.remove("sel");
          if (isCorrect(b)) b.classList.add("right");
          else if (b === chosen) b.classList.add("wrong");
        });
        results.push([q.item, Boolean(chosen) && isCorrect(chosen)]);
        correction = q.type === "tf" && q.truth ? "Vrai" : solution(q.item, q.answer);
      }

      const allOk = results.every(([, ok]) => ok);
      card.classList.add(allOk ? "ok" : "ko");
      const fb = card.querySelector(".q-feedback");
      fb.className = `q-feedback ${allOk ? "good" : "bad"}`;
      if (q.type !== "match") fb.innerHTML = allOk ? "✓" : `✗ Réponse : <b>${esc(correction)}</b>`;
      for (const [w, ok] of results) {
        store.record(w.key, ok);
        if (ok) right++;
      }
    });

    root.querySelectorAll(".tq button, .tq input, .tq select").forEach((el) => {
      el.disabled = true;
    });
    root.querySelector("[data-act=submit]").remove();
    const secs = Math.round((Date.now() - startedAt) / 1000);
    store.logSession({ title, total, firstTry: right, secs });

    root.querySelector(".test-result").innerHTML = `
      <div class="card result">
        <h2>Test terminé</h2>
        <div class="stats-row">
          <div class="stat"><div class="stat-num">${Math.round((100 * right) / total)}%</div><div class="stat-lbl">score</div></div>
          <div class="stat"><div class="stat-num">${right}/${total}</div><div class="stat-lbl">bonnes réponses</div></div>
          <div class="stat"><div class="stat-num">${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</div><div class="stat-lbl">durée</div></div>
        </div>
        <p class="center muted">${right === total ? "Sans faute, bravo ! すごい！" : "Les corrections sont affichées sous chaque question."}</p>
        <div class="actions">
          <button class="btn primary" data-act="again">Nouveau test</button>
          <button class="btn" data-act="setup">Modifier le test</button>
          <button class="btn ghost" data-act="back">Retour</button>
        </div>
      </div>`;
    root.querySelector("[data-act=again]").onclick = () => runTest(set, ctx, config);
    root.querySelector("[data-act=setup]").onclick = () => renderTestSetup(set, ctx);
    root.querySelector("[data-act=back]").onclick = () => go(`#/vocab/${set.id}`);
    window.scrollTo(0, 0);
  }

  window.scrollTo(0, 0);
}
