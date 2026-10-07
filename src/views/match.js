import { esc, shuffle } from "../core/util.js";
import { bindDifficulty, difficultyBar } from "./difficulty.js";

const PAIRS = 6;
const PENALTY_MS = 1000;

const seconds = (ms) => (ms / 1000).toFixed(1).replace(".", ",");

// Quizlet-style matching game: pair each Japanese word with its meaning, against the clock.
export function startMatch(outer, items, { store, best, onBest, onExit }) {
  const root = document.createElement("div");
  outer.replaceChildren(root);

  const words = shuffle(items).slice(0, PAIRS);
  const tiles = shuffle(
    words.flatMap((w) => [
      { key: w.key, side: "jp", text: w.jp, reading: w.jp !== w.kana ? w.kana : "", romaji: w.romaji },
      { key: w.key, side: "fr", text: w.fr }
    ])
  );
  const startedAt = Date.now();
  let penalty = 0;
  let left = words.length;
  let selected = null;

  root.innerHTML = `
    <div class="match">
      <div class="quiz-top">
        <button class="btn ghost small" data-act="quit">✕ Quitter</button>
        <div class="match-timer">0,0 s</div>
        <div class="counter">${best ? `record ${seconds(best)} s` : ""}</div>
      </div>
      <div class="match-grid">${tiles
        .map(
          (t, i) =>
            `<button class="match-tile ${t.side}" data-i="${i}">${esc(t.text)}<span class="opt-ro"></span></button>`
        )
        .join("")}</div>
      <div class="quiz-hint muted">Associe chaque mot japonais à son sens. Une erreur coûte 1 seconde.</div>
      ${difficultyBar()}
    </div>`;

  const renderAids = () => {
    const s = store.settings;
    root.querySelectorAll(".match-tile").forEach((b) => {
      const t = tiles[Number(b.dataset.i)];
      b.querySelector(".opt-ro").textContent = [s.showReading && t.reading, s.romaji && t.romaji]
        .filter(Boolean)
        .join(" · ");
    });
  };
  bindDifficulty(root, store, renderAids);
  renderAids();

  const elapsed = () => Date.now() - startedAt + penalty;
  const timer = setInterval(() => {
    if (!root.isConnected) return clearInterval(timer);
    root.querySelector(".match-timer").textContent = `${seconds(elapsed())} s`;
  }, 100);

  function click(button) {
    const tile = tiles[Number(button.dataset.i)];
    if (button.classList.contains("ok")) return;
    if (!selected) {
      selected = { tile, button };
      button.classList.add("sel");
      return;
    }
    const first = selected;
    selected = null;
    first.button.classList.remove("sel");
    if (first.button === button) return;

    const ok = first.tile.key === tile.key && first.tile.side !== tile.side;
    const pair = [first.button, button];
    if (ok) {
      pair.forEach((b) => {
        b.classList.add("ok");
        b.disabled = true;
      });
      setTimeout(() => pair.forEach((b) => b.classList.add("gone")), 350);
      if (--left === 0) finish();
      return;
    }
    penalty += PENALTY_MS;
    pair.forEach((b) => b.classList.add("ko"));
    setTimeout(() => pair.forEach((b) => b.classList.remove("ko")), 350);
  }

  root.querySelectorAll(".match-tile").forEach((b) => {
    b.onclick = () => click(b);
  });
  root.querySelector("[data-act=quit]").onclick = onExit;

  function finish() {
    clearInterval(timer);
    const time = elapsed();
    const record = !best || time < best;
    if (record) onBest(time);
    root.innerHTML = `
      <div class="card result">
        <h2>${record ? "Nouveau record !" : "Terminé !"}</h2>
        <div class="stats-row">
          <div class="stat"><div class="stat-num">${seconds(time)} s</div><div class="stat-lbl">ton temps</div></div>
          <div class="stat"><div class="stat-num">${seconds(record ? time : best)} s</div><div class="stat-lbl">record</div></div>
          <div class="stat"><div class="stat-num">${penalty / PENALTY_MS}</div><div class="stat-lbl">erreurs</div></div>
        </div>
        <div class="actions">
          <button class="btn primary" data-act="again">Rejouer</button>
          <button class="btn ghost" data-act="back">Retour</button>
        </div>
      </div>`;
    root.querySelector("[data-act=again]").onclick = () =>
      startMatch(outer, items, { store, best: record ? time : best, onBest, onExit });
    root.querySelector("[data-act=back]").onclick = onExit;
  }
}
