import { matches } from "../core/romaji.js";
import { speak } from "../core/speech.js";
import { esc, shuffle } from "../core/util.js";
import { buildQuestion } from "./catalog.js";
import { bindDifficulty, difficultyBar } from "../views/difficulty.js";

const AUTO_NEXT_MS = { type: 650, choice: 1100 };

// Kana Pro–style session: typed answers are accepted as soon as they are right, Enter means
// "I don't know", and missed questions come back at the end until they are answered correctly.
// `onAnswer(entry, ok)` is called for first tries only; `more()` may return `{ note, label, run }` to
// replace "Recommencer" by a follow-up action on the result screen (used by the Learn mode).
export function startSession(outer, entries, { store, ui, title, onExit, onAnswer, more }) {
  const root = document.createElement("div");
  outer.replaceChildren(root);

  const queue = entries.map((e) => ({ ...e, retry: false }));
  const total = queue.length;
  const errors = new Map();
  const startedAt = Date.now();
  let done = 0;
  let firstTry = 0;
  let current = null;
  let q = null;
  let state = "ask";
  let hinted = false;

  root.innerHTML = `
    <div class="quiz">
      <div class="quiz-top">
        <button class="btn ghost small" data-act="quit">✕ Quitter</button>
        <div class="progress"><div class="progress-bar"></div></div>
        <div class="counter"></div>
      </div>
      <div class="card quiz-card">
        <button class="hint-btn" title="Astuce (touche ?)" aria-label="Astuce">💡</button>
        <button class="speak" title="Écouter (touche S)" aria-label="Écouter">🔊</button>
        <div class="q-label"></div>
        <div class="q-prompt"></div>
        <div class="q-meanings"></div>
        <div class="q-sub"></div>
        <div class="q-tip"></div>
        <div class="q-answer"></div>
        <div class="q-feedback"></div>
      </div>
      <div class="quiz-hint muted"></div>
      ${difficultyBar()}
    </div>`;

  const $ = (s) => root.querySelector(s);
  const card = $(".quiz-card");
  const setHint = (text) => {
    $(".quiz-hint").textContent = text;
  };

  $("[data-act=quit]").onclick = () => finish(true);
  $(".speak").onclick = () => speak(q?.speak);
  $(".hint-btn").onclick = () => showTip();

  // Reading aids follow the difficulty settings and can change while a question is on screen.
  function renderAids() {
    const s = store.settings;
    const notes = (n) => [s.showReading && n?.reading, s.romaji && n?.romaji].filter(Boolean).join(" · ");
    $(".q-meanings").innerHTML = q.meaningsOf ? ui.meanings(q.meaningsOf) : "";
    $(".q-sub").textContent = [notes({ reading: q.subReading, romaji: q.subRomaji }), q.sub]
      .filter(Boolean)
      .join(" · ");
    root.querySelectorAll(".opt-ro").forEach((el) => {
      el.textContent = notes(q.optionNotes[q.options[Number(el.dataset.i)]]);
    });
  }
  bindDifficulty(root, store, () => {
    if (state === "end") return;
    renderAids();
    $(".answer-input")?.focus();
  });

  function updateProgress() {
    $(".progress-bar").style.width = `${(100 * done) / total}%`;
    $(".counter").textContent = `${done} / ${total}`;
  }

  function showTip() {
    if (state !== "ask" || !q.tip) return;
    hinted = true;
    $(".q-tip").innerHTML = ui.tipBox(q, { withDrawing: q.drawingInHint });
    $(".answer-input")?.focus();
  }

  function next() {
    if (!queue.length) return finish(false);
    current = queue.shift();
    q = buildQuestion(current.item, current.mode, { tipFor: ui.tipFor });
    state = "ask";
    hinted = false;
    card.classList.remove("ok", "ko");
    card.onclick = null;
    $(".q-label").textContent = q.label + (current.retry ? " · à revoir" : "");
    $(".q-prompt").className = `q-prompt ${q.promptClass}`;
    $(".q-prompt").textContent = q.prompt;
    $(".q-tip").innerHTML = "";
    $(".q-feedback").className = "q-feedback";
    $(".q-feedback").innerHTML = "";
    $(".speak").hidden = !q.speak;
    $(".hint-btn").hidden = !q.tip;
    renderAnswer();
    renderAids();
    updateProgress();
  }

  function renderAnswer() {
    const box = $(".q-answer");
    if (q.kind === "type") {
      box.innerHTML = `<input class="answer-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="rōmaji…">`;
      const input = box.querySelector("input");
      input.oninput = () => {
        if (state === "ask" && matches(input.value, q.answers)) answer(true);
      };
      input.focus();
      setHint("Tape la réponse — validation automatique. Entrée si tu ne sais pas.");
      return;
    }
    const note = (i) => (q.optionNotes ? `<span class="opt-ro" data-i="${i}"></span>` : "");
    box.innerHTML = `<div class="options">${q.options
      .map(
        (o, i) =>
          `<button class="opt ${q.optionClass ?? ""}" data-i="${i}"><span class="num">${i + 1}</span>${esc(o)}${note(i)}</button>`
      )
      .join("")}</div>`;
    box.querySelectorAll(".opt").forEach((b) => {
      b.onclick = () => choose(Number(b.dataset.i));
    });
    setHint(`Clique ou tape 1–${q.options.length}.`);
  }

  function choose(i) {
    if (state !== "ask") return;
    $(".q-answer")
      .querySelectorAll(".opt")
      .forEach((b, j) => {
        if (q.options[j] === q.correct) b.classList.add("right");
        else if (j === i) b.classList.add("wrong");
        b.disabled = true;
      });
    answer(q.options[i] === q.correct);
  }

  function answer(ok) {
    state = ok ? "ok" : "ko";
    card.classList.add(state);
    if (!current.retry) {
      store.record(q.key, ok, hinted);
      if (ok && !hinted) firstTry++;
      onAnswer?.(current, ok && !hinted);
    }
    const input = $(".answer-input");
    if (input) input.disabled = true;

    const fb = $(".q-feedback");
    fb.className = `q-feedback ${ok ? "good" : "bad"}`;
    fb.innerHTML = (ok ? "✓ " : `✗ Réponse : <b>${esc(q.correctText)}</b><br>`) + q.reveal;
    if (store.settings.autoSpeak) speak(q.speak);

    if (ok) {
      done++;
      updateProgress();
      setTimeout(() => {
        if (state === "ok") next();
      }, AUTO_NEXT_MS[q.kind]);
      return;
    }

    if (q.tip && !hinted && store.settings.tipOnError)
      fb.insertAdjacentHTML("beforeend", ui.tipBox(q, { withDrawing: true }));
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn primary next-btn";
    nextBtn.textContent = "Suivant →";
    nextBtn.onclick = (ev) => {
      ev.stopPropagation();
      next();
    };
    fb.append(nextBtn);

    const err = errors.get(q.key) ?? { q, count: 0 };
    errors.set(q.key, { q, count: err.count + 1 });
    queue.push({ item: current.item, mode: current.mode, retry: true });
    setHint("Entrée ou « Suivant » pour continuer — cette question reviendra plus tard.");
  }

  function onKey(ev) {
    if (!root.isConnected) return document.removeEventListener("keydown", onKey);
    if (ev.key === "Enter") {
      ev.preventDefault();
      if (state === "ko" || state === "ok") return next();
      if (q.kind === "type") answer(false);
    } else if (ev.key === "?") {
      ev.preventDefault();
      showTip();
    } else if (state === "ask" && q.kind === "choice" && /^[1-9]$/.test(ev.key) && Number(ev.key) <= q.options.length) {
      choose(Number(ev.key) - 1);
    } else if (ev.key.toLowerCase() === "s" && q.kind !== "type") {
      speak(q.speak);
    }
  }
  document.addEventListener("keydown", onKey);

  function finish(quit) {
    document.removeEventListener("keydown", onKey);
    state = "end";
    const secs = Math.round((Date.now() - startedAt) / 1000);
    if (done || errors.size) store.logSession({ title, total, firstTry, secs });
    const pct = total ? Math.round((100 * firstTry) / total) : 0;
    const missed = [...errors.values()].sort((a, b) => b.count - a.count);
    const follow = more?.();

    root.innerHTML = `
      <div class="card result">
        <h2>${quit ? "Session interrompue" : "Session terminée"}</h2>
        <div class="stats-row">
          <div class="stat"><div class="stat-num">${pct}%</div><div class="stat-lbl">réussi du premier coup</div></div>
          <div class="stat"><div class="stat-num">${firstTry}/${total}</div><div class="stat-lbl">bonnes réponses</div></div>
          <div class="stat"><div class="stat-num">${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</div><div class="stat-lbl">durée</div></div>
        </div>
        ${
          missed.length
            ? `<h3>À retravailler (${missed.length})</h3>
          <table class="table"><thead><tr><th>Question</th><th>Réponse</th><th>Erreurs</th></tr></thead><tbody>
          ${missed.map((e) => `<tr><td class="jp">${esc(e.q.short)}</td><td>${esc(e.q.correctText)}</td><td>${e.count}</td></tr>`).join("")}
          </tbody></table>`
            : quit
              ? ""
              : `<p class="center">Aucune erreur, bravo ! すごい！</p>`
        }
        ${follow?.note ? `<p class="center">${follow.note}</p>` : ""}
        <div class="actions">
          ${follow?.label ? `<button class="btn primary" data-act="more">${esc(follow.label)}</button>` : ""}
          ${missed.length && !follow ? `<button class="btn primary" data-act="errors">Revoir mes erreurs</button>` : ""}
          ${follow ? "" : `<button class="btn" data-act="again">Recommencer</button>`}
          <button class="btn ghost" data-act="back">Retour</button>
        </div>
      </div>`;
    const retryErrors = entries.filter((e) => errors.has(e.item.key));
    root
      .querySelector("[data-act=errors]")
      ?.addEventListener("click", () => startSession(outer, shuffle(retryErrors), { store, ui, title, onExit }));
    root.querySelector("[data-act=more]")?.addEventListener("click", follow.run);
    root
      .querySelector("[data-act=again]")
      ?.addEventListener("click", () => startSession(outer, shuffle(entries), { store, ui, title, onExit }));
    root.querySelector("[data-act=back]").onclick = onExit;
  }

  next();
}
